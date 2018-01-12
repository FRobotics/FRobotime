var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    db = require('./db.js'),
    child_process = require('child_process');

db.initialize();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/submit', function(req, res) {
    console.log(req.body);

    if (req.body.name && req.body.type) {
        if (db.workshopInProgress() || db.isOfficer(req.body.name)) {
            db.store(req.body);
            res.sendFile(__dirname + "/success.html");
        } else {
            res.send("Workshop is not in progress!");
        }
    }
    return;
});

app.get('/update', function(req, res) {
    var update = child_process.execSync('git pull').toString()
    console.log(update);
    res.send(update);
});

app.get('/restart', function() {
    process.exit();
});

app.get('/frobotime.html', function(req, res) {
    res.sendFile(__dirname + "/frobotime.html");
});

app.get('/workshop.html', function(req, res) {
    res.sendFile(__dirname + "/workshop.html");
});

app.get('/data/data.json', function(req, res) {
    res.sendFile(__dirname + "/data/data.json");
});

app.get('/main.css', function(req, res) {
    res.sendFile(__dirname + "/main.css");
});

app.get('/materialize.css', function(req, res) {
    res.sendFile(__dirname + "/materialize.css");
});

app.get('/logo.jpg', function(req, res) {
    res.sendFile(__dirname + "/logo.jpg");
});

app.use((req, res) => {
    res.sendFile(__dirname + "/404.html")
});

app.listen(8080);
