import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'
const Router = express.Router()

Router.route('/')
  .get(productController.getAll)
  .post(productValidation.createNew, productController.createNew)

Router.route('/:id')
  .get(productController.getById)
  .put(productValidation.update, productController.update)
  .delete(productController.deleteItem)

export const productRoute = Router