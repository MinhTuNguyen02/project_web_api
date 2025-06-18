import express from 'express'
import { categoryValidation } from '~/validations/categoryValidation'
import { categoryController } from '~/controllers/categoryController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(categoryController.getAll)
  .post(authMiddleware.isAdmin, categoryValidation.createNew, categoryController.createNew)

Router.route('/:id')
  .put(authMiddleware.isAdmin, categoryValidation.update, categoryController.update)

export const categoryRoute = Router