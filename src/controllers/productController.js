import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'

const createNew = async (req, res, next) => {
  try {
    //Điều hướng dữ liệu sang tầng Service
    const createdProduct = await productService.createNew(req.body)

    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdProduct)
  } catch (error) { next(error) }
}

const getAll = async (req, res, next) => {
  try {
    const { categoryId } = req.query
    const products = await productService.getAll(categoryId)
    res.status(StatusCodes.OK).json(products)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const productId = req.params.id
    const updatedProduct = await productService.update(productId, req.body)
    res.status(StatusCodes.OK).json(updatedProduct)
  } catch (error) {
    if (error.message === 'Product not found' || error.message === 'Invalid product ID') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
    next(error)
  }
}

export const productController = {
  createNew,
  getAll,
  update
}