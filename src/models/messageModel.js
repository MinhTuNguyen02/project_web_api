import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const MESSAGE_COLLECTION_NAME = 'messages'
const MESSAGE_COLLECTION_SCHEMA = Joi.object({
  type: Joi.string()
    .valid('contact', 'subscription')
    .required()
    .messages({
      'any.required': 'Loại tin nhắn là bắt buộc!',
      'any.only': 'Loại tin nhắn phải là "contact" hoặc "subscription"!'
    }),
  fullName: Joi.string().min(2).max(50).trim().strict().when('type', {
    is: 'contact',
    then: Joi.required(),
    otherwise: Joi.optional().allow('')
  }).messages({
    'string.min': 'Họ và tên phải dài ít nhất 2 ký tự!',
    'string.max': 'Họ và tên không được vượt quá 50 ký tự!',
    'any.required': 'Họ và tên là bắt buộc cho tin nhắn liên hệ!'
  }),
  email: Joi.string().required().email({ tlds: { allow: false } }).trim().strict().messages({
    'any.required': 'Email là bắt buộc!',
    'string.email': 'Vui lòng nhập email hợp lệ!'
  }),
  phone: Joi.string().pattern(/^\d{10,11}$/).when('type', {
    is: 'contact',
    then: Joi.required(),
    otherwise: Joi.optional().allow('')
  }).messages({
    'any.required': 'Số điện thoại là bắt buộc cho tin nhắn liên hệ!',
    'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số!'
  }),
  content: Joi.string().required().trim().strict().messages({
    'any.required': 'Nội dung là bắt buộc!',
    'string.empty': 'Nội dung không được để trống!'
  }),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await MESSAGE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newMessageToAdd = {
      ...validData
    }
    const createdMessage = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .insertOne(newMessageToAdd)
    const getNewMessage = await findOneById(createdMessage.insertedId)
    return getNewMessage
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    const result = await GET_DB()
      .collection(MESSAGE_COLLECTION_NAME)
      .find({ _destroy: false })
      .toArray()
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const messageModel = {
  MESSAGE_COLLECTION_NAME,
  MESSAGE_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getAll
}