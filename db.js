const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./timetable.sqlite');
var inProgress = false;
const password = require('fs').readFileSync('./password.txt');

/**
 * @description Initializes the Database.
 */
exports.initialize = function() {
    db.serialize(function() {
        db.run(`CREATE TABLE IF NOT EXISTS timetable (
            workshopID VARCHAR(20), 
            name VARCHAR(100), 
            timestampStart VARCHAR(100), 
            timestampEnd VARCHAR(100),
            inProgress BOOLEAN)`);
    });

    setInterval(() => {
        console.log(new Date().getHours() + ":" + new Date().getMinutes())
        if (new Date().getHours() === 5 && new Date().getMinutes() == 0)
            this.endWorkshop();
    }, 60000)
};

exports.store = function(data) {
    function getWorkshopID() {
        var year = String(new Date().getYear() + 1900),
            month = String(new Date().getMonth() + 1),
            day = String(new Date().getDate())
        if (month.length < 2)
            month = 0 + month
        if (day.length < 2)
            day = 0 + day
        return year + month + day
    }

    if (data.type == "in") {
        if (OFFICERS.indexOf(data.name) > -1)
            inProgress = true;
        var workshopID = getWorkshopID();
        db.run(`INSERT OR IGNORE INTO timetable VALUES (
            "${workshopID}",
            "${data.name}",
            "${new Date()}",
            "${null}",
            1)`);
        console.log("Data successfully stored!")
    }
};

exports.workshopInProgress = function() {
    return inProgress;
};

exports.isOfficer = function(pwd) {
    if (pwd == password) return true;
    else return password;
};

exports.endWorkshop = function() {
    if (inProgress) {
        
    }
};
