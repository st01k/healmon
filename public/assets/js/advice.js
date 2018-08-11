function advicePage() {
  if (sessionStorage.tbRecords === null) {
    alert("No Entries Exist");
    $(location).attr("href", "#pageMenu");
  } 
	else {
    var bmi = getCurrBmi();
    var c = document.getElementById("AdviceCanvas");
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#444";
    ctx.textAlign = "center";
    ctx.font = "16px Arial";
    drawAdviceCanvas(ctx, bmi);
  }
}

function drawAdviceCanvas(ctx, bmi) {
   ctx.fillStyle = "#ccc";
   ctx.fillText("Current BMI: " + bmi + "% kg/m^2", 150, 350);
   ctx.fillText("Target weight: " + getMinWeight() + " - " + getMaxWeight() + " lbs", 150, 380);

   var cat = getBmiCategory();

   if (cat == "under" ) writeAdvice(ctx, "yellow");
   else if (cat == "normal" ) writeAdvice(ctx, "green");
   else if (cat == "over" ) writeAdvice(ctx, "orange");
   else if (cat == "obese" ) writeAdvice(ctx, "red");
   else alert("Error");
   buildMeter(ctx, bmi);
}

function writeAdvice(ctx, level) {
  var adviceLine1 = "";
  var adviceLine2 = "";

  switch(level) {
    case "red" : 
      adviceLine1 = "Put down the honey bun";
      adviceLine2 = "and go for a jog.";
      break;
    case "orange" : 
      adviceLine1 = "Keep active and don't eat";
      adviceLine2 = "anything after 6pm.";
      break;
    case "green" : 
      adviceLine1 = "Keep up the good work.";
      break;
    case "yellow" : 
      adviceLine1 = "You're underweight.";
      adviceLine2 = "Eat more carbs.";
      break;
  }

  ctx.fillText("Your BMI is in the " + level + ".", 150, 410);
  ctx.fillText(adviceLine1, 150, 440);
  ctx.fillText(adviceLine2, 150, 470);

  var sys = getCurrSys();
  var dia = getCurrDia();
  ctx.fillText("Blood Pressure: " + sys + " / " + dia + " mmHg", 150, 500);
  ctx.fillText("BP Status: " + getBpCategory(), 150, 530);
}

function buildMeter(ctx, bmi) {
  if (bmi <= 40) {
    var meter = new RGraph.Meter(
        "AdviceCanvas", 0, 40, bmi)
      .Set("chart.colors.ranges", [
        [0, 10, "red"],
        [10.1, 18.5, "yellow"],
        [18.6, 24.9, "#0f0"],
        [25, 29.9, "orange"],
        [30, 40, "red"]
      ]);
  } 
  else {
    var meter = new RGraph.Meter(
        "AdviceCanvas", 0, bmi, bmi)
      .Set("chart.colors.ranges", [
        [0, 10, "red"],
        [10.1, 18.5, "yellow"],
        [18.6, 24.9, "#0f0"],
        [25, 29.9, "yellow"],
        [30, 40, "orange"],
        [40.1, bmi, "red"]
      ]);
  }
  drawMeter(meter);
}

function drawMeter(meter) {
  
  meter.Set("chart.backgroundColor", "#444")
        .Set("chart.centery", 265)
        .Set("chart.centerx", 25)
        .Set("chart.textColor", "#ccc")
        .Set("chart.textSize", 9)
        .Set("chart.segmentRadiusStart", 175)
        .Set("chart.anglesStart", RGraph.PI + 1.57)
        .Set("chart.anglesEnd", RGraph.TWOPI)
        .Set("chart.needleRadius", 150)
        .Set("chart.needleColor", "#ccc")
        .Set("chart.centerpinStroke", "black")
        .Set("chart.centerpinFill", "#ccc")
        .Set("chart.border", 2)
        .Set("chart.borderColor", "#ccc")
        .Draw();
}