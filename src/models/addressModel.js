import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const ADDRESS_COLLECTION_NAME = 'addresses'
const ADDRESS_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/).strict(),
  recipientName: Joi.string().required().min(2).max(50).trim().strict(),
  phoneNumber: Joi.string().pattern(/^\d{10}$/).required().trim().strict(),
  address: Joi.string().required().min(5).max(200).trim().strict(),
  isDefault: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
  try {
    return await ADDRESS_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
  } catch (error) {
    throw new Error(error.message)
  }
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    if (validData.isDefault) {
      await GET_DB()
        .collection(ADDRESS_COLLECTION_NAME)
        .updateMany(
          { userId: validData.userId, isDefault: true },
          { $set: { isDefault: false } }
        )
    }
    const createdAddress = await GET_DB()
      .collection(ADDRESS_COLLECTION_NAME)
      .insertOne({ ...validData })
    return await findOneById(createdAddress.insertedId)
  } catch (error) {
    throw new Error(error.message)
  }
}

const findOneById = async (id) => {
  try {
    return await GET_DB()
      .collection(ADDRESS_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })
  } catch (error) {
    throw new Error(error)
  }
}

const findByUserId = async (_id) => {
  try {
    return await GET_DB()
      .collection(ADDRESS_COLLECTION_NAME)
      .find({ userId: _id })
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (id, _id, data) => {
  try {
    const validData = await ADDRESS_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
    if (validData.isDefault) {
      await GET_DB()
        .collection(ADDRESS_COLLECTION_NAME)
        .updateMany(
          { userId: _id, isDefault: true, _id: { $ne: new ObjectId(id) } },
          { $set: { isDefault: false } }
        )
    }
    const result = await GET_DB()
      .collection(ADDRESS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id), userId: _id },
        { $set: { ...validData, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    if (!result) {
      throw new Error('Không tìm thấy địa chỉ hoặc bạn không có quyền cập nhật')
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteOne = async (id, _id) => {
  try {
    const result = await GET_DB()
      .collection(ADDRESS_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id), userId: _id })
    if (result.deletedCount === 0) {
      throw new Error('Không tìm thấy địa chỉ hoặc bạn không có quyền xóa')
    }
    return { message: 'Xóa địa chỉ thành công' }
  } catch (error) {
    throw new Error(error)
  }
}

export const addressModel = {
  ADDRESS_COLLECTION_NAME,
  ADDRESS_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findByUserId,
  update,
  deleteOne
}