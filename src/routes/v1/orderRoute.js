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

Router.route('/stats/daily')
  .get(authMiddleware.verifyToken, authMiddleware.isAdmin, orderController.getDailyStats)

Router.route('/stats/monthly')
  .get(authMiddleware.verifyToken, authMiddleware.isAdmin, orderController.getMonthlyStats)

Router.route('/stats/top-products')
  .get(authMiddleware.verifyToken, authMiddleware.isAdmin, orderController.getTopProducts)
export const orderRoute = Router