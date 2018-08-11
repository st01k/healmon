$("#frmUserForm").submit(function() {
    saveUserForm();
    return false;
});

function formatDate(d) {
    var date = new Date(d);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1).toString();
    month = month.length > 1 ? month : '0' + month;
    var day = (date.getDate() + 1).toString();
    day = day.length > 1 ? day : '0' + day;
    var dateString = year + '-' + month + '-' + day;
    return dateString;
}

function checkUserForm() {
    if (($("#changePassword").val() != $("#confirmPassword").val())) {
        alert("Passwords don't match.");
        return false;
    }

    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var year = d.getFullYear();
    var currDate = year + '/' +
        (('' + month).length < 2 ? '0' : '') +
        month + '/' +
        (('' + day).length < 2 ? '0' : '') +
        day;

    if (($("#txtFirstName").val() != "") &&
        ($("#txtLastName").val() != "") &&
        ($("#insuranceName").val() != "") &&
        ($("#txtAddress").val() != "") &&
        ($("#txtCity").val() != "") &&
        ($("#txtState").val() != "") &&
        ($("#txtZip").val() != "") &&
        ($("#policyNum").val() != "") &&
        ($("#heightFt").val() != "") &&
        ($("#heightIn").val() != "") &&
        ($("#bodyType option:selected").val() != "Select Body Type") &&
        ($("input[name='gender']:checked").val() != "") &&
        ($("#datBirthdate").val() != "") &&
        ($("#datBirthdate").val() <= currDate)) return true;
    else return false;
}

function showUserForm() {
    if (sessionStorage.user != null) {
        $('#btnUserUpdate').val('Update').button('refresh');

        var user = JSON.parse(sessionStorage.user);
        $('#txtEmail').val(user.email);
        $("#txtFirstName").val(user.firstName);
        $("#txtLastName").val(user.lastName);
        $("#txtAddress").val(user.address),
            $("#txtCity").val(user.city),
            $("#txtState").val(user.state),
            $("#txtZip").val(user.zip),
            $("#datBirthdate").val(user.dob);
        $("#insuranceName").val(user.insName);
        $("#policyNum").val(user.policyID);
        $("#changePassword").val("");
        $("#confirmPassword").val("");

        if (user.gender == "male") {
            $("#lblMale").addClass("ui-btn-active", "ui-radio-on");
            $("#lblFemale").removeClass("ui-btn-active");
            $("#lblFemale").addClass("ui-radio-off");
            $("#male").prop("checked", true)
        } else {
            $("#lblFemale").addClass("ui-btn-active", "ui-radio-on");
            $("#lblMale").removeClass("ui-btn-active");
            $("#lblMale").addClass("ui-radio-off");
            $("#female").prop("checked", true)
        }

        $('#bodyType option[value=' + user.bodyType + ']').attr('selected', 'selected');
        $("#bodyType option:selected").val(user.bodyType);
        $('#bodyType').selectmenu('refresh', true);

        $("#heightFt").val(user.heightFt);
        $("#heightIn").val(user.heightIn);
    } else {
        $('#btnUserUpdate').val("Create").button('refresh');
    }
}

function saveUserForm() {
    if (checkUserForm()) {

        var user = {
            "email": $('#txtEmail').val(),
            "firstName": $("#txtFirstName").val(),
            "lastName": $("#txtLastName").val(),
            "address": $("#txtAddress").val(),
            "city": $("#txtCity").val(),
            "state": $("#txtState").val(),
            "zip": $("#txtZip").val(),
            "gender": $("input[name='gender']:checked").val(),
            "insName": $("#insuranceName").val(),
            "policyID": $("#policyNum").val(),
            "heightFt": $("#heightFt").val(),
            "heightIn": $("#heightIn").val(),
            "bodyType": $("#bodyType option:selected").val(),
            "dob": formatDate($("#datBirthdate").val()),
            "newPassword": $("#changePassword").val()
        };

        if ($('#btnUserUpdate').val() == "Create") {
            var userData = {
                newUser: user
            };

            $.post(SERVER_URL + '/saveNewUser', userData, function(data) {
                alert("New User Created");
                sessionStorage.user = JSON.stringify(user);
                sessionStorage.password = user.newPassword;
                $('#btnUserUpdate').val('Update');
                $.mobile.changePage('#legalNotice');
            }).fail(function(error) {
                alert("User not created.  Error: \n" + error.responseText);
            }).done(function() {
              setLoc(user);
            });
        } else {
            user.agreedToLegal = JSON.parse(sessionStorage.user).agreedToLegal;
            user.password = sessionStorage.password;
            $.post(SERVER_URL + '/updateUser', user, function(data) {
                sessionStorage.user = JSON.stringify(user);
            }).fail(function(error) {
                alert(error.responseText);
            }).done(function() {
                $.mobile.changePage('#pageMenu');
            });
        }
    }
    else {
        alert("Please complete the form properly.");
    }
}

function setLoc(user) {

  var address = $("#txtAddress") + "," + $("#txtCity") + "," + $("#txtState") + "," + $("#txtZip");
  var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + address + "&key=AIzaSyA5L6HAjC51OBYw3CUTaZk1oS9O-k8Gzms";
  console.log(url.toString());
  $.ajax({
    url: url,
    type: "POST",
    success:function(res) {
      user.agreedToLegal = JSON.parse(sessionStorage.user).agreedToLegal;
      user.password = sessionStorage.password;
      $.post(SERVER_URL + '/updateUser', user, function(data) {
          user.lat = res.results[0].geometry.location.lat;
          user.lng = res.results[0].geometry.location.lng;
          sessionStorage.user = JSON.stringify(user);
      }).fail(function(error) {
          alert(error.responseText);
      }).done(function() {});
    }
  });
}
