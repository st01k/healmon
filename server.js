var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var app = express();
var port = 25921;

require("console-stamp")(console, {
        pattern : "dd/mm/yyyy HH:MM:ss.l",
        colors: {
                stamp: "yellow",
                label: "white"
        }
});

var database = mysql.createConnection({
  host: '127.0.0.1',
  user: "mobileApps",
  password: "Password1!",
  database: 'mobileApps',
  connectTimeout: 10000
});

var prevIP;
app.use(function(req, res, next) {
	var currIP = req.ip;
	if (currIP != prevIP) {
		console.log('accessed from ' + req.ip);
		prevIP = currIP;
	}
	next();
});
//-----------------------------------------------------------------------------

// https://www.npmjs.com/package/mysql - pooling connections
database.connect(function(err) {
  if (err) {
    console.error('... error connecting: ' + err.stack + " ...");
    return;
  }
  console.log("... connected to mysql database ...");
});

//CORS Middleware, causes Express to allow Cross-Origin Requests
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(allowCrossDomain);

process.on('SIGTERM', function() {
    console.log("... shutting server down ...");
    database.end();
    app.close();
});

var server = app.listen(port, function () {
	console.log('... healMon app listening on port ' + port + ' ...');
});

//-----------------------------------------------------------------------------
app.post('/saveNewUser', function (request, response) {
  console.log('... new user being created ...');
  var user = request.body.newUser;
  var query = database.query(
    'INSERT INTO users VALUES (?, PASSWORD(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      user.email,
      user.newPassword,
      user.firstName,
      user.lastName,
      user.gender,
      user.insName,
      user.policyID,
      user.heightFt,
      user.heightIn,
      user.bodyType,
      user.dob,
      false // agreedToLegal
    ],
    function (err, result) {
      if (err) {
        console.log(err);
        return response.send(400, '... an error occurred creating this user ...');
      }
      return response.json(200, '... user created successfully ...');
    });
});

app.post('/login', function (request, response) {
  console.log('Logging user in');
  if (!request.body.email || !request.body.password) {
    return response.send(400, '... missing log in information ...');
  }
  var query = database.query('SELECT * FROM users ' +
    'WHERE users.email=? AND users.password=PASSWORD(?)',
    [request.body.email, request.body.password],
    function (err, result) {
      if (err) {
	      console.log(err);
        return response.send(400, '... error logging user in ...');
      }
      if (!result.length) {
        return response.send(400, '... invalid password and email provided ...' );
      }
      delete result[0].password;
      return response.send(200, result[0]);
    });
});

app.post('/updateUser', function (request, response) {
  console.log('... user being updated ...');
  var user = request.body;
  if (!user.newPassword) {
    user.newPassword = user.password;
  }
  var query = database.query(
    'UPDATE users SET password=PASSWORD(?), firstName=?, lastName=?, gender=?, insName=?, policyID=?, heightFt=?, heightIn=?, bodyType=?, dob=?, agreedToLegal=? ' +
    'WHERE email=? and password=PASSWORD(?)', [
      user.newPassword,
      user.firstName,
      user.lastName,
      user.gender,
      user.insName,
      user.policyID,
      user.heightFt,
      user.heightIn,
      user.bodyType,
      formatDateOfBirth(user.dob),
      user.agreedToLegal,
      user.email,
      user.password
    ],
    function (err, result) {
      if (err) {
	      console.log(err);
        return response.send(400, '... an error occurred creating this user ...');
      }
      return response.send(200, '... user created successfully ...');
    });
});

function formatDateOfBirth(dateString) {
    var date = new Date(dateString);
    var month = date.getMonth() + 1;
    var day = date.getDate() + 1;
    var year = date.getFullYear();
    var formattedDate = year + '-' +
        (('' + month).length < 2 ? '0' : '') +
        month + '-' +
        (('' + day).length < 2 ? '0' : '') + day;
    return formattedDate;
}

app.post('/getRecords', function (request, response) {
  console.log('... sending records ...');

  if (!request.body.email || !request.body.password) {
    return response.send(400, '... missing log in information ...');
  }

  var query = database.query(
    'SELECT records.date, records.weight, records.bmi, records.systolic, records.diastolic ' +
    'FROM records, users ' +
    'WHERE records.user=users.email ' +
    'AND users.email=? AND users.password=PASSWORD(?) ' +
    'ORDER BY records.date DESC',
    [request.body.email, request.body.password],
    function (err, result) {
      if (err) {
        console.log(err);
        return response.send(400, '... an error occurred in retrieving records ...');
      }
      return response.send(200, result);
    });
});

app.post('/syncRecords', function (request, response) {
  console.log('... save record request received ...');

  if (!request.body.email || !request.body.password) {
    return response.send(400, '... missing log in information ...');
  }

  var query = database.query(
    'SELECT email FROM users WHERE email=? AND password=PASSWORD(?)',
    [request.body.email, request.body.password],
    function (err, result) {
      if (err) {
        return response.send(400, '... error logging user in ...');
      }
      if (!result) {
        return response.send(400, '... invalid user credentials ...');
      }
    });

  var deleteQuery = database.query(
    'DELETE FROM records WHERE user=?',
    [request.body.email],
    function (err, result) {
      if (err) {
        return response.send(400, '... error occurred syncing records in deleteQuery ...');
      }
    });

  var newRecords = request.body.newRecords;
  if (!newRecords || !newRecords.length) {
    return response.send(200, '... records synced ...')
  }

  var recordsToSave = [];
  for (var i = 0; i < newRecords.length; i++) {
    var newRecord = [
      request.body.email,
      newRecords[i].date,
      newRecords[i].weight,
      newRecords[i].bmi,
      newRecords[i].systolic,
      newRecords[i].diastolic
    ];
    recordsToSave.push(newRecord);
    console.log(newRecords[i]);
  }

  var insertQuery = database.query(
    'INSERT INTO records (user, date, weight, bmi, systolic, diastolic) VALUES ?',
    [recordsToSave],
    function (err, result) {
      if (err) {
        console.log(err);
        return response.send(400, '... error occurred syncing records in insertQuery ...');
      }
      return response.send(200, '... records synced ...');
    });
});