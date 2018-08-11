var SERVER_URL = "http://54.186.23.253:25921";

$(document).on("pagecontainershow", function() {

	switch($('.ui-page-active').attr('id')) {

		case "pageHome" :
			var user = sessionStorage.user;
			if (user != null) {
				sessionStorage.clear(user);
				$('#txtEmail').val(user.email);
			}
			$("#passcode").val("");
			break;

		case "pageUserInfo" :
			showUserForm();
			var user = sessionStorage.user;
			var button = $("#menuButton");
			if (user == null) {
				button.text("Back");
				button.attr("href", "#pageHome");
				button.attr("data-icon", "arrow-l");
			}
			else {
				button.text("Menu");
				button.attr("href", "#pageMenu");
				button.attr("data-icon", "bars");
			}
			break;

		case "pageRecords" :
			loadUserInfo();
			listRecords();
			break;

		case "pageAdvice" :
			advicePage();
			resizeGraph();
			break;

		case "pageBmiGraph" :
			page = $('pageBmiGraph');
			page.trigger('pagecreate');
			drawBmiGraph();
			resizeGraph();
			break;

		case "pageBpGraph" :
			page = $('pageBpGraph');
			page.trigger('pagecreate');
			drawBpGraph();
			resizeGraph();
			break;

		case "pageNewRecordForm" :
			var formOperation = $("#btnSubmitRecord").val();

			if (formOperation == "Add") {
				clearRecordForm();
			}
			else if (formOperation == "Edit") {
			// if editing, load stored data into form
				showRecordForm($("#btnSubmitRecord").attr("indexToEdit"));
			}
			break;

		case "pageAbout" :
			var agreed = sessionStorage.agreedToLegal == 1 ? true : false;
			if (agreed) {
				$('#btnHome').attr('href', '#pageMenu');
			}
			else {
				$('#btnHome').attr('href',"#pageHome");
			}
			break;
	}
});

$(window).resize(function () {
  resizeGraph();
});

function resizeGraph() {
  // if ($(window).width() < 700) {
  //   $("#GraphCanvas").css({
  //     "width": $(window).width() - 50
  //   });
  //   $("#AdviceCanvas").css({
  //     "width": $(window).width() - 50
  //   });
  // }
}

function loadUserInfo() {
	var user = JSON.parse(sessionStorage.user);

	if (user != null) {
		$("#divUserSection").empty();
		var today = new Date();
		var dob = new Date(user.dob);
		var age = Math.floor((today - dob) / (365.25 * 24 * 60 * 60 * 1000));

		$("#divUserSection").append("<strong>" + user.firstName + " " + user.lastName + "</strong><br>");
		$("#divUserSection").append("Age: " + age + "<br>");
		$("#divUserSection").append("Ht: " + user.heightFt + "' " + user.heightIn + "\"<br>");
		$("#divUserSection").append("Insurance: " + user.insName + "<br>");
		$("#divUserSection").append("Policy Number: " + user.policyID + "<br>");

		$("#divUserSection").append("<br><a href='#pageUserInfo' data-mini='true' id='btnProfile' "
			+ "data-role='button' data-icon='edit' data-iconpos='left' data-inline='true'>Edit Profile</a>");
		$('#btnProfile').button();
	}
}
