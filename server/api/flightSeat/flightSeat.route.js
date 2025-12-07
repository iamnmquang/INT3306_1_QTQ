const flightSeatRouter = require('express').Router()
const FlightSeatController = require('./flightSeat.controller')
const { isAuthenticated} = require('../../utils/middlewares')


flightSeatRouter.post('/lock-seats', isAuthenticated, FlightSeatController.lockSeats);

flightSeatRouter.post('/unlock-seats', isAuthenticated, FlightSeatController.unlockSeats);

flightSeatRouter.get('/get-available-seats/:flightSeatId', isAuthenticated, FlightSeatController.getAvailableSeats);

module.exports = flightSeatRouter; 