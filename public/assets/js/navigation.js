$(document).ready(function() {
  if (!sessionStorage) {
    alert('Your browser does not support the features required for this application.');
  }
})

function addValueToPassword(button) {
	var currVal=$("#passcode").val();

	if (button == "bksp") {
		$("#passcode").val(currVal.substring(0, currVal.length - 1));
	}
	else if (button == "reset") {
		$("#passcode").val("");
	}
	else {
		$("#passcode").val(currVal.concat(button));
	}
}

$("#btnEnter").click(function () {
  var loginCredentials = {
    email: $("#email").val(),
    password: $("#passcode").val()
  };
  $.post(SERVER_URL + '/login', loginCredentials, function (data) {
      if (data && data.email == loginCredentials.email) {
        sessionStorage.password = $("#passcode").val();
        sessionStorage.user = JSON.stringify(data);
        if (!data.agreedToLegal) {
          return $.mobile.changePage("#legalNotice");
        }
        else {
          sessionStorage.agreedToLegal = 1;
        }
        $.post(SERVER_URL + '/getRecords', loginCredentials, function (data) {
            sessionStorage.tbRecords = JSON.stringify(data);
            $.mobile.changePage("#pageMenu");
          }).fail(function (error) {
          alert(error.responseText);
        })
      }
			else {
        alert('An error occurred logging user in.');
      }
    }).fail(function (error) {
    alert(error.responseText);
  });
});

/* Records that the user has agreed to the legal
 * disclaimer on this device/browser
 */
$("#noticeYes").click(function () {
  var user = JSON.parse(sessionStorage.user);
  user.agreedToLegal = 1; // True
  user.password = sessionStorage.password;
  $.post(SERVER_URL + '/updateUser', user,
    function (data) {
      sessionStorage.user = JSON.stringify(user);
      return $.mobile.changePage(
        "#pageMenu");
    }).fail(function (error) {
    alert(error.responseText);
  });
});

$(".refresh").click(function () {
  location.reload();
});
