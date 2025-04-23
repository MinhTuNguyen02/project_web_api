import express from 'express'
import { cartController } from '~/controllers/cartController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.post('/', authMiddleware.verifyToken, cartController.addToCart)
router.get('/', authMiddleware.verifyToken, cartController.getCart)
router.put('/item/:productId', authMiddleware.verifyToken, cartController.updateQuantity)
router.delete('/item/:productId', authMiddleware.verifyToken, cartController.deleteItem)

export const cartRoute = router