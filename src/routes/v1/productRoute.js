import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'
const Router = express.Router()

Router.route('/')
  .post(productValidation.createNew, productController.createNew)

export const productRoute = Router