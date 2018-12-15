const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./database.sqlite')
const password = require('fs').readFileSync('./password.txt').toString().trim()
const moment = require('moment')
const { oneLine } = require('common-tags')
var inProgress = false
var students = require('./data/data.json').names.split(',')

exports.initialize = () => {
  db.serialize(() => {
    db.run(oneLine`
      CREATE TABLE IF NOT EXISTS timetable (
        firstName varchar(12),
        lastName varchar(12)
        workshopID varchar(8),
        timestampStart varchar(100),
        timestampEnd varchar(100),
        hours int,
        inProgress boolean
      )
    `)
  })

  setInterval(() => {
    if (new Date().getHours() === 2 && new Date().getMinutes() === 0) { this.endWorkshop() }
  }, 60000)
}

exports.getWorkshopID = () => {
  return moment().format('YYYYMMDD')
}

exports.store = (data) => {
  if (data.type === 'in') {
    var workshopID = this.getWorkshopID()
    db.run(`
      INSERT OR IGNORE INTO timetable VALUES (
        "${data.name}",
        "${data.name}",
        "${new Date()}",
        "0",
        "0",
        true
      )
    `)
    console.log(`${data.name} signed in at ${new Date()}`)
  } else if (data.type === 'out') {
    var workshop = this.getWorkshopID()
    db.run(`UPDATE timetable SET timestampEnd = "${new Date()}" WHERE name = "${data.name}" AND workshopID = "${workshop}"`)
    db.run(`UPDATE timetable SET inProgress = 0 WHERE name = "${data.name}" AND workshopID = "${workshop}"`)
    db.all(`SELECT * FROM timetable WHERE name = "${data.name}" AND workshopID = "${workshop}"`, (e, rows) => {
      var date1 = new Date(rows[0].timestampStart)

      var date2 = new Date(rows[0].timestampEnd)

      var hours = Math.round(Math.abs(date1 - date2) / 36e5)
      if (hours < 2) { hours = 2 }
      db.run(`UPDATE timetable SET hours = "${hours}" WHERE name = "${data.name}" AND workshopID = "${workshop}"`)
    })
    console.log(`${data.name} signed out at ${new Date()}`)
  }
}

exports.checkHours = (name) => {
  return new Promise((resolve) => {
    db.all(`SELECT * FROM timetable WHERE name = "${name}"`, (e, rows) => {
      var hours = 0
      for (var i = 0; i < rows.length; i++) {
        hours += Number(rows[i].hours)
      }
      resolve(name + ': ' + hours)
    })
  })
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
  var workshopID = this.getWorkshopID()
  if (inProgress) {
    db.all(`SELECT * FROM timetable WHERE inProgress = ${1}`, (err, rows) => {
      if (err) console.log(err)
      else if (!rows[0]) console.log('all users signed out or none signed in')
      else {
        for (var i = 0; i < rows.length; i++) {
          db.run(`UPDATE timetable SET timestampEnd = "${new Date()}" WHERE inProgress = "1"`)
          db.run(`UPDATE timetable SET hours = "${2}" WHERE inProgress = "1"`)
          db.run(`UPDATE timetable SET inProgress = 0 WHERE inProgress = "1"`)
          console.log(`${rows[i].name} has been signed out and given 2 hours!`)
        }
        this.workshopInProgress = false
      }
      console.log('--- SUCCESSFULLY ENDED WORKSHOP ' + workshopID + '---')
    })
  }
}

exports.getTotalHours = () => {
  return new Promise(async (resolve) => {
    var results = ''
    for (var i = 0; i < students.length; i++) {
      var hours = await this.checkHours(students[i])
      results += students[i] + ': ' + hours + '\n'
      if (i === students.length - 1) resolve(results)
    }
  })
}
