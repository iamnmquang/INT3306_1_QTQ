const userRouter = require('express').Router()
const { isAuthenticated, authorizeRole } = require('../../utils/middlewares');
const UserController = require('./user.controller')

userRouter.get(
  '/profile',
  isAuthenticated,
  UserController.profile);

userRouter.get(
  '/',
  isAuthenticated,
  authorizeRole('ADMIN'),
  UserController.getAll
);
userRouter.get(
  '/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  UserController.getById);

userRouter.post(
  '/',
  isAuthenticated,
  authorizeRole('ADMIN'),
  UserController.create);

userRouter.put(
  '/:id',
  isAuthenticated,
  UserController.update);

userRouter.delete(
  '/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  UserController.delete);

module.exports = userRouter;
