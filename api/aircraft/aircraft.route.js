const aircraftRouter = require('express').Router();
const AircraftController = require('../controllers/aircraft.controller.js');

aircraftRouter.get('/', AircraftController.getAll);
aircraftRouter.get('/:id', AircraftController.getById);
aircraftRouter.post('/', AircraftController.create);
aircraftRouter.put('/:id', AircraftController.update);
aircraftRouter.delete('/:id', AircraftController.delete);

module.exports = aircraftRouter;
