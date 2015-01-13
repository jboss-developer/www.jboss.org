---
interpolate: true
---

var dcp = angular.module('dcp', []);

dcp.service('materialService',function($http, $q) {

  this.getMaterials = function(searchTerms, project) {
    var query = {
      "field"  : ["sys_author", "target_product", "contributors", "duration", "github_repo_url", "level", "sys_contributors",  "sys_created", "sys_description", "sys_title", "sys_tags", "sys_url_view", "thumbnail", "sys_type", "sys_rating_num", "sys_rating_avg", "experimental"],
      "size" : 500,
      "content_provider" : ["jboss-developer", "rht"]
    };

    if(searchTerms) {
      query.query = decodeURIComponent(searchTerms); // stop it from being encoded twice
      console.log(searchTerms)
    }

    if(project) {
      query.project = project;
    }

    var deferred = $q.defer();
    // app.dcp.url.search = "//dcp.jboss.org/v1/rest/search"; // testing with live data
    $http.get(app.dcp.url.search, { params : query }).success(function(data){
      deferred.resolve(data);
    });
    return deferred.promise;
  }

});

/*
  Filter to determine which thumbnail to return
*/
dcp.filter('thumbnailURL',function(){
  return function(item) {
    var thumbnails = {
      // jboss
      "jbossdeveloper_quickstart" : "#{cdn( site.base_url + '/images/design/get-started/jbossdeveloper_quickstart.png')}",
      "jbossdeveloper_archetype" : "#{cdn( site.base_url + '/images/design/get-started/jbossdeveloper_archetype.png')}",
      "jbossdeveloper_bom" : "#{cdn( site.base_url + '/images/design/get-started/jbossdeveloper_bom.png')}",
      // futurerproof for when jboss goes unprefixed
      "quickstart" : "#{cdn( site.base_url + '/images/design/get-started/jbossdeveloper_quickstart.png')}",
      "archetype" : "#{cdn( site.base_url + '/images/design/get-started/jbossdeveloper_archetype.png')}",
      "bom" : "#{cdn( site.base_url + '/images/design/get-started/jbossdeveloper_bom.png')}",
      "demo" : "#{cdn( site.base_url + '/images/design/get-started/jbossdeveloper_demo.png')}",
      // redhat
      "solution" : "#{cdn( site.base_url + '/images/design/get-started/solution.png')}",
      "article" : "#{cdn( site.base_url + '/images/design/get-started/article.png')}",
      // need icons?
      "rht_knowledgebase_article" : "#{cdn( site.base_url + '/images/design/get-started/article.png')}",
      "rht_knowledgebase_solution" : "#{cdn( site.base_url + '/images/design/get-started/solution.png')}",
      "jbossdeveloper_vimeo" : "#{cdn( site.base_url + '/images/design/get-started/article.png')}",
      "jbossdeveloper_connector" : "#{cdn( site.base_url + '/images/design/get-started/article.png')}"
    };
    if(item.fields.thumbnail) {
      return item.fields.thumbnail;
    }
    else {
      return thumbnails[item._type];
    }
  }

});

dcp.filter('stars',['$sce',function($sce){
  return function(fields) {
    var html = "";
    var fullStars = fields.sys_rating_avg || 0;
    var emptyStars = 5 - fullStars;
    html += new Array(fullStars + 1).join("<i class='fa fa-star'></i>");
    html += new Array(emptyStars + 1).join("<i class='fa fa-star-o'></i>");
    return $sce.trustAsHtml(html);
  }
}]);

/*
  Filter to return whether or not an item is premium
*/
dcp.filter('isPremium',function() {
  return function(url) {
    if(url) {
      return !!url.match("access.redhat.com");
    }
    else {
      return false;
    }
  }
});

/*
  Filter to format time
*/
dcp.filter('HHMMSS',function() {
  return function(seconds) {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}

    var time    = minutes+':'+seconds;
    // only show hours if there are some
    if(parseInt(hours) > 0) {
      time = hours+':'+ time;
    }
    return time;
  }
});

/*
  Filter to return human readable time ago
*/
dcp.filter('timeAgo',function() {
  return function(timestamp){
    if(!timestamp) return;

    var date = new Date(timestamp);
    return $.timeago(date);
  }
});

/*
  Filter to trim whitespace
*/
dcp.filter('trim',function() {
  return function(str){
    return str.trim();
  }
});

/*
  Return just the name, no email
*/
dcp.filter('name',function(){
  return function(str){
    str = str || "";
    var pieces = str.split('<');
    if(pieces.length) {
      return pieces[0].trim()
    }
    else {
      return;
    }
  }
});

/*
  Pagination Directive
*/

