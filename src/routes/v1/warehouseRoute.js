import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { warehouseValidation } from '~/validations/warehouseValidation'
import { warehouseController } from '~/controllers/warehouseController'
const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Note: API get list example' })
  })
  .post(warehouseValidation.createNew, warehouseController.createNew)

Router.route('/:id')
  .get(warehouseController.getDetails)
  .put()

export const warehouseRoute = Router