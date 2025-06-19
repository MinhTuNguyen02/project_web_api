import express from 'express'
import { newsValidation } from '~/validations/newsValidation'
import { newsController } from '~/controllers/newsController'


const Router = express.Router()

Router.route('/')
  .get(newsController.getAll)
  .post(newsValidation.createNew, newsController.createNew)

Router.route('/:id')
  .get(newsController.getById)
  .put(newsValidation.update, newsController.update)
  .delete(newsController.deleteItem)

export const newsRoute = Router