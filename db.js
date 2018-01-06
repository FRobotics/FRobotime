const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./timetable.sqlite');

module.exports = {
    /**
     * @description Initializes the Database.
     */
    initialize = function () {
        db.serialize(function () {
            db.run(`CREATE TABLE IF NOT EXISTS timetable (
				workshopID VARCHAR(20), 
				name VARCHAR(100), 
				timestampStart VARCHAR(100), 
				timestampEnd VARCHAR(100),
				inProgress BOOLEAN)`
            );
        });
    },

    store = function (data) {
        if (data.type == "in") {
            var workshopID = getWorkshopID();
            db.run(`INSERT OR IGNORE INTO timetable VALUES (
                "${workshopID}",
                "${data.name}",
                "${new Date()}",
                "${null}",
                1
            )`)
            console.log("Data successfully stored!")
        }
    },

    getWorkshopID = function () {
        var year = String(new Date().getYear() + 1900),
            month = String(new Date().getMonth() + 1),
            day = String(new Date().getDate())
        if (month.length < 2)
            month = 0 + month
        if (day.length < 2)
            day = 0 + day
        return year + month + day
    }
}