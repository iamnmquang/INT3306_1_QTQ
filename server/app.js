const express = require('express')
const bodyParser = require('body-parser')
const userRouter = require('./api/user/user.route')
const authRouter = require('./api/auth/auth.router')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', userRouter)
app.use('/auth', authRouter)

module.exports = app