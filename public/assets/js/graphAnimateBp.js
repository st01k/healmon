// https://www.rgraph.net/demos/svg-line-filled-dark.html

function drawBpGraph() {
  if (sessionStorage.tbRecords === null) {
    alert("No records exist.");
    $(location).attr("href", "#pageMenu");
  } 
  else {

    var sysAry = new Array();
		var diaAry = new Array();
    var dateAry = new Array();
    getBpHistory(sysAry, diaAry, dateAry);

    var lower = new Array(2);
    var upper = new Array(2);
    getBpBounds(lower, upper);

    drawLines(sysAry, diaAry, upper, lower, dateAry)
  }
}

function getBpHistory(sysAry, diaAry, dateAry) {
  var tbRecords = JSON.parse(sessionStorage.tbRecords);

  tbRecords.sort(compareDates);

  for (var i = 0; i < tbRecords.length; i++) {
    var date = new Date(tbRecords[i].date);
    var m = date.getMonth() + 1;
    var d = date.getDate() + 1;

    // x-axis label
    dateAry[i] = (m + "/" + d);

    // point to plot
    sysAry[i] = parseFloat(tbRecords[i].systolic);
		diaAry[i] = parseFloat(tbRecords[i].diastolic);
  }
}

function getBpBounds(lower, upper) {
  var user = JSON.parse(localStorage.getItem("user"));
  
  upper[0] = upper[1] = 24.9;
  lower[0] = lower[1] = 18.5;
}

function drawLines(sysAry, diaAry, upper, lower, dateAry) {
  new RGraph.SVG.Line({
        id: 'GraphCanvasBp',
        data: [sysAry, diaAry],
        options: {
            backgroundGridVlines: false,
            backgroundGridBorder: false,
            backgroundGridColor: '#999',
            shadow: false,
            textColor: 'white',
            textSize: 11,
            xaxisLabels: dateAry,
            yaxisUnitsPost: '',
            gutterBottom: 35,
            gutterLeft: 50,
            gutterRight: 20,
            gutterTop: 25,
            linewidth: 3,
            filled: true,
            filledAccumulative: true,
            filledColors: [
                'Gradient(rgba(255,0,0,1):rgba(255,0,0,0.3))',
                'Gradient(rgba(0,255,0,1):rgba(0,0,0,0.75))'
            ]
        }
    }).trace();
}