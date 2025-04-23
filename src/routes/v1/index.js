import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { categoryRoute } from '~/routes/v1/categoryRoute'
import { productRoute } from '~/routes/v1/productRoute'
import { userRoute } from './userRoute'
import { cartRoute } from './cartRoute'
import { wishlistRoute } from './wishListRoute'
import { addressRoute } from './addressRoute'
import { orderRoute } from './orderRoute'

const Router = express.Router()

Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use' })
})

Router.use('/categories', categoryRoute)
Router.use('/products', productRoute)
Router.use('/users', userRoute)
Router.use('/cart', cartRoute)
Router.use('/wishlist', wishlistRoute)
Router.use('/addresses', addressRoute)
Router.use('/orders', orderRoute)

export const APIs_V1 = Router