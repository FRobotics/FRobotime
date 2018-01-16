var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var db = require('./db.js')
var childProcess = require('child_process')

db.initialize()

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set('views', './views')
app.set('view engine', 'pug')

app.post('/submit', function (req, res) {
  console.log(req.body)
  if (req.body.name && req.body.type) {
    if (db.workshopInProgress()) {
      console.log(req.body)
      db.store(req.body)
      res.render('success', { title: 'FRobotime', message: 'Success!' })
    } else {
      res.sendFile(__dirname + '/static/noworkshop.html') // eslint-disable-line no-path-concat
    }
  }
})

app.post('/workshop', function (req, res) {
  console.log(req.body)
  if (req.body.type && req.body.password) {
    if (db.isOfficer(req.body.password)) {
      db.processWorkshop(req.body).then(status => {
        if (status && req.body.type === 'start') res.render('success', { title: 'Success', message: 'Workshop Started!' })
        else if (status && req.body.type === 'end') res.render('success', { title: 'Success', message: 'Workshop Ended!' })
        else if (req.body.type === 'start') res.send('There is already a workshop in progress.')
        else if (req.body.type === 'end') res.sendFile(__dirname + '/static/noworkshop.html') // eslint-disable-line no-path-concat
        else res.send('ERROR')
      })
    } else {
      res.send('Incorrect Password!')
    }
  }
})

app.get('/update', function (req, res) {
  var update = childProcess.execSync('git pull').toString()
  console.log(update)
  res.send(update)
})

/* eslint-disable no-path-concat */
app.get('/restart', () => process.exit())
app.get('/', (req, res) => res.sendFile(__dirname + '/frobotime.html'))
app.get('/frobotime.html', (req, res) => res.sendFile(__dirname + '/frobotime.html'))
app.get('/workshop.html', (req, res) => res.sendFile(__dirname + '/workshop.html'))
app.get('/data/data.json', (req, res) => res.sendFile(__dirname + '/data/data.json'))
app.get('/main.css', (req, res) => res.sendFile(__dirname + '/main.css'))
app.get('/logo.jpg', (req, res) => res.sendFile(__dirname + '/logo.jpg'))

app.use((req, res) => res.sendFile(__dirname + '/static/404.html'))
/* eslint-enable no-path-concat */
app.use('/', express.static('static'))

app.listen(8080)
