var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/frobotime', function (req, res) {
	console.log(req.body);
	res.sendFile(__dirname + "/success.html");
});

app.get('/frobotime.html', function (req, res) {
	console.log(req.body);
	res.sendFile(__dirname + "/frobotime.html");
});

app.get('/data/data.json', function (req, res) {
	res.sendFile(__dirname + "/data/data.json");
});

app.listen(8080);
