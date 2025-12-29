const userRouter = require('express').Router()
const { isAuthenticated, authorizeRole } = require('../../utils/middlewares');
const UserController = require('./user.controller')
const upload = require('../../utils/upload');

/* ===== PROFILE (PHẢI ĐẶT TRÊN) ===== */
userRouter.get(
  '/profile',
  isAuthenticated,
  UserController.profile
);

userRouter.put(
  '/profile',
  isAuthenticated,
  UserController.updateProfile
);

userRouter.put(
  '/profile/avatar',
  isAuthenticated,
  upload.single('avatar'),
  UserController.updateAvatar
);

userRouter.put(
  '/profile/password',
  isAuthenticated,
  UserController.changePassword
);

/* ===== ADMIN / GENERIC ===== */
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
  UserController.getById
);

userRouter.post(
  '/',
  isAuthenticated,
  authorizeRole('ADMIN'),
  UserController.create
);

userRouter.put(
  '/:id',
  isAuthenticated,
  UserController.update
);

userRouter.delete(
  '/:id',
  isAuthenticated,
  authorizeRole('ADMIN'),
  UserController.delete
);

module.exports = userRouter;
