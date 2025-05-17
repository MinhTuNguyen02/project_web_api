import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const validatePromotion = async (req, res, next) => {
  const correctCondition = Joi.object({
    code: Joi.string().required().min(3).max(20).trim().strict().uppercase().messages({
      'string.min': 'Mã phải dài ít nhất 3 ký tự!',
      'string.max': 'Mã không được vượt quá 20 ký tự!',
      'string.uppercase': 'Mã phải gồm các ký tự in hoa'
    }),
    itemsTotal: Joi.number().required().min(0),
    userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error.details.map(detail => detail.message).join('-')
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    code: Joi.string().required().min(3).max(20).trim().strict().uppercase().messages({
      'string.min': 'Mã phải dài ít nhất 3 ký tự!',
      'string.max': 'Mã không được vượt quá 20 ký tự!',
      'string.uppercase': 'Mã phải gồm các ký tự in hoa'
    }),
    type: Joi.string().required().valid('fixed', 'percentage', 'free_shipping'),
    value: Joi.number().required().min(0),
    minOrderValue: Joi.number().default(0).min(0),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    maxUses: Joi.number().default(0).min(0),
    maxUsesPerUser: Joi.number().default(1).min(0),
    isActive: Joi.boolean().default(true)
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
    code: Joi.string().min(3).max(20).trim().strict().uppercase().optional(),
    type: Joi.string().valid('fixed', 'percentage', 'free_shipping').optional(),
    value: Joi.number().min(0).optional(),
    minOrderValue: Joi.number().min(0).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    maxUses: Joi.number().min(0).optional(),
    maxUsesPerUser: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error.details.map(detail => detail.message).join('-')
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const promotionValidation = {
  validatePromotion,
  createNew,
  update
}