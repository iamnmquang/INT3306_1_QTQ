const authRouter = require('express').Router()
const AuthController = require('./auth.controller')
const { isAuthenticated } = require('../../utils/middlewares')

authRouter.post('/register', AuthController.register)
authRouter.post('/verify-register-email', AuthController.verifyRegisterEmail)

authRouter.post('/login', AuthController.login)
authRouter.post('/refreshToken', AuthController.refreshToken)
authRouter.post('/logout', isAuthenticated, AuthController.logout)

authRouter.post('/forgot-password', AuthController.forgotPassword)
authRouter.post('/verify-reset-email', AuthController.verifyResetEmail)
authRouter.post('/change-password', AuthController.changePassword)



module.exports = authRouter