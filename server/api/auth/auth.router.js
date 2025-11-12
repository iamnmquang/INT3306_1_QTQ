const authRouter = require('express').Router()
const AuthController = require('./auth.controller')

authRouter.post('/register', AuthController.register)
authRouter.post('/verify-register-email', AuthController.verifyRegisterEmail)

authRouter.post('/login', AuthController.login)
authRouter.post('/refreshToken', AuthController.refreshToken)

authRouter.post('/forgot-password',AuthController.forgotPassword)
authRouter.post('/verify-reset-email', AuthController.verifyResetEmail)
authRouter.post('/reset-password', AuthController.resetPassword)

module.exports = authRouter