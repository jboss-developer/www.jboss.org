app.forums = {};

app.forums.chart = function() {
 $('td.histogram > div').each(function(index, value) {
   var forumName = $(value).data('forum-name');
   $.ajax({
     url: app.dcp.url.search,
     dataType: 'json',
     data: {
       "activity_date_interval" : "month",
       "facet" : "activity_dates_histogram",
       "project" : forumName,
       "sys_type" : "forumthread",
       "size" : 0
     }
   }).done(function(data) {
     if (data.hits.total > 0) {
       var chart = new google.visualization.LineChart(value);
       var dataArray = [['Day', 'Count']];
       var lastMonth = new Date((new Date()).setMonth(new Date().getMonth() - 1));

       $(data.facets.activity_dates_histogram.entries).each(function(i, v) {
         if ((new Date(v.time)) > lastMonth) {
           dataArray.push([new Date(v.time), v.count])
         }
       });

       var chartOptions = {
         axisTitlesPosition : "none"
       };
       chart.draw(google.visualization.arrayToDataTable(dataArray), chartOptions);
     }
   });
 });
}
