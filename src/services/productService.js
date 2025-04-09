/* eslint-disable no-useless-catch */
import { productModel } from '~/models/productModel'
import { categoryModel } from '~/models/categoryModel'

const createNew = async (reqBody) => {
  try {
    const newProduct = {
      ...reqBody
    }

    //Gọi đến tầng Model để xử lý, lưu dữ liệu vào database
    const createdProduct = await productModel.createNew(newProduct)

    //Lấy bản ghi sau khi gọi
    const getNewProduct = await productModel.findOneById(createdProduct.insertedId)

    if (getNewProduct) {
      await categoryModel.pushListProducts(getNewProduct)
    }

    return getNewProduct
  } catch (error) {
    throw error
  }
}

const getAll = async (categoryId) => {
  try {
    const products = await productModel.getAll(categoryId)
    return products
  } catch (error) {
    throw error
  }
}


export const productService = {
  createNew,
  getAll
}