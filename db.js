process.chdir(__dirname)
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('./src/data/database.sqlite')

exports.initialize = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS members (
      firstName TEXT,
      lastName TEXT,
      position TEXT,
      officer BOOLEAN,
      hours INTEGER,
      lastLogin TEXT,
      lastLogout TEXT
    )`)
  })
}

exports.login = (data) => {
  // Create the member in the database if they don't exist.
  db.run(`INSERT OR IGNORE INTO members VALUES ("${data.firstname}", "${data.lastname}", "${data.position}", ${data.officer}, 0, ${new Date()}, 0)`)
  console.log(`${data.lastname} ${data.firstname} signed in at ${new Date()}`)
}

exports.logout = (data) => {
  // Set the users's last logout.
  db.run(`UPDATE members SET lastLogout = "${new Date()}" WHERE firstName = "${data.firstname}" AND lastName = "${data.lastname}"`)

  // Set the user's new hours.
  db.all(`SELECT * FROM members WHERE firstName = "${data.firstname}" AND lastName = "${data.lastname}"`, (f, rows) => {
    rows = rows[0]
    var hours = rows.hours + Math.round(Math.abs(new Date(rows.lastLogin) - new Date(rows.lastLogout)) / 36e5)
    db.run(`UPDATE members SET hours = "${hours}" WHERE firstName = "${data.firstname}" AND lastName = "${data.lastname}"`)
    console.log(`${data.lastname} ${data.firstname} signed out at ${new Date()}`)
  })
}
