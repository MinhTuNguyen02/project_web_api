import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const NEWS_COLLECTION_NAME = 'news'
const NEWS_COLLECTION_SCHEMA = Joi.object({
  img: Joi.string().optional().allow('').trim().strict(),
  title: Joi.string().required().min(2).max(100).trim().strict(),
  content: Joi.string().optional().allow('').trim().strict(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await NEWS_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newNewsToAdd = {
      ...validData
    }
    const createdNews = await GET_DB().collection(NEWS_COLLECTION_NAME).insertOne(newNewsToAdd)
    return createdNews
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(NEWS_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    const result = await GET_DB().collection(NEWS_COLLECTION_NAME).find({ _destroy: false }).toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (newsId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const result = await GET_DB().collection(NEWS_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(newsId) },
      { $set: { ...validData, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    if (!result) {
      throw new Error('News not found')
    }
    return result
  } catch (error) {
    if (error.message.includes('ObjectId')) {
      throw new Error('Invalid news ID')
    }
    throw error
  }
}

const deleteItem = async (id) => {
  try {
    const result = await GET_DB().collection(NEWS_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id), _destroy: false },
      { $set: { _destroy: true, updateAt: Date.now() } },
      { returnDocument: 'after' }
    )
    if (!result) {
      throw new Error('News not found or already deleted')
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const newsModel = {
  NEWS_COLLECTION_NAME,
  NEWS_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getAll,
  update,
  deleteItem
}