const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./timetable.sqlite')
const password = require('fs').readFileSync('./password.txt').toString().trim()
var inProgress = false
var time = null // eslint-disable-line no-unused-vars

// Initialize
exports.initialize = () => {
  db.serialize(function () {
    db.run(`
      CREATE TABLE IF NOT EXISTS timetable (
      workshopID VARCHAR(20), 
      name VARCHAR(100), 
      timestampStart VARCHAR(100), 
      timestampEnd VARCHAR(100),
      hours VARCHAR(100),
      inProgress BOOLEAN)
    `)
  })

  setInterval(() => {
    if (new Date().getHours() === 2 && new Date().getMinutes() === 0) { this.endWorkshop() }
  }, 60000)
}

exports.getWorkshopID = () => {
  var year = String(new Date().getYear() + 1900)
  var month = String(new Date().getMonth() + 1)
  var day = String(new Date().getDate())
  if (month.length < 2) { month = 0 + month }
  if (day.length < 2) { day = 0 + day }
  return year + month + day
}

exports.store = (data) => {
  if (data.type === 'in') {
    var workshopID = this.getWorkshopID()
    db.run(`
      INSERT OR IGNORE INTO timetable VALUES (
      "${workshopID}",
      "${data.name}",
      "${new Date()}",
      "0",
      "0",
      1)
    `)
    console.log(`${data.name} signed in at ${new Date()}`)
  } else if (data.type === 'out') {
    var workshop = this.getWorkshopID();
    db.run(`UPDATE timetable SET timestampEnd = "${new Date()}" WHERE name = "${data.name}" AND workshopID = "${workshop}"`);
    db.run(`UPDATE timetable SET inProgress = 0 WHERE name = "${data.name}" AND workshopID = "${workshop}"`);
    db.all(`SELECT * FROM timetable WHERE name = "${data.name}" AND workshopID = "${workshop}"`, function (err, rows) {
      var date1 = new Date(rows[0].timestampStart),
        date2 = new Date(rows[0].timestampEnd),
        hours = Math.round(Math.abs(date1 - date2) / 36e5) + 2;
      db.run(`UPDATE timetable SET hours = "${hours}" WHERE name = "${data.name}" AND workshopID = "${workshop}"`);
    })
    console.log(`${data.name} signed out at ${new Date()}`)
  }
}

exports.workshopInProgress = () => {
  return inProgress
}

exports.isOfficer = (pwd) => {
  if (password === pwd) return true
  else return false
}

exports.processWorkshop = (body) => {
  return new Promise((resolve) => {
    if (body.type === 'start') {
      if (!inProgress) {
        time = new Date()
        inProgress = true
        resolve(true)
      } else {
        resolve(false)
      }
    } else if (body.type === 'end') {
      if (inProgress) {
        this.endWorkshop()
        resolve(true)
      } else resolve(false)
    }
  })
}

exports.endWorkshop = () => {
  var workshopID = this.getWorkshopID();
  if (inProgress) {
    db.all(`SELECT * FROM timetable WHERE inProgress = ${1}`, function (err, rows) {
      if (err) console.log(err)
      else if (!rows[0]) console.log('nothing found ur an idiot')
      else {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].workshopID == workshopID) {
            var workshop = this.getWorkshopID();
            db.run(`UPDATE timetable SET timestampEnd = "${new Date()}" WHERE name = "${rows[0].name}" AND workshopID = "${workshop}"`);
            db.run(`UPDATE timetable SET inProgress = 0 WHERE name = "${rows[0].name}" AND workshopID = "${workshop}"`);
            db.all(`SELECT * FROM timetable WHERE name = "${rows[0].name}" AND workshopID = "${workshop}"`, function (err, rows) {
              db.run(`UPDATE timetable SET hours = "${2}" WHERE name = "${rows[0].name}" AND workshopID = "${workshop}"`);
            })
          }
        }
        this.workshopInProgress = false;
        console.log('--- SUCCESSFULLY ENDED WORKSHOP ' + this.getWorkshopID() + '---')
      }
    })
  }
}
