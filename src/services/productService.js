/* eslint-disable no-useless-catch */
import { productModel } from '~/models/productModel'

const createNew = async (reqBody) => {
  try {
    const { quantity, ...rest } = reqBody // Tách quantity ra
    const newProduct = {
      ...rest,
      inventory: quantity
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

const getAll = async (categoryId, name, sort, limit) => {
  try {
    const products = await productModel.getAll(categoryId, name, sort, limit)
    return products
  } catch (error) {
    throw error
  }
}

const getById = async (id) => {
  try {
    const product = await productModel.findOneById(id)
    if (!product) {
      throw new Error('Không tìm thấy sản phẩm')
    }
    return product
  } catch (error) {
    throw error
  }
}

const update = async (productId, reqBody) => {
  try {
    const { quantity, ...rest } = reqBody
    const existingProduct = await productModel.findOneById(productId)
    if (!existingProduct) {
      throw new Error('Không tìm thấy sản phẩm')
    }
    const newInventory = existingProduct.inventory + (quantity || 0) // Cộng quantity vào inventory
    const updateData = {
      ...rest,
      inventory: newInventory,
      updateAt: Date.now()
    }
    const updatedProduct = await productModel.update(productId, updateData)
    return updatedProduct
  } catch (error) {
    throw error
  }
}

const deleteItem = async (id) => {
  try {
    const deletedProduct = await productModel.deleteItem(id)
    return deletedProduct
  } catch (error) {
    throw error
  }
}


export const productService = {
  createNew,
  getAll,
  getById,
  update,
  deleteItem
}