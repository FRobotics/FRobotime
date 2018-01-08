const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./timetable.sqlite');
const OFFICERS = ["Michael Rossi", "Michael Cao", "Courtney Sheridan", "Matt Pekarcik", "Meg Anderson"];
var inProgress = false;

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
        if (isOfficer(data.name))
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
    if (inProgress)
        return true;
    else
        return false;
};

exports.isOfficer = function(name) {
    return OFFICERS.indexOf(name) > -1
};

exports.allOfficersOut = function() {
    var workshopID = getWorkshopID();
};
