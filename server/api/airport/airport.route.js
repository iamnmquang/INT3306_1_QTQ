const airportsRouter = require('express').Router();
const AirportController = require('../controllers/airport.controller');

airportsRouter.get('/', AirportController.getAll);
airportsRouter.get('/:id', AirportController.getById);
airportsRouter.post('/', AirportController.create);
airportsRouter.put('/:id', AirportController.update);
airportsRouter.delete('/:id', AirportController.delete);

module.exports = airportsRouter;
