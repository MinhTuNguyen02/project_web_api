import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { categoryModel } from './categoryModel'
import { productModel } from './productModel'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

//define collection
const WAREHOUSE_COLLECTION_NAME = 'warehouses'
const WAREHOUSE_COLLECTION_SCHEMA = Joi.object({
  warehouseName: Joi.string().required().min(3).max(50).trim().strict(),
  location: Joi.string().required().min(3).max(100).trim().strict(),
  phone: Joi.string().required().min(10).max(10).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),

  listCategories: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await WAREHOUSE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdWarehouse = await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).insertOne(validData)
    return createdWarehouse
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (id) => {
  try {
    // const result = await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).findOne( {_id: new ObjectId(id)} )
    const result = await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(id),
        _destroy: false
      } },
      { $lookup: {
        from: categoryModel.CATEGORY_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'warehouseId',
        as: 'categories'
      } },
      { $lookup: {
        from: productModel.PRODUCT_COLLECTION_NAME,
        localField: '_id',
        foreignField: 'warehouseId',
        as: 'products'
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}

const pushListCategories = async (category) => {
  try {
    const result = await GET_DB().collection(WAREHOUSE_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(category.warehouseId) },
      { $push: { listCategories: new ObjectId(category._id) } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw new Error(error)
  }
}

export const warehouseModel = {
  WAREHOUSE_COLLECTION_NAME,
  WAREHOUSE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushListCategories
}