var express = require('express');
var app = express();

var mongodb = require('mongodb');

var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');

require("console-stamp")(console, {
        pattern : "dd/mm/yyyy HH:MM:ss.l",
        colors: {
                stamp: "yellow",
                label: "white"
        }
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

// // Get all records associated with the given user
app.post('/getRecords', function(request, response) {
    console.log('Sending records');
    if (!request.body.email || !request.body.password) {
        return response.send(400, 'Missing log in information.');
    }
    usersCollection.find({
        email: request.body.email
    }, function(err, result) {
        if (err) {
            throw err;
        }
        result.next(function(err, foundUser) {
            if (err) {
                throw err;
            }
            if (!foundUser) {
                return response.send(400, 'User not found.');
            }
            if (!bcrypt.compareSync('' + request.body.password, foundUser.password)) {
                return response.send(400, 'Invalid password');
            }
            getRecords(request, function(err, result) {
                if (err) {
                    return response.send(400, 'An error occurred retrieving records.');
                }
                result.toArray(function(err, resultArray) {
                    if (err) {
                        return response.send(400, 'An error occurred processing your records.');
                    }
                    return response.send(200, resultArray);
                });
            });
        });
    });
});

// Helper function to get all records for a given user
function getRecords(request, callback) {
    console.log('Retrieving records.')
    recordsCollection.find({
        user: request.body.email
    }, callback);
}

// Updates the records in the database with the provided records
app.post('/syncRecords', function(request, response) {
    console.log('Save Records Request Received.');

    if (!request.body.email || !request.body.password) {
        return response.send(400, 'Missing log in information.');
    }

    usersCollection.find({
        email: request.body.email
    }, function(err, result) {
        if (err) {
            throw err;
        }
        result.next(function(err, foundUser) {
            if (err) {
                throw err;
            }
            if (!foundUser) {
                return response.send(400, 'User not found.');
            }
            if (!bcrypt.compareSync('' + request.body.password, foundUser.password)) {
                return response.send(400, 'Invalid password');
            }
            var newRecords = request.body.newRecords;
            for (var i = 0; i < newRecords.length; i++) {
                newRecords[i].user = request.body.email;
                delete newRecords[i]._id;
            }
            syncRecords(request, response, newRecords);
        });
    });
});

// Helper function to remove all old records and insert all new records
//  We do this instead of a combination of UPDATE and
//  INSERT statements to simplify this process
function syncRecords(request, response, recordsToSave) {
    recordsCollection.remove({
        email: request.body.email
    }, null, function(err) {
        if (err) {
            return response.send(400, 'Error occurred syncing records');
        }
        recordsCollection.insert(recordsToSave, function(err, result) {
            if (err) {
                console.log(err);
                return response.send(400, 'Error occurred syncing records');
            }
            return response.send(200, 'Records synced.');
        });
    });
}

// Uses a email address and password to retrieve a user from the database
app.post('/login', function(request, response) {
    console.log('Logging user in');

    if (!request.body.email || !request.body.password) {
        return response.send(400, 'Missing log in information.');
    }

    usersCollection.find({
        email: request.body.email
    }, function(err, result) {
        if (err) {
            throw err;
        }
        result.next(function(err, foundUser) {
            if (err) {
                throw err;
            }
            if (!foundUser) {
                return response.send(400, 'User not found.');
            }
            if (!bcrypt.compareSync('' + request.body.password, foundUser.password)) {
                return response.send(400, 'Invalid password');
            }
            delete foundUser.password;
            return response.send(200, foundUser);
        });
    });
});

// Creates a new user in the database
app.post('/saveNewUser', function(request, response) {
    console.log('New user being created.');
    var user = request.body.newUser;
    console.log(request.body);
    if (!user.email) return response.json(400, 'Missing email');
    if (!user.newPassword) return response.json(400, 'Missing password');
    if (!user.firstName) return response.json(400, 'Missing first name');
    if (!user.lastName) return response.json(400, 'Missing last name');
    if (!user.insName) return response.json(400, 'Missing insurance name');
    if (!user.dob) return response.json(400, 'Missing dob');
    if (!user.policyID) return response.json(400, 'Missing policy number');
    if (!user.gender) return response.json(400, 'Missing gender');
    if (!user.heightFt) return response.json(400, 'Missing height feet');
    if (!user.heightIn) return response.json(400, 'Missing height inches');
    if (!user.bodyType) return response.json(400, 'Missing body type');
    // return response.json(400, 'Missing a parameter.');

    var salt = bcrypt.genSaltSync(10);
    var passwordString = '' + user.newPassword;
    user.password = bcrypt.hashSync(passwordString, salt);
    user.agreedToLegal = false;

    usersCollection.find({
        email: user.email
    }, function(err, result) {
        if (err) {
            return response.send(400, 'An error occurred creating this user.');
        }
        if (result.length) {
            return response.send(400, 'A user with this email address already exists.');
        }
        usersCollection.insert(user, function(err, result) {
            if (err) {
                return response.send(400, 'An error occurred creating this user.');
            }
            return response.json(200, 'User created successfully!');
        });
    });
});

// Update user information
app.post('/updateUser', function(request, response) {
    console.log('User being updated.');
    var user = request.body;
    usersCollection.find({
        email: user.email
    }, function(err, result) {
        if (err) {
            throw err;
        }
        result.next(function(err, foundUser) {
            if (err) {
                return response.send(400, 'An error occurred finding a user to update.');
            }
            if (!foundUser) {
                return response.send(400, 'User not found.');
            }
            if (!bcrypt.compareSync('' + request.body.password, foundUser.password)) {
                console.log("body pw: " + request.body.password + "user pw: " + foundUser.password);
                return response.send(400, 'Invalid password.');
            }
            if (user.newPassword) {
                var salt = bcrypt.genSaltSync(10);
                var passwordString = '' + user.newPassword;
                user.password = bcrypt.hashSync(passwordString, salt);
            }
            delete user._id;
            usersCollection.update({
                email: user.email
            }, user, null, function(err) {
                if (err) {
                    console.log(err);
                    return response.send(400, 'An error occurred updating users information.');
                }
                return response.send(200, foundUser);
            });
        });
    });
});

var user = 'healMon';
var password = 'Password1!';
//var host = '127.0.0.1';
var host = '192.168.1.101';
var port = '27017';
var database = 'healMon';
// var connectionString = 'mongodb://' + user + ':' + password + '@' +
var connString = 'mongodb://' + host + ':' + port + '/' + database;
var usersCollection;
var recordsCollection;
mongodb.connect(connString, function(error, db) {
    if (error) {
        return console.log(error);
    } else {
        console.log('... connected to mongo database ...');
    }

    usersCollection = db.collection('users');
    recordsCollection = db.collection('records');

    // Close the database connection and server when the application ends
    process.on('SIGTERM', function() {
        console.log("... shutting server down ...");
        db.close();
        app.close();
    });

    var server = app.listen(25923, function() {
        console.log('... healMon app listening on port %d ...', server.address().port);
    });
});
