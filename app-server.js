var express = require('express');
var app = express();
var path = require('path');
var port = 25921;

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
		flag = true;
		console.log('accessed from ' + req.ip);
		prevIP = currIP;
	}
	next();
});

app.use(express.static("public"));

app.listen(port, function () {
	console.log('... healMon app listening on port ' + port + ' ...');
});
