const usersRouter = require('express').Router()
const UserController = require('../controllers/user.controller')

usersRouter.get('/', UserController.getAll);
usersRouter.get('/:id', UserController.getById);
usersRouter.post('/', UserController.create);
usersRouter.put('/:id', UserController.update);
usersRouter.delete('/:id', UserController.delete);

module.exports = usersRouter;
