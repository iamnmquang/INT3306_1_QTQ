const express = require('express')
const bodyParser = require('body-parser')
const config = require('./utils/config')
const logger = require('./utils/logger')
const mysql = require('mysql2')

const app = express()



logger.info('connecting to', config.SQL_CONFIG.database)

const con = mysql.createConnection(config.SQL_CONFIG)

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!!!")
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



module.exports = app