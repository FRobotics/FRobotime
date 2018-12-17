process.chdir(__dirname)
const path = require('path'); const fs = require('fs')
const express = require('express'); const client = express()
const bodyParser = require('body-parser')
const db = require('./db.js'); db.initialize()

/* **************************************************************************************************** *\
Functions
\* **************************************************************************************************** */
/**
 * Lists the directories in a directory.
 * @param {string} dir The directory that you want to get a list of directories from.
 * @return {Array<string>} Returns all the folder names.
 */
var listDirs = dir => {
  return fs.readdirSync(dir).filter(d => fs.statSync(path.join(dir, d)).isDirectory())
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

/* **************************************************************************************************** *\
Web Server
\* **************************************************************************************************** */
client.use(bodyParser.json()) // For parsing application/json.
client.use(bodyParser.urlencoded({ extended: true }))

// app.post('/submit', (req, res) => {
//   console.log(req.body)
//   if (req.body.name && req.body.type) {
//     if (req.body.type === 'hours') {
//       db.checkHours(req.body.name).then(hours => {
//         res.send(hours)
//       })
//     } else if (db.workshopInProgress()) {
//       console.log(req.body)
//       db.store(req.body)
//       res.render('success', { title: 'FRobotime', message: 'Success!' })
//     } else {
//       res.sendFile(process.cwd() + '/static/noworkshop.html')
//     }
//   }
// })

var htmlPath = path.join(process.cwd(), './src/html')
var ht = (i) => path.join(htmlPath, i)

client.get('/', (req, res) => res.sendFile(ht('index.html')))

listDirs('src').forEach(d => {
  listFiles(path.join(process.cwd(), `src/${d}`)).forEach((f) => {
    var fn = f.split('.')
    client.use(fn[1] === 'html' ? `/${fn[0]}` : `/${f}`, (req, res) => res.sendFile(path.join(process.cwd(), `src/${d}/${f}`)))
    if (fn[1] === 'html') client.use(`/${f}`, (req, res) => res.redirect(`/${fn[0]}`))
    console.log(`${d} | ${f}`)
  })
})

client.use((req, res) => res.sendFile(ht('404.html')))
client.listen(8080)
