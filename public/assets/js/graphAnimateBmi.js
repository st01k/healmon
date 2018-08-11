// https://www.rgraph.net/demos/svg-line-effect-trace.html

function drawBmiGraph() {
  if (sessionStorage.tbRecords === null) {
    alert("No records exist.");
    $(location).attr("href", "#pageMenu");
  } 
  else {
    var BMIary = new Array();
    var dateAry = new Array();
    getBmiHistory(BMIary, dateAry);

    drawTheLines(BMIary, dateAry)
  }
}

function getBmiHistory(BMIary, dateAry) {
  var tbRecords = JSON.parse(sessionStorage.tbRecords);  
  tbRecords.sort(compareDates);  

  for (var i = 0; i < tbRecords.length; i++) {
    var date = new Date(tbRecords[i].date);
    var m = date.getMonth() + 1;
    var d = date.getDate() + 1;

    dateAry[i] = (m + "/" + d);
    BMIary[i] = parseFloat(tbRecords[i].bmi);
  }
}

function drawTheLines(BMIary, dateAry) {

  new RGraph.SVG.Line({
        id: 'GraphCanvasBmi',
        data: BMIary,
        options: {
            backgroundGridVlinesCount: 11,
            hmargin: 0,
            textColor: 'white',
            textSize: 11,
            textFont: 'Verdana',
            colors: ['#5AF'],
            gutterLeft: 65,
            gutterRight: 40,
            gutterBottom: 50,
            gutterTop: 20,
            yaxis: false,
            xaxis: false,
            yaxisUnitsPost: '%',
            tickmarksStyle: 'circle',
            tickmarksFill: 'black',
            tickmarksLinewidth: 2,
            tickmarksSize: 6,
            linewidth: 4,
            spline: true,
            xaxisLabels: dateAry
        }
    }).trace();
}