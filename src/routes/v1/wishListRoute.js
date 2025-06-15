import express from 'express'
import { wishlistController } from '~/controllers/wishListController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const router = express.Router()

router.get('/', authMiddleware.verifyToken, wishlistController.getWishlist)
router.post('/add/:productId', authMiddleware.verifyToken, wishlistController.addToWishlist)
router.delete('/remove/:productId', authMiddleware.verifyToken, wishlistController.removeFromWishlist)

export const wishlistRoute = router