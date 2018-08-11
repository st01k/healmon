// Events ---------------------------------------------------------------------
$("#btnClearHistory").click(function() {
    sessionStorage.removeItem("tbRecords");
    listRecords();
    alert("All records have been deleted.");
});

$("#btnAddRecord").click(function() {
    $("#entryHeader").html("New Entry");
    $("#btnSubmitRecord").attr('data-icon', 'plus');
    $("#btnSubmitRecord").val("Add");
    $("#btnSubmitRecord").button("refresh");
});

$("#frmNewRecordForm").submit(function(event) {
    var formOperation = $("#btnSubmitRecord").val();

    if (formOperation == "Add") {
        addRecord();
        $.mobile.changePage("#pageRecords");
    } else if (formOperation == "Edit") {
        editRecord($("#btnSubmitRecord").attr("indexToEdit"));
        $.mobile.changePage("#pageRecords");
        $("#btnSubmitRecord").removeAttr("indexToEdit");
    }

    // return false to prevent page reload
    // return false; 
    // same as below
    event.preventDefault();
});

// CRUD -----------------------------------------------------------------------
function addRecord() {
    if (checkRecordForm()) {
        var bmi = calcBmi();
        var record = {
            "date": $('#datExamDate').val(),
            "weight": $('#txtWeight').val(),
            "bmi": bmi.toFixed(1),
            "systolic": $("#sys").val(),
            "diastolic": $("#dia").val()
        };

        var tbRecords;
        if (sessionStorage.tbRecords) {
            tbRecords = JSON.parse(sessionStorage.tbRecords);
        }

        if (tbRecords == null) {
            tbRecords = [];
        }
        tbRecords.push(record);
        sessionStorage.tbRecords = JSON.stringify(tbRecords);
        alert("Saving Entry");
        clearRecordForm();
        listRecords();
    }

    // if check fail
    else return false;
    return true;
}

function editRecord(index) {
    if (checkRecordForm()) {
        var tbRecords = JSON.parse(sessionStorage.tbRecords);
        var bmi = calcBmi();

        tbRecords[index] = {
            "date": $('#datExamDate').val(),
            "weight": $('#txtWeight').val(),
            "systolic": $("#sys").val(),
            "diastolic": $("#dia").val(),
            "bmi": bmi.toFixed(1)
        };
        sessionStorage.tbRecords = JSON.stringify(tbRecords);
        alert("Saving Entry");
        clearRecordForm();
        listRecords();
    } else alert("Please complete the form properly.");
}

function deleteRecord(index) {
    var tbRecords = JSON.parse(sessionStorage.tbRecords);
    tbRecords.splice(index, 1);

    if (tbRecords.length == 0) {
        sessionStorage.removeItem("tbRecords");
    } else {
        sessionStorage.tbRecords = JSON.stringify(tbRecords);
    }
}

// Utils ----------------------------------------------------------------------
function checkRecordForm() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var year = d.getFullYear();
    var currDate = year + '/' +
        (('' + month).length < 2 ? '0' : '') +
        month + '/' +
        (('' + day).length < 2 ? '0' : '') +
        day;

    if (($("#txtWeight").val() != "") &&
        ($("#datExamDate").val() != "") &&
        ($("#datExamDate").val() <= currDate)) return true;
    else return false;
}

function showRecordForm(index) {
    var tbRecords = JSON.parse(sessionStorage.tbRecords);
    tbRecords.sort(compareDates);
    var rec = tbRecords[index];

    $("#datExamDate").val(rec.date);
    $("#txtWeight").val(rec.weight);
    $("#sys").val(rec.systolic);
    $("#dia").val(rec.diastolic);
    $("#BMI").val(rec.bmi)
}

function listRecords() {
    var tbRecords;
    if (sessionStorage.tbRecords) {
        tbRecords = JSON.parse(sessionStorage.tbRecords);
    }

    if (tbRecords != null) {
        tbRecords.sort(compareDates);

        //table init
        $("#tblRecords").html(
            "<thead>" +
            "   <tr>" +
            "     <th>Date</th>" +
            "     <th>Blood<br>Pressure</th>" +
            "     <th>Weight</th>" +
            "     <th>BMI</th>" +
            "     <th>Edit/Del</th>" +
            "   </tr>" +
            "</thead>" +
            "<tbody>" +
            "</tbody>"
        );

        // insert each record into table
        for (var i = 0; i < tbRecords.length; i++) {
            var rec = tbRecords[i];
            $("#tblRecords tbody").append("<tr>" +
                "  <td>" + rec.date + "</td>" +
                "  <td>" + rec.systolic + " / " + rec.diastolic + "</td>" +
                "  <td>" + rec.weight +
                "  <td>" + rec.bmi + " %" + "</td>"

                // edit button
                +
                "<td>" +
                "<a href='#pageNewRecordForm' onclick='callEdit(" + i + ")'>" +
                "<span data-inline='true' data-role='button' data-icon='edit' data-iconpos='notext' class='ui-btn ui-icon-edit'>" +
                "</span>" +
                "</a>"

                // delete button
                +
                "<a href='#pageRecords' onclick='callDelete(" + i + ")'>" +
                "<span data-inline='true' data-mini='true' data-role='button' data-icon='delete' data-iconpos='notext' class='ui-btn ui-icon-delete'>" +
                "</span>" +
                "</a>" +
                "</td>"

                +
                "</tr>");
        }
        // refresh buttons. without this the delete/edit buttons won't appear
        $('#tblRecords [data-role="button"]').button();
    } else {
        // if no data set empty array
        tbRecords = [];
        $("#tblRecords").html("");
    }
    return false;
}

function clearRecordForm() {

    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var year = d.getFullYear();
    var currDate = year + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' +
        (('' + day).length < 2 ? '0' : '') + day;

    $("#datExamDate").val(currDate);
    $("#txtWeight").val("");
    $("#sys").val("");
    $("#dia").val("");
    return true;
}

function compareDates(a, b) {
    var x = new Date(a.Date);
    var y = new Date(b.Date);

    if (x > y) return 1;
    else return -1;
}

function callEdit(index) {
    $("#btnSubmitRecord").attr("indexToEdit", index);
    $("#btnSubmitRecord").attr('data-icon', 'edit');
    $("#entryHeader").html("Edit Entry");
    $("#btnSubmitRecord").val("Edit");
    $("#btnSubmitRecord").button("refresh");
}

function callDelete(index) {
    deleteRecord(index);
    listRecords();
}