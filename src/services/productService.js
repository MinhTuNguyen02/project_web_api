/* eslint-disable no-useless-catch */
import { productModel } from '~/models/productModel'

const createNew = async (reqBody) => {
  try {
    const newProduct = {
      ...reqBody
    }

    //Gọi đến tầng Model để xử lý, lưu dữ liệu vào database
    const createdProduct = await productModel.createNew(newProduct)

    //Lấy bản ghi sau khi gọi
    const getNewProduct = await productModel.findOneById(createdProduct.insertedId)

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

const update = async (productId, reqBody) => {
  try {
    const updatedData = { ...reqBody }
    const updatedProduct = await productModel.update(productId, updatedData)
    return updatedProduct
  } catch (error) {
    throw error
  }
}


export const productService = {
  createNew,
  getAll,
  update
}