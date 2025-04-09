import express from 'express'
import { categoryValidation } from '~/validations/categoryValidation'
import { categoryController } from '~/controllers/categoryController'
const Router = express.Router()

Router.route('/')
  .get(categoryController.getAll)
  .post(categoryValidation.createNew, categoryController.createNew)

Router.route('/:id')
  .put(categoryValidation.update, categoryController.update)

export const categoryRoute = Router