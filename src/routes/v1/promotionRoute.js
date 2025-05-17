import express from 'express'
import { promotionValidation } from '~/validations/promotionValidation'
import { promotionController } from '~/controllers/promotionController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/validate')
  .post(authMiddleware.verifyToken, promotionValidation.validatePromotion, promotionController.validatePromotion)

Router.route('/')
  .get(promotionController.getAllPromotions)
  .post(authMiddleware.verifyToken, authMiddleware.isAdmin, promotionValidation.createNew, promotionController.createNew)

Router.route('/:id')
  .put(authMiddleware.verifyToken, authMiddleware.isAdmin, promotionValidation.update, promotionController.update)
  .delete(authMiddleware.verifyToken, authMiddleware.isAdmin, promotionController.deletePromotion)

export const promotionRoute = Router