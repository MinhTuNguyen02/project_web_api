import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const Router = express.Router()

Router.route('/')
  .get(productController.getAll)
  .post(authMiddleware.isAdmin, productValidation.createNew, productController.createNew)

Router.route('/:id')
  .get(productController.getById)
  .put(authMiddleware.isAdmin, productValidation.update, productController.update)
  .delete(authMiddleware.isAdmin, productController.deleteItem)

export const productRoute = Router