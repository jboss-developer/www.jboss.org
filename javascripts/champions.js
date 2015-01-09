app.champions = {

    connectorFilter : function(keyword, container) {
        //Currently the only way to specify no limit
        var maxResults = 500;
        var url = app.dcp.url.search;

        var request_data = {
            "field"  : ["displayName", "accounts", "aboutMe"],
            "contributor" : "Tom Jenkinson <tom.jenkinson@redhat.com>",
            "size" : maxResults,
            "sys_type" : "contributor_profile"
        };

        // append loading class to wrapper
        $("ul.champions-results").addClass('loading');

        $.ajax({
            url : url,
            dataType: 'json',
            data : request_data,
            container : container,
            error : function() {
                $('ul.champions-results').html(app.dcp.error_message);
            }
        }).done(function(data){
            var container = this.container || $('ul.champions-results');
            app.champions.format(data, container);
        });
    },

    format: function (data, container) {
        if (data.responses) {
            var hits = data.responses[0].hits.hits;
        } else {
            var hits = data.hits.hits;
        }

        var html = "";
        // loop over every hit
        for (var i = 0; i < hits.length; i++) {
            var props = hits[i]._source;
            
            var championsTemplate = app.templates.championsTemplate;
            html += championsTemplate.template(props);

        }

        container.html(html).removeClass('loading');
    }
};


$(function () {

    /*
        All Champions
     */
    var championsResults = $('.champions-results');
    if(championsResults.length) {
        app.champions.connectorFilter(null, $('ul.champions-results'));
    }

});

