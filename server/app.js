const express = require('express')
const bodyParser = require('body-parser')
const userRouter = require('./api/user/user.route')
const authRouter = require('./api/auth/auth.router')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/users', userRouter)
app.use('/api/auth', authRouter)

module.exports = app
