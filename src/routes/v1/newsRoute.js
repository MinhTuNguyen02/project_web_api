import express from 'express'
import { newsValidation } from '~/validations/newsValidation'
import { newsController } from '~/controllers/newsController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .get(newsController.getAll)
  .post(authMiddleware.isAdmin, newsValidation.createNew, newsController.createNew)

Router.route('/:id')
  .get(newsController.getById)
  .put(authMiddleware.isAdmin, newsValidation.update, newsController.update)
  .delete(authMiddleware.isAdmin, newsController.deleteItem)

export const newsRoute = Router