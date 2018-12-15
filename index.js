process.chdir(__dirname)
const fs = require('fs')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const db = require('./db.js')
const childProcess = require('child_process')

db.initialize()

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set('views', './views')
app.set('view engine', 'pug')

app.post('/submit', (req, res) => {
  console.log(req.body)
  if (req.body.name && req.body.type) {
    if (req.body.type === 'hours') {
      db.checkHours(req.body.name).then(hours => {
        res.send(hours)
      })
    } else if (db.workshopInProgress()) {
      console.log(req.body)
      db.store(req.body)
      res.render('success', { title: 'FRobotime', message: 'Success!' })
    } else {
      res.sendFile(__dirname + '/static/noworkshop.html')
    }
  }
})

app.post('/workshop', (req, res) => {
  console.log(req.body)
  if (req.body.type && req.body.password) {
    if (db.isOfficer(req.body.password)) {
      db.processWorkshop(req.body).then(status => {
        if (status && req.body.type === 'start') res.render('success', { title: 'Success', message: 'Workshop Started!' })
        else if (status && req.body.type === 'end') res.render('success', { title: 'Success', message: 'Workshop Ended!' })
        else if (req.body.type === 'start') res.send('There is already a workshop in progress.')
        else if (req.body.type === 'end') res.sendFile(__dirname + '/static/noworkshop.html')
        else res.send('ERROR')
      })
    } else {
      res.send('Incorrect Password!')
    }
  }
})

app.post('/admin', (req, res) => {
  console.log(req.body)
  if (req.body.type && req.body.password) {
    if (db.isOfficer(req.body.password)) {
      db.getTotalHours().then(results => {
        res.send(results)
      })
    } else {
      res.send('Incorrect Password!')
    }
  }
})

app.get('/status', (req, res) => {
  res.send(db.workshopInProgress())
})

app.get('/update', (req, res) => {
  var update = childProcess.execSync('git pull').toString()
  console.log(update)
  res.send(update)
})

/**
 * Lists the directories in a directory.
 * @param {string} dir The directory that you want to get a list of directories from.
 * @return {Array<string>} Returns all the folder names.
 */
var listDirs = dir => {
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory())
}

/**
 * Lists the files in a directory.
 * @param {string} dir The directory that you want to get a list of files from.
 * @param {string} filter The file type you want to get. IE: `js`
 * @return {Array<string>} Returns all the file names.
 */
var listFiles = (dir, filter) => {
  var files = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile())
  if (filter) {
    return files.filter(file => file.endsWith(`.${filter}`))
  } else {
    return files
  }
}

const path = require('path')
var htmlPath = path.join(__dirname, './src/html')
var ht = (i) => path.join(htmlPath, i)

app.get('/', (req, res) => res.sendFile(ht('frobotime.html')))
app.use((req, res) => res.sendFile(ht('404.html')))
app.get('/restart', () => process.exit())

listDirs('src').forEach(d => {
  listFiles(path.join(process.cwd(), `./src/${d}`)).forEach((f) => {
    app.use(`/${f}`, (req, res) => res.sendFile(ht(f)))
    console.log(`/${f}: ${path.join(htmlPath, f)}`)
  })
})

app.listen(8080)
