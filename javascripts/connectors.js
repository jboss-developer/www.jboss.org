---
    interpolate: true
---

app.connectors = {
    open: function (html) {
        $('.overlay-content').html(html);
        $('body').addClass('overlay-open');
    },
    close: function () {
        $('body').removeClass('overlay-open');
        $('.overlay-content').empty();
    },

    fallbackImage: function (el) {
        el.src = "#{cdn( site.base_url + '/images/design/default_connector_200x150.png')}";
    },

    connectorFilter : function(container, target_product) {
        //Currently the only way to specify no limit
        var maxResults = 500;
        var url = app.dcp.url.search;

        //Query returns items where any of the three target products are set to the required product.
        var query = ["(sys_content_type: jbossdeveloper_connector AND (target_product_1: " + target_product + " OR target_product_2: " + target_product + " OR target_product_3: " + target_product + "))"];

        var request_data = {
            "field"  : ["_source"],
            "query" : query,
            "size" : maxResults
        };

        // append loading class to wrapper
        $("ul.results").addClass('loading');

        $.ajax({
            url : url,
            dataType: 'json',
            data : request_data,
            container : container,
            error : function() {
                $('ul.results').html(app.dcp.error_message);
            }
        }).done(function(data){
            var container = this.container || $('ul.results');
            app.connectors.format(data, container);
        });
    },

    format: function (data, container) {
        if (data.responses) {
            var hits = data.responses[0].hits.hits;
        } else {
            var hits = data.hits.hits;
        }
        hits.sortJsonArrayByProperty("_source.sys_title");
        var html = "";
        // loop over every hit

        for (var i = 0; i < hits.length; i++) {
            var props = hits[i]._source;

            var imgsrc = "http://static.jboss.org/connectors/" + props.id + "_200x150.png";

            //Temporary hack to fix description size. this is being fixed at source.
            var shortDescription = props.sys_description;
            if (shortDescription.length > 150 ) {
                shortDescription = shortDescription.slice(0,146).concat(' ...');
            }

            var template = "<li class=\"connector\">"
                + "<a class=\"fn-open-connector\" href=\"#\"><img class=\"connector-logo\" onerror=\"app.connectors.fallbackImage(this)\" src='" + imgsrc + "'></a>"
                + "<h3><a class=\"fn-open-connector\" href=\"#\">" + props.sys_title +  "</a></h3>"
                + "<p>" + shortDescription + "</p>"
                + "  <div class=\"connector-overlay-content\">"
                + "      <div class=\"row\">"
                + "         <div class=\"large-7 columns\"><img class=\"connector-logo\" onerror=\"app.connectors.fallbackImage(this)\" src=\"" + imgsrc + "\"></div>"
                + "         <div class=\"large-17 columns\">";
            if ('sys_content' in props) {
                template += "            <p>" + props.sys_content + "</p>";
            } else {
                template += "            <p>" + props.sys_description + "</p>";
            }

            if (props.code_snippet_1) {
                template += "            <h4>"
                    + "               Connector A"
                    + "               <div class=\"copy-to-clipboard\">"
                    + "                  <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" width=\"110\" height=\"14\" id=\"clippy\">"
                    + "                     <param name=\"movie\" value=\"//static.jboss.org/ffe/0/www/vendor/clippy/clippy.swf\">"
                    + "                     <param name=\"allowScriptAccess\" value=\"always\">"
                    + "                     <param name=\"quality\" value=\"high\">"
                    + "                     <param name=\"scale\" value=\"noscale\">"
                    + "                     <param name=\"FlashVars\" value=\"text=aws-ddb://tableName[?&lt;options&gt;]\">"
                    + "                     <param name=\"bgcolor\" value=\"#FFFFFF\">"
                    + "                     <embed src=\"//static.jboss.org/ffe/0/www/vendor/clippy/clippy.swf\" width=\"110\" height=\"14\" name=\"clippy\" quality=\"high\" allowscriptaccess=\"always\" type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" flashvars=\"text=" + props.code_snippet_1 + "\" bgcolor=\"#FFFFFF\"></embed>"
                    + "                  </object>"
                    + "               </div>"
                    + "            </h4>"
                    + "            <input type=\"text\" value=\"" + props.code_snippet_1 + "\">";
            }

            if (props.code_snippet_2) {
                template += "            <h4>"
                    + "               Connector B"
                    + "               <div class=\"copy-to-clipboard\">"
                    + "                  <object classid=\"clsid:d27cdb6e-ae6d-11cf-96b8-444553540000\" width=\"110\" height=\"14\" id=\"clippy\">"
                    + "                     <param name=\"movie\" value=\"//static.jboss.org/ffe/0/www/vendor/clippy/clippy.swf\">"
                    + "                     <param name=\"allowScriptAccess\" value=\"always\">"
                    + "                     <param name=\"quality\" value=\"high\">"
                    + "                     <param name=\"scale\" value=\"noscale\">"
                    + "                     <param name=\"FlashVars\" value=\"text=aws-ddb://tableName[?&lt;options&gt;]\">"
                    + "                     <param name=\"bgcolor\" value=\"#FFFFFF\">"
                    + "                     <embed src=\"//static.jboss.org/ffe/0/www/vendor/clippy/clippy.swf\" width=\"110\" height=\"14\" name=\"clippy\" quality=\"high\" allowscriptaccess=\"always\" type=\"application/x-shockwave-flash\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\" flashvars=\"text=" + props.code_snippet_2 + "\" bgcolor=\"#FFFFFF\"></embed>"
                    + "                  </object>"
                    + "               </div>"
                    + "            </h4>"
                    + "            <input type=\"text\" value=\"" + props.code_snippet_2 + "\">";
            }

            template += "         </div>"
                + "      </div>"
                + "   </div>"
                + "</li>";

            // Append template to HTML
            html += template;
        }
        // Inject HTML into the DOC
        if(!html) {
            html = "Sorry, no results to display. Please modify your search.";
        }
        container.html(html).removeClass('loading');
        container.prev().find("#connectors-results-label").html(hits.length);
    }
};


$(function () {

    $('ul.results').on('click','a.fn-open-connector',function(e){
        e.preventDefault();
        var html = $(this).parent().parent().find('.connector-overlay-content').html();
        app.connectors.open(html);
    });

    $('.overlay-close').on('click', app.connectors.close);

    app.connectors.connectorFilter($('ul.results'), 'fuse')
});

