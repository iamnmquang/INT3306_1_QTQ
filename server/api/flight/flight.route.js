const flightsRouter = require('express').Router();
const FlightController = require('./flight.controller');
const { isAuthenticated, authorizeRole } = require('../../utils/middlewares');

flightsRouter.get(
  '/',
  isAuthenticated,
  authorizeRole('ADMIN'),
  FlightController.getAll);
flightsRouter.get(
  '/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  FlightController.getById);
flightsRouter.post('/',
  isAuthenticated,
  authorizeRole('ADMIN'),
  FlightController.create);
flightsRouter.put('/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  FlightController.update);
flightsRouter.delete('/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  FlightController.delete);

flightsRouter.get('/search', FlightController.searchFlights)

module.exports = flightsRouter;
