---
interpolate: true
---
/* global app */

app.search = {

  abort : function() {
    // abort previous request if we are running a new one
    if(app.search.currentRequest && app.search.currentRequest.readyState !== 4) {
      app.search.currentRequest.abort();
    }
  },
  fetch :function(query) {

    // perform ajax request
    $.ajax({
      url : '#{URI.join site.dcp_base_url, "v1/rest/search"}',
      data : {
        "field"  : ["contributors", "duration", "github_repo_url", "level", "sys_contributors",  "sys_created", "sys_description", "sys_title", "sys_url_view", "thumbnail", "sys_type"],
        "query" : query,
        "size" : 10
      },
      beforeSend : function() {
        app.search.abort();
      },
      success : function(data) {
        app.search.format(query, data.hits.hits);
      }
    });

  },
  format : function(query, results) {
    var suggestions = $('<ul>');
    for (var i = 0; i < results.length; i++) {
      var title = results[i].fields.sys_title;
      var searchRegEx = new RegExp(query,"gi");
      title = title.replace(searchRegEx,'<span class="highlight">'+query+'</span>');
      suggestions.append('<li><a href="/events">'+ title  +'</a></li>');
    };
    $('.searchResults').html(suggestions);
  }

};

// binding
$(function() {
  $('form.search').on('submit',function(e){
    e.preventDefault();
  });

  $('form.search').on('keyup','input',function(e) {
    
    /*
      Check for enter / return key 
    */ 

    if(e.keyCode == 13) {
      var link = $('.searchResults li.active-item a');
      window.location.assign(link[0].href);
      // .click();
      return;
    }

    /*
      Check for up / down arrows
    */

    if(e.keyCode === 38 || e.keyCode === 40) {
      if(e.keyCode === 38) { // up arrow
        e.preventDefault(); // stop the cursor from going to the front of the input box
        var activeItem = $('.searchResults li.active-item').prev();
      }
      else { // down arrow
        var activeItem = $('.searchResults li.active-item').next();
      }

      // check if there is a selected item in the list
      if(!activeItem.length && e.keyCode === 40) { // nothing and down arrow
        activeItem = $('.searchResults li:first');
      }

      if(!activeItem.length && e.keyCode === 38) { // nothing and up arrow
        activeItem = $('.searchResults li:last');
      }

      $('.active-item').removeClass('active-item');
      activeItem.addClass('active-item');
    }
    
    /*
      Otherwise suggest search results
    */
    else {
      var query = $(this).val();
      if(!query) {
        $('.searchResults').html('');
        return;
      }
      app.search.fetch(query);
    }
  });

  // When someone hovers over a selection, remove
  $('.searchResults').on('mouseover','li',function() {
    $('li.active-item').removeClass('active-item');
  });

  $('.search-close').on('click',function(e){
    console.log("Closed");
    $('form.search input').val('');
    $('.searchResults').html('');
  });

});