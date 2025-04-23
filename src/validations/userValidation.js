import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    email: Joi.string().email().required().trim().strict(),
    password: Joi.string().required().min(6).trim().strict(),
    role: Joi.string().valid('user', 'admin').default('user'),
    fullName: Joi.string().optional().trim().strict(),
    phoneNumber: Joi.string().pattern(/^\d{10}$/).optional().trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }

}

export const customerValidation = {
  createNew
}