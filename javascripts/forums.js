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
     var chart = new google.visualization.LineChart(value),
         dataArray = [['Day', 'Count']],
         lastMonth = new Date((new Date()).setMonth(new Date().getMonth() - 1));
     if (data.hits.total > 0) {
       $(data.facets.activity_dates_histogram.entries).each(function(i, v) {
         var nextDate = new Date(v.time);
         if (nextDate > lastMonth) {
           var peekedItem = dataArray.peek();
           if (typeof peekedItem !== 'undefined' && peekedItem[0] instanceof Date) {
             // Pad form the last date to the next date
             for (var i = peekedItem[0].getDate(); i < nextDate.getDate(); i++) {
               dataArray.push([new Date(peekedItem[0].setDate(i)), 0]); // Add a new day with 0 for the count of posts
             }
           }
           dataArray.push([nextDate, v.count])
         }
       });
     } else { // Fake a straight line
       for (var i = 1; i < 5; i++) {
         dataArray.push([new Date(lastMonth.setDate(i)),0]);
       }
     }

     var chartOptions = {
       axisTitlesPosition : 'none',
       enableInteractivity: false,
       crosshair : {
         opacity :  0.0
       },
       legend : {
         position : 'none'
       },
       hAxis : {
         gridlines : {
           color : '#FFF'
         },
         baselineColor : '#FFF',
         textStyle : {
           color : '#FFF'
         }
       },
       vAxis : {
         gridlines : {
           color : '#FFF'
         },
         baselineColor : '#FFF',
         textStyle : {
           color : '#FFF'
         }
       },
     };
     chart.draw(google.visualization.arrayToDataTable(dataArray), chartOptions);
   });
 });
}

google.load("visualization", "1.0", {"packages":["corechart"]});
google.setOnLoadCallback(app.forums.chart);
