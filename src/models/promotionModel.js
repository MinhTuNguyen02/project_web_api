import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const PROMOTION_COLLECTION_NAME = 'promotions'
const PROMOTION_COLLECTION_SCHEMA = Joi.object({
  code: Joi.string().required().min(3).max(20).trim().strict().uppercase(),
  type: Joi.string().required().valid('fixed', 'percentage', 'free_shipping'),
  value: Joi.number().required().min(0),
  minOrderValue: Joi.number().default(0).min(0),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  maxUses: Joi.number().default(0).min(0),
  usedCount: Joi.number().default(0).min(0),
  maxUsesPerUser: Joi.number().default(1).min(0),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await PROMOTION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newPromotion = { ...validData }
    const result = await GET_DB().collection(PROMOTION_COLLECTION_NAME).insertOne(newPromotion)
    const createdPromotion = await GET_DB().collection(PROMOTION_COLLECTION_NAME).findOne({
      _id: result.insertedId
    })
    return createdPromotion
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByCode = async (code) => {
  try {
    const result = await GET_DB().collection(PROMOTION_COLLECTION_NAME).findOne({
      code: code.toUpperCase(),
      isActive: true,
      _destroy: false
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const incrementUsedCount = async (code, session) => {
  try {
    const result = await GET_DB().collection(PROMOTION_COLLECTION_NAME).findOneAndUpdate(
      { code: code.toUpperCase(), isActive: true, _destroy: false },
      { $inc: { usedCount: 1 }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after', session }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAllPromotions = async (query) => {
  try {
    const promotions = await GET_DB().collection(PROMOTION_COLLECTION_NAME).find(query).toArray()
    return promotions
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const validData = await PROMOTION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    const result = await GET_DB().collection(PROMOTION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id), _destroy: false },
      { $set: { ...validData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deletePromotion = async (id) => {
  try {
    const result = await GET_DB().collection(PROMOTION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id), _destroy: false },
      { $set: { _destroy: true, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const promotionModel = {
  PROMOTION_COLLECTION_NAME,
  PROMOTION_COLLECTION_SCHEMA,
  createNew,
  findOneByCode,
  incrementUsedCount,
  getAllPromotions,
  update,
  deletePromotion
}