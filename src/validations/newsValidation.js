import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  const newsCondition = Joi.object({
    img: Joi.string().optional().allow('').trim().strict(),
    title: Joi.string().required().min(2).max(100).trim().strict().messages({
      'string.empty': 'Tiêu đề không được để trống',
      'string.min': 'Tiêu đề phải có ít nhất 2 ký tự',
      'string.max': 'Tiêu đề không được vượt quá 100 ký tự'
    }),
    content: Joi.string().optional().allow('').trim().strict().messages({
      'string.max': 'Nội dung không được vượt quá 5000 ký tự'
    })
  })

  try {
    await newsCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.details.map((detail) => detail.message).join('-')
    })
  }
}

const update = async (req, res, next) => {
  const newsCondition = Joi.object({
    img: Joi.string().optional().allow('').trim().strict(),
    title: Joi.string().min(2).max(100).trim().strict().messages({
      'string.min': 'Tiêu đề phải có ít nhất 2 ký tự',
      'string.max': 'Tiêu đề không được vượt quá 100 ký tự'
    }),
    content: Joi.string().allow('').trim().strict().messages({
      'string.max': 'Nội dung không được vượt quá 5000 ký tự'
    })
  })

  try {
    await newsCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.details.map((detail) => detail.message).join('-')
    })
  }
}

export const newsValidation = {
  createNew,
  update
}