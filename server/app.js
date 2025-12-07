const express = require('express')
const bodyParser = require('body-parser')
const userRouter = require('./api/user/user.route')
const authRouter = require('./api/auth/auth.route')
const flightsRouter = require('./api/flight/flight.route')
const flightSeatRouter = require('./api/flightSeat/flightSeat.route')
const ticketRouter = require('./api/ticket/ticket.route')
const aircraftRouter = require('./api/aircraft/aircraft.route')
const airportRouter = require('./api/airport/airport.route')
const newsRouter = require('./api/news/new.route')
const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/flight', flightsRouter)
app.use('/flightSeat', flightSeatRouter )
app.use('/ticket', ticketRouter)
app.use('/aircraft', aircraftRouter)
app.use('/airport', airportRouter)
app.use('/news', newsRouter)

module.exports = app
