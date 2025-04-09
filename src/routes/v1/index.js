import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { categoryRoute } from '~/routes/v1/categoryRoute'
import { productRoute } from '~/routes/v1/productRoute'
// import { warehouseRoute } from '~/routes/v1/warehouseRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use' })
})

// Router.use('/warehouses', warehouseRoute)
Router.use('/categories', categoryRoute)
Router.use('/products', productRoute)

export const APIs_V1 = Router