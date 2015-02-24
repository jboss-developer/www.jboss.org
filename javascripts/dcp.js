/** DCP HELPERS **/

app.dcp.getNameFromContributor = function( contributor ) {
  return contributor.substring(0, contributor.lastIndexOf("<") - 1);
};

app.dcp.generateContributorSpan = function(tmpl, contributor) {
  var d = {};
  d.contributor = contributor;
  d.contributorName = app.dcp.getNameFromContributor( contributor );
  return tmpl.template( d );
};

/*
 * Resolve an array of contributors, and replace any 
 * span.contributor[data-sys-contributor=<contributor>] elements in the current page
 */
app.dcp.resolveContributors = function(sysContributors) {

  // Remove duplicates
  contributors = sysContributors.unique();

  app.dcp.currentRequest = $.ajax({
    url : app.dcp.url.search,
    data : {
      "sys_type" : "contributor_profile",
      "field"  : ["sys_url_view", "sys_title", "sys_contributors", "accounts", "thumbnailUrl"],
      "contributor" : contributors,
      "size" : contributors.length
    },
    beforeSend : function() {
      // check if there is a previous ajax request to abort
      if(app.dcp.currentRequest && app.dcp.currentRequest.readyState != 4) {
        app.dcp.currentRequest.abort();
      }
    }
  }).done(function(data){
    var hits = data.hits.hits,
        contributorTemplate = app.templates.contributorTemplate;
        contributors = {};
    for (var i = 0; i < hits.length; i++) {
      var accounts = {};
      if (hits[i].fields.accounts) {
        for (var j= 0; j < hits[i].fields.accounts.length; j++) {
          accounts[hits[i].fields.accounts[j].domain] = hits[i].fields.accounts[j].username;
          contributors[hits[i].fields.sys_contributors] = hits[i].fields;
        }
      }
    }
    $( "span[data-sys-contributor]" ).each( function() {
      $(this).html(contributorTemplate.template({"contributor": contributors[$(this).data("sys-contributor")]}));
      $(this).foundation('dropdown');
    });
  });
};

