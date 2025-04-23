import express from 'express'
import { addressController } from '~/controllers/addressController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware.verifyToken, addressController.createNew)
  .get(authMiddleware.verifyToken, addressController.getByUserId)

Router.route('/:id')
  .put(authMiddleware.verifyToken, addressController.update)
  .delete(authMiddleware.verifyToken, addressController.deleteOne)

export const addressRoute = Router