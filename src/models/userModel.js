import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().email().required().trim().strict(),
  password: Joi.string().required().min(6).trim().strict(),
  role: Joi.string().valid('user', 'admin').default('user'),
  fullName: Joi.string().optional().trim().strict(),
  phoneNumber: Joi.string().pattern(/^\d{10}$/).optional().trim().strict(),
  resetToken: Joi.string().optional().allow(null),
  resetTokenExpiry: Joi.number().optional().allow(null),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const hashedPassword = await bcrypt.hash(validData.password, 10)
    const newUser = {
      ...validData,
      password: hashedPassword
    }
    const createdUser = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .insertOne(newUser)
    return await findOneById(createdUser.insertedId)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (email) => {
  try {
    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ email })
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByResetToken = async (resetToken) => {
  try {
    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({ resetToken })
  } catch (error) {
    throw new Error(error)
  }
}

const findAll = async () => {
  try {
    return await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .find()
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, data) => {
  try {
    const result = await GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...data, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    if (!result) {
      throw new Error('Không tìm thấy user để cập nhật')
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  findOneByResetToken,
  findAll,
  update
}