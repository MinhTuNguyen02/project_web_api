import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    type: Joi.string()
      .valid('contact', 'subscription')
      .required()
      .messages({
        'any.required': 'Loại tin nhắn là bắt buộc!',
        'any.only': 'Loại tin nhắn phải là "contact" hoặc "subscription"!'
      }),
    fullName: Joi.string()
      .min(2)
      .max(50)
      .trim()
      .strict()
      .when('type', {
        is: 'contact',
        then: Joi.required(),
        otherwise: Joi.optional().allow('')
      })
      .messages({
        'string.min': 'Họ và tên phải dài ít nhất 2 ký tự!',
        'string.max': 'Họ và tên không được vượt quá 50 ký tự!',
        'any.required': 'Họ và tên là bắt buộc cho tin nhắn liên hệ!'
      }),
    email: Joi.string()
      .required()
      .email({ tlds: { allow: false } })
      .trim()
      .strict()
      .messages({
        'any.required': 'Email là bắt buộc!',
        'string.email': 'Vui lòng nhập email hợp lệ!'
      }),
    phone: Joi.string()
      .pattern(/^\d{10,11}$/)
      .when('type', {
        is: 'contact',
        then: Joi.required(),
        otherwise: Joi.optional().allow('')
      })
      .messages({
        'any.required': 'Số điện thoại là bắt buộc cho tin nhắn liên hệ!',
        'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số!'
      }),
    content: Joi.string()
      .required()
      .trim()
      .strict()
      .messages({
        'any.required': 'Nội dung là bắt buộc!',
        'string.empty': 'Nội dung không được để trống!'
      })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error.details.map((detail) => detail.message).join('-')
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const messageValidation = {
  createNew
}