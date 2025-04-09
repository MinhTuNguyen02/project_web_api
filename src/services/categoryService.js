/* eslint-disable no-useless-catch */
import { categoryModel } from '~/models/categoryModel'

const createNew = async (reqBody) => {
  try {
    const newCategory = {
      ...reqBody
    }

    //Gọi đến tầng Model để xử lý, lưu dữ liệu vào database
    const createdCategory = await categoryModel.createNew(newCategory)

    //Lấy bản ghi sau khi gọi
    const getNewCategory = await categoryModel.findOneById(createdCategory.insertedId)

    return getNewCategory
  } catch (error) {
    throw error
  }
}

const getAll = async () => {
  try {
    const categories = await categoryModel.getAll()
    return categories
  } catch (error) {
    throw error
  }
}

const update = async (categoryId, reqBody) => {
  try {
    const updatedData = { ...reqBody }
    const updatedCategory = await categoryModel.update(categoryId, updatedData)
    return updatedCategory
  } catch (error) {
    throw error
  }
}

export const categoryService = {
  createNew,
  getAll,
  update
}