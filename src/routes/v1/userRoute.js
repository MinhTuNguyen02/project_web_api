import express from 'express'
import { userController } from '~/controllers/userController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/register').post(userController.register)
Router.route('/login').post(userController.login)
Router.route('/me').get(authMiddleware.verifyToken, userController.getMe)
Router.route('/me').put(authMiddleware.verifyToken, userController.updateUserInfo)
Router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, userController.getAllUsers)
Router.route('/change-password').post(authMiddleware.verifyToken, userController.changePassword)
Router.route('/forgot-password').post(userController.forgotPassword)
Router.route('/reset-password').post(userController.resetPassword)
export const userRoute = Router