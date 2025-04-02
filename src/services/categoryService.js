/* eslint-disable no-useless-catch */
import { categoryModel } from '~/models/categoryModel'
import { warehouseModel } from '~/models/warehouseModel'

const createNew = async (reqBody) => {
  try {
    const newCategory = {
      ...reqBody
    }

    //Gọi đến tầng Model để xử lý, lưu dữ liệu vào database
    const createdCategory = await categoryModel.createNew(newCategory)

    //Lấy bản ghi sau khi gọi
    const getNewCategory = await categoryModel.findOneById(createdCategory.insertedId)

    if (getNewCategory) {
      getNewCategory.products = []

      await warehouseModel.pushListCategories(getNewCategory)
    }

    return getNewCategory
  } catch (error) {
    throw error
  }
}


export const categoryService = {
  createNew
}