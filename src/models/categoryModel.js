import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'


//define collection
const CATEGORY_COLLECTION_NAME = 'categories'
const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  categoryName: Joi.string().required().min(2).max(50).trim().strict(),
  description: Joi.string().optional().allow(''),
  img: Joi.string().optional().allow('').trim().strict(),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await CATEGORY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newCategoryToAdd = {
      ...validData
    }
    const createdCategory = await GET_DB().collection(CATEGORY_COLLECTION_NAME).insertOne(newCategoryToAdd)
    return createdCategory
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}


const getAll = async () => {
  try {
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).find({}).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (categoryId, data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(categoryId) },
      { $set: { ...validData, updateAt: Date.now() } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const categoryModel = {
  CATEGORY_COLLECTION_NAME,
  CATEGORY_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getAll,
  update
}