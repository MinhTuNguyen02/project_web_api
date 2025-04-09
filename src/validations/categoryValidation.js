import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    categoryName: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Tên danh mục là bắt buộc',
      'string.empty': 'Tên danh mục không được để trống!',
      'string.min': 'Tên danh mục phải dài ít nhất 3 ký tự!',
      'string.max': 'Tên danh mục không được vượt quá 50 ký tự!'
    }),
    description: Joi.string().optional().allow('')
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
    categoryName: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Tên danh mục là bắt buộc',
      'string.empty': 'Tên danh mục không được để trống!',
      'string.min': 'Tên danh mục phải dài ít nhất 3 ký tự!',
      'string.max': 'Tên danh mục không được vượt quá 50 ký tự!'
    }),
    description: Joi.string().optional().allow('')
  }).min(1)

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error.details.map(detail => detail.message).join('-')
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const categoryValidation = {
  createNew,
  update
}