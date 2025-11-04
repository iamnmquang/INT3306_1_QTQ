const express = require('express')
const bodyParser = require('body-parser')
const logger = require('./utils/logger')
const userRouter = require('./routes/user.route')

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', userRouter)

module.exports = app