var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', function (req, res) {
	console.log(req.body);
	if (req.body.name && req.body.type)
		res.sendFile(__dirname + "/success.html");
	return;
});

app.get('/frobotime.html', function (req, res) {
	console.log(req.body);
	res.sendFile(__dirname + "/frobotime.html");
});

app.get('/data/data.json', function (req, res) {
	res.sendFile(__dirname + "/data/data.json");
});

app.get('/main.css', function (req, res) {
	res.sendFile(__dirname + "/main.css");
});

app.get('/materialize.css', function (req, res) {
	res.sendFile(__dirname + "/materialize.css");
});

app.get('/logo.jpg', function (req, res) {
	res.sendFile(__dirname + "/logo.jpg");
});

app.use((req, res) => {
	res.sendFile(__dirname + "/404.html")
});

app.listen(8080);