dcp.directive('pagination',function() {
  return {
    restrict : 'E',
    compile: function(element, attrs){
      element.replaceWith("Testing testing 123");
    }
  }
});

dcp.controller('developerMaterialsController', function($scope, materialService) {

  window.scope = $scope;
  $scope.data = {};
  $scope.filters = {};
  $scope.pagination = {
    size : 9
  };

  /*
    Handle Pagination
  */
  $scope.paginate = function(page) {
    $scope.pagination.size = ($scope.pagination.viewall ? 500 : 9);
    var startAt = (page * $scope.pagination.size) - $scope.pagination.size;
    var endAt = page * $scope.pagination.size;
    var pages = Math.ceil($scope.data.materials.length / $scope.pagination.size);

    // do nothing if we have no more pages
    if(page > pages || page < 1 || typeof page === "string") {
      return;
    }

    $scope.paginate.pages = pages;
    // $scope.paginate.pagesArray = new Array(pages);
    $scope.paginate.currentPage = page;

    // $scope.data.displayedMaterials = [];
    $scope.data.displayedMaterials = $scope.data.materials.slice(startAt,endAt);

    // pagination display logic
    $scope.paginate.pagesArray = app.utils.diplayPagination($scope.paginate.currentPage, pages, 4);

    // next tick
    window.setTimeout(function() {
      app.dcp.resolveContributors();
    },0);
  }

  /*
    Handle Filters
  */
  $scope.filters = {}; // stores data
  $scope.filter = {}; // stores util functions

  $scope.data.availableTopics = #{site.dev_mat_techs.flatten.uniq.sort};

  $scope.data.availableFormats = [
    { value : "jbossdeveloper_quickstart" , "name" : "Quickstart" },
    { value : "video" , "name" : "Video" },
    { value : "demo" , "name" : "Demo" },
    { value : "jbossdeveloper_example" , "name" : "Tutorial" },
    { value : "jbossdeveloper_archetype" , "name" : "Archetype" },
    { value : "jbossdeveloper_bom" , "name" : "BOM" },
    { value : "jbossdeveloper_sandbox" , "name" : "Early Access" },
    { value : "article" , "name" : "Articles (Premium)" },
    { value : "solution" , "name" : "Solutions (Premium)" }
  ];

  $scope.filters.sys_tags = [];
  $scope.filters.sys_type = [];
  $scope.filter.toggleSelection = function toggleSelection(itemName, selectedArray) {
      var idx = $scope.filters[selectedArray].indexOf(itemName);

      // is currently selected
      if (idx > -1) {
        $scope.filters[selectedArray].splice(idx, 1);
      }

      // is newly selected
      else {
        $scope.filters[selectedArray].push(itemName);
      }
  };

  /*
    Update skill level when the range input changes
  */
  $scope.filter.updateSkillLevel = function() {
    var n = parseInt($scope.data.skillNumber);
    var labels = ["All", "Beginner", "Intermediate", "Advanced"];
    $scope.data.displaySkill = labels[n];
    switch (n) {
      case 0 :
        delete $scope.filters.level;
        break;
      case 1 :
        $scope.filters.level = "Beginner";
        break;
      case 2 :
        $scope.filters.level = "Intermediate";
        break;
      case 3 :
        $scope.filters.level = "Advanced";
        break;
    }
  }

  /*
    Update date when the range input changes
  */
  $scope.filter.updateDate = function() {
    var n = parseInt($scope.data.dateNumber);
    var d = new Date();
    var labels = ["All", "Within 1 Year", "Within 30 days", "Within 7 days", "Within 24hrs"];
    $scope.data.displayDate = labels[n];

    switch(n) {
      case 0 :
        delete $scope.filters.sys_created;
        break;
      case 1 :
        //Within 1 Year
        d.setFullYear(d.getFullYear() - 1);
        break;
      case 2 :
        //Within 30 days
        d.setDate(d.getDate() - 30);
        break;
      case 3 :
        //Within 7 days
        d.setDate(d.getDate() - 7);
        break;
      case 4 :
        //Within 24 hours
        d.setDate(d.getDate() - 1);
        break;
    }

    if(n) {
      $scope.filters.sys_created = ">=" + d.getDate() + "-" + ( d.getMonth() + 1 ) + "-" + d.getFullYear();
    }
  }

  $scope.filter.clear = function() {
    $scope.filters.sys_tags = [];
    $scope.filters.sys_type = [];
    $scope.data.dateNumber = 0;
    $scope.data.skillNumber = 0;
    delete $scope.filters.query;
    delete $scope.filters.sys_rating_avg;
    delete $scope.filters.level;
    delete $scope.filters.sys_created;
    $(".chosen").trigger("chosen:updated");
  }


  $scope.filter.createString = function() {
    var searchTerms = [];

    if($scope.filters.query){
      searchTerms.push($scope.filters.query);
    }

    if($scope.filters.sys_rating_avg) {
      searchTerms.push("sys_rating_avg:>="+$scope.filters.sys_rating_avg);
    }

    if($scope.filters.sys_tags){
      for (var i = 0; i < $scope.filters.sys_tags.length; i++) {
        searchTerms.push("sys_tags:(\""+$scope.filters.sys_tags[i]+"\")");
      };
    }

    if($scope.filters.sys_type){
      for (var i = 0; i < $scope.filters.sys_type.length; i++) {
        searchTerms.push("sys_type:("+$scope.filters.sys_type[i]+")");
      };
    }

    if($scope.filters.level){
      searchTerms.push("(level:"+$scope.filters.level + "%20OR%20_missing_:level)");
    }

    if($scope.filters.sys_created){
      searchTerms.push("sys_created:"+$scope.filters.sys_created);
    }

    searchTerms = searchTerms.join(" AND ");
    searchTerms = searchTerms.replace(/\s/gi,'+');

    $scope.data.searchTerms = searchTerms;

    return searchTerms;
  };

  $scope.filter.applyFilters = function() {
    $scope.data.displayedMaterials = [];
    $scope.data.loading = true;
    var q = this.createString();

    materialService.getMaterials(q, $scope.filters.project).then(function(data){
      $scope.data.materials = data.hits.hits;
      $scope.data.loading = false;
      $scope.paginate(1); // start at page 1
      $scope.filter.group();
    });

    // save search in local storage
    $scope.filter.store();

    // update the page hash
    window.location.hash = $.param($scope.filters);

  }

  /*
    groups the items together by type so we can provide a count
  */
  $scope.filter.group = function() {
    $scope.data.groups = {};
    for (var i = 0; i < $scope.data.materials.length; i++) {
      (function(sys_type, sys_tags){

        // group the types (formats)
        if($scope.data.groups[sys_type] >= 0) {
          $scope.data.groups[sys_type]++;
        }
        else {
         $scope.data.groups[sys_type] = 0;
        }

        // group the tags (topics)
        if(sys_tags) {

          // we prefix the index with tag- because "demo" is both a tag and a topic
          for (var i = 0; i < sys_tags.length; i++) {
            if($scope.data.groups['tag-' + sys_tags[i]] >= 0) {
              $scope.data.groups['tag-' + sys_tags[i]]++;
            }
            else {
             $scope.data.groups['tag-' + sys_tags[i]] = 0;
            }
          };

        }

      })($scope.data.materials[i].fields.sys_type, $scope.data.materials[i].fields.sys_tags);
    };
  }

  $scope.filter.store = function() {
    // check if we have local storage, abort if not
    if(!window.localStorage) { return; }
    // store them in local storage
    window.localStorage.filters = JSON.stringify(scope.filters);
    window.localStorage.filtersTimeStamp = new Date().getTime();
  }

  $scope.filter.restore = function() {
    // if we are on a project page, skip restoring
    if($scope.filters.project) {
      $scope.filter.applyFilters(); // run with no filters
      return;
    }

    // check if we have window hash,  local storage or any stored filters, abort if not
    if(!window.location.hash && (!window.localStorage || !window.localStorage.filters)) {
      $scope.filter.applyFilters(); // run with no filters
      return;
    }

    if(window.location.hash) {
      var hashFilters = window.location.hash.replace('#','');

      // check for old hash bang in URL
      if(!!window.location.hash.match('#!')) {
        window.location.hash = "";
        $scope.filter.applyFilters();
        return;
      }
      $scope.filters = deparam(hashFilters);
    }
    else if(window.localStorage && window.localStorage.filters) {
      // only restore if less than a day old
      var now = new Date().getTime();
      var then = window.localStorage.filtersTimeStamp || 0;

      if((now - then) < 86400000) {
        $scope.filters = JSON.parse(window.localStorage.filters);
      }
    }

    $scope.filter.applyFilters();
  }


  $scope.chosen = function() {
    $('select.chosen').unbind().chosen().change(function() {
      var tags = $(this).val();
      if(tags) {
        $scope.filters.sys_tags = tags;
      }
      else {
        delete $scope.filters.sys_tags;
      }
      $scope.$apply();
      $scope.filter.applyFilters()
      console.log("changed");
    }).trigger('chosen:updated');
  }

  $scope.$watch('data.availableTopics',function(){

    // next tick
    window.setTimeout(function(){
      $scope.chosen();
    },0);

  });

  $scope.$watch('data.groups',function() {
    window.setTimeout(function() {
      $(".chosen").trigger("chosen:updated");
    },0);
  });
  /*
    Get latest materials on page load
  */

  $scope.filter.restore();

});
