import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    categoryId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
      'any.required': 'Tên danh mục là bắt buộc',
      'string.empty': 'Danh mục không được để trống!',
      'string.min': 'Tên danh mục phải dài ít nhất 3 ký tự!',
      'string.max': 'Tên danh mục không được vượt quá 50 ký tự!'
    }, OBJECT_ID_RULE_MESSAGE),
    productName: Joi.string().required().min(3).max(100).trim().strict().messages({
      'any.required': 'Tên sản phẩm là bắt buộc',
      'string.empty': 'Tên sản phẩm không được để trống!',
      'string.min': 'Tên sản phẩm phải dài ít nhất 3 ký tự!',
      'string.max': 'Tên sản phẩm không được vượt quá 50 ký tự!'
    }),
    description: Joi.string().optional().allow(''),
    price: Joi.number().required().min(0).message({
      'number.min': 'Giá bán phải là số dương!',
      'number.empty': 'Giá bán không được để trống!'
    }),
    img: Joi.array().items(Joi.string()).default([]),
    quantity: Joi.number().required().min(0).message({
      'number.min': 'Số lượng phải là số dương!',
      'number.empty': 'Số lượng không được để trống!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error.details.map(detail => detail.message).join('-')
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    categoryId: Joi.string().required().pattern(OBJECT_ID_RULE).messages({
      'any.required': 'Tên danh mục là bắt buộc',
      'string.empty': 'Danh mục không được để trống!',
      'string.min': 'Tên danh mục phải dài ít nhất 3 ký tự!',
      'string.max': 'Tên danh mục không được vượt quá 50 ký tự!'
    }, OBJECT_ID_RULE_MESSAGE),
    productName: Joi.string().required().min(3).max(100).trim().strict().messages({
      'any.required': 'Tên sản phẩm là bắt buộc',
      'string.empty': 'Tên sản phẩm không được để trống!',
      'string.min': 'Tên sản phẩm phải dài ít nhất 3 ký tự!',
      'string.max': 'Tên sản phẩm không được vượt quá 50 ký tự!'
    }),
    description: Joi.string().optional().allow(''),
    price: Joi.number().required().min(0).message({
      'number.min': 'Giá bán phải là số dương!',
      'number.empty': 'Giá bán không được để trống!'
    }),
    img: Joi.array().items(Joi.string()).default([]),
    quantity: Joi.number().required().min(0).message({
      'number.min': 'Số lượng phải là số dương!',
      'number.empty': 'Số lượng không được để trống!'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error.details.map(detail => detail.message).join('-')
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const productValidation = {
  createNew,
  update
}