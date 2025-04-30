import express from 'express'
import { messageValidation } from '~/validations/messageValidation'
import { messageController } from '~/controllers/messageController'

const Router = express.Router()

Router.route('/')
  .post(messageValidation.createNew, messageController.createNew)
  .get(messageController.getAll)

export const messageRoute = Router