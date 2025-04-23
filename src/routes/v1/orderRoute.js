import express from 'express'
import { orderController } from '~/controllers/orderController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.verifyToken, orderController.createOrder)
  .get(authMiddleware.verifyToken, authMiddleware.isAdmin, orderController.getAllOrders)

Router.route('/me')
  .get(authMiddleware.verifyToken, orderController.getOrders)

Router.route('/:id')
  .get(authMiddleware.verifyToken, orderController.getOrderById)

Router.route('/:id/cancel')
  .put(authMiddleware.verifyToken, orderController.cancelOrder)

Router.route('/:id/status')
  .put(authMiddleware.verifyToken, authMiddleware.isAdmin, orderController.updateOrderStatus)

Router.route('/:id/receive')
  .put(authMiddleware.verifyToken, orderController.receiveOrder)

export const orderRoute = Router