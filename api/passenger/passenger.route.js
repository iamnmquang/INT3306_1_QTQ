const passengerRouter = require('express').Router()
const PassengerController = require('../controllers/passenger.controller.js');

passengerRouter.get('/', PassengerController.getAll);
passengerRouter.get('/:id', PassengerController.getById);
passengerRouter.post('/', PassengerController.create);
passengerRouter.put('/:id', PassengerController.update);
passengerRouter.delete('/:id', PassengerController.delete);

module.exports = passengerRouter;
