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


export const productController = {
  createNew
}