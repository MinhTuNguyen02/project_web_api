import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { customerValidation } from '~/validations/customerValidation'
import { customerController } from '~/controllers/customerController'
const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Note: API get list example' })
  })
  .post(customerValidation.createNew, customerController.createNew)

export const customerRoute = Router