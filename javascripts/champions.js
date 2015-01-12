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
            var props = hits[i].fields;

            for (var accountIndex = 0; accountIndex < props.accounts.length; accountIndex++) {
                var account = props.accounts[accountIndex];
                if (account.domain === "twitter.com") {
                    props.twitter_link = account.link;
                }
                else if (account.domain === "linkedin.com") {
                    props.linkedin_link = account.link;
                }
                else if (account.domain === "linkedin.com") {
                    props.linkedin_link = account.link;
                }
                else if (account.domain === "linkedin.com") {
                    props.linkedin_link = account.link;
                }
            }

            //The templating fails if these values are undefined. There's probably a better way to do this.
            if (!props.twitter_link) {
                props.twitter_link = '';
            }
            if (!props.linkedin_link) {
                props.linkedin_link = '';
            }
            
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

