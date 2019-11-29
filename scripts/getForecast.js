/**This module only deals with the forecast data, and it should be good
to add functions realted to find the forecast with lat and long as it goes**/
// import { create, all } from 'mathjs'

//*** REQUIRE LIBRARIES***///
var Plotly = require('plotly.js-dist');
var $ = require("jquery");
var returnPeriods=require('./getReturnPeriods.js');
// const config = { }
var math=require('mathjs');
// var create=
// const math = create(all, config)

//**GLOBAL VARIABLES TO DEAL WITH THE FUNCTIONS**//
var dates = {highres: [], dates: []};
var values = {highres: [], max: [], mean: [], min: [], std_dev_range_lower: [], std_dev_range_upper: []};
var returnShapes;
var endpoint="https://tethys2.byu.edu/localsptapi/api/"

//** THIS FUNCTIONS RETRIEVES THE FORECAST DATA IN A GRAPH **//

module.exports= {
  graph_f: function(reachid,htmlELement,add, width,height){
  width = (typeof width !== 'undefined') ?  width : 500;
  height = (typeof heigth !== 'undefined') ?  heigth : 500;
  add = (typeof width !== 'undefined') ?  width : false;
  var layer_URL=endpoint +"ForecastEnsembles/?reach_id="+reachid+"&return_format=csv";
    $.ajax({
      type: 'GET',
      url: layer_URL,
      success: function(data) {
        var allLines = data.split('\n');
        var headers = allLines[0].split(',');
        for (var i=1; i < allLines.length-1; i++) {
          var data = allLines[i].split(',');

           if (data[1] !== 'nan' ) {
              if(data[data.length-1]!=='nan'){
                dates.highres.push(data[0]);
                values.highres.push(data[data.length-1]);
              }
              data.pop();

              dates.dates.push(data[0]);
              data.shift();
              values.max.push(math.max(data));

              var average=math.mean(data);
              values.mean.push(average);
              values.min.push(math.min(data));
              var standardDev=math.std(data);
              var lowstandardDev= average-standardDev;
              var upperstandardDev= average+standardDev;
              values.std_dev_range_lower.push(lowstandardDev);
              values.std_dev_range_upper.push(upperstandardDev);
          }
      }
    },
    complete: function() {
        var mean = {
            name: 'Mean',
            x: dates.dates,
            y: values.mean,
            mode: "lines",
            line: {color: 'blue'}
        };

        var max = {
            name: 'Max',
            x: dates.dates,
            y: values.max,
            fill: 'tonexty',
            mode: "lines",
            line: {color: 'rgb(152, 251, 152)', width: 0}
        };
        // console.log("max in complete form");
        // console.log(max);
        var min = {
            name: 'Min',
            x: dates.dates,
            y: values.min,
            fill: 'none',
            mode: "lines",
            line: {color: 'rgb(152, 251, 152)'}
        };

        var std_dev_lower = {
            name: 'Std. Dev. Lower',
            x: dates.dates,
            y: values.std_dev_range_lower,
            fill: 'tonexty',
            mode: "lines",
            line: {color: 'rgb(152, 251, 152)', width: 0}
        };

        var std_dev_upper = {
            name: 'Std. Dev. Upper',
            x: dates.dates,
            y: values.std_dev_range_upper,
            fill: 'tonexty',
            mode: "lines",
            line: {color: 'rgb(152, 251, 152)', width: 0}
        };

        var data = [min, max, std_dev_lower, std_dev_upper, mean];

        if(values.highres.length > 0) {
            var highres = {
                name: 'HRES',
                x: dates.highres,
                y: values.highres,
                mode: "lines",
                line: {color: 'black'}
            };

            data.push(highres)
        }
         var layout = {
             width:width,
             height:height,
             title:'Forecast<br>' + ' Reach ID: ' + reachid,
             xaxis: {title: 'Date'},
             //yaxis: {title: 'Streamflow m3/s', range: [0, Math.max(...values.max) + Math.max(...values.max)/5]},
             yaxis: {title: 'Streamflow m3/s', range: [0, Math.max(...data[1].y) + Math.max(...data[1].y)/5]},
             //shapes: returnShapes,
         };

         //Removing any exisisting element with the same name//

         var divELement=document.getElementById("graph");
         if(divELement != null && add==false){
           Plotly.purge(divELement);
           divELement.remove();
           console.log("removing");
         };
         console.log(divELement);
         console.log(add);

         divELement=document.createElement('div');
         divELement.setAttribute("id", "graph");
         divELementParent= document.getElementById(htmlELement);
         divELementParent.append(divELement);


         Plotly.newPlot('graph', data, layout);
         var index = data[0].x.length-1;
         // index=index.length;

         // console.log("printing indexes");
         // console.log(data[0].x[0]);
         // console.log(data[0].x[index]);
         // for(var i=0; i<data[0].x.length;i++){
         //   console.log(i);
         //   console.log(data[0].x[i]);
         //
         // };
         returnPeriods.graph_rp(reachid, data[0].x[0], data[0].x[index],width,height);
         // getreturnperiods(reachid, data[0].x[0], data[0].x[index],width,height);

         dates.highres = [], dates.dates = [];
         values.highres = [], values.max = [], values.mean = [], values.min = [], values.std_dev_range_lower = [], values.std_dev_range_upper = [];
      },
  });
  }
}
