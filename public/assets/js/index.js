$('#btnCreateUser').click(function() {
	$('btnUserUpdate').val('Create');
});

function calcBmi() {
		var user = JSON.parse(sessionStorage.user);
		var htFt = user.heightFt;
		var htIn = user.heightIn;
		var convFactor = 703;

		var wtLbs = $("#txtWeight").val();
		var impConv = wtLbs * convFactor;
		var totHtIn = htFt * 12.0 + parseInt(htIn);

		var sqIn = Math.pow(totHtIn, 2.0);
		var bmi = impConv / sqIn;

		return bmi;
}

function calcBmiTest() {
	var user = JSON.parse(sessionStorage.user);
	var feet = user.heightFt;
	var inches = user.heightIn;
	
	var totalInches = eval(feet*12) + eval(inches);

  var weight = parseFloat(getCurrWeight(), 10);
  var height = parseFloat(getHeightTotInches(), 10);

  return Math.round(weight * 703 * 10 / height / height) / 10;
}

function delUser() {
	sessionStorage.removeItem("tbRecords");
	sessionStorage.removeItem("user");
	sessionStorage.removeItem("agreedToLegal");
}

function getTotHtInches() {
	var user = JSON.parse(sessionStorage.user);
	var feet = user.heightFt;
	var inches = user.heightIn;
	return eval(feet * 12) + eval(inches);
}

function getCurrWeight() {
	var tbRecords = JSON.parse(sessionStorage.tbRecords);
	tbRecords.sort(compareDates);
	var i = tbRecords.length - 1;
	return tbRecords[i].weight;
}

function getCurrBmi() {
	var tbRecords = JSON.parse(sessionStorage.tbRecords);
	tbRecords.sort(compareDates);
	var i = tbRecords.length - 1;
	return tbRecords[i].bmi;
}

function getCurrSys() {
	var tbRecords = JSON.parse(sessionStorage.tbRecords);
	tbRecords.sort(compareDates);
	var i = tbRecords.length - 1;
	return tbRecords[i].systolic;
}

function getCurrDia() {
	var tbRecords = JSON.parse(sessionStorage.tbRecords);
	tbRecords.sort(compareDates);
	var i = tbRecords.length - 1;
	return tbRecords[i].diastolic;
}

function getMinWeight() {
	height = getTotHtInches();
	return Math.round(18.5 * height * height / 703);
}

function getMaxWeight() {
	height = getTotHtInches();
	return Math.round(24.9 * height * height / 703);
}

function getBmiCategory() {
	var bmi = getCurrBmi();
	if (0 < bmi && bmi <= 18.5) return "under";
	else if (18.6 <= bmi && bmi <= 24.9) return "normal";
	else if (25 <= bmi && bmi <= 29.9) return "over";
	else if (bmi >= 30) return "obese";
	else return "error";
}

function getBpCategory() {
	var sys = getCurrSys();
	var dia = getCurrDia();

	if (sys < 120 && dia < 80) return "Normal";
	else if ((120 <= sys && sys <= 139) || (80 <= dia && dia <= 89)) return "Prehypertension";
	else if ((140 <= sys && sys <= 159) || (90 <= dia && dia <= 99)) return "Stage 1 Hypertenstion";
	else if (sys > 160 && dia > 100) return "Stage 2 Hypertenstion";
	else return "error";
}