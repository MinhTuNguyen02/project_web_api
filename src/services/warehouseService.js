/* eslint-disable no-useless-catch */
import { slugify } from '~/utils/formatters'
import { warehouseModel } from '~/models/warehouseModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
const createNew = async (reqBody) => {
  try {
    const newWarehouse = {
      ...reqBody,
      slug: slugify(reqBody.warehouseName)
    }

    //Gọi đến tầng Model để xử lý, lưu dữ liệu vào database
    const createdWarehouse = await warehouseModel.createNew(newWarehouse)

    //Lấy bản ghi sau khi gọi
    const getNewWarehouse = await warehouseModel.findOneById(createdWarehouse.insertedId)

    return getNewWarehouse
  } catch (error) {
    throw error
  }
}

const getDetails = async (warehouseId) => {
  try {
    const warehouse = await warehouseModel.getDetails(warehouseId)
    if (!warehouse) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Warehouse not found')
    }

    const resWarehouse = cloneDeep(warehouse)
    resWarehouse.categories.forEach(category => {
      category.products = resWarehouse.products.filter(product => product.categoryId.equals(category._id))
    })

    delete resWarehouse.products

    return resWarehouse
  } catch (error) {
    throw error
  }
}

export const warehouseService = {
  createNew,
  getDetails
}