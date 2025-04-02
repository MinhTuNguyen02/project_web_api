import Joi from 'joi'
// import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

//define collection
const CUSTOMER_COLLECTION_NAME = 'customers'
const CUSTOMER_COLLECTION_SCHEMA = Joi.object({
  userName: Joi.string().required().min(3).max(50).trim().strict(),
  fullName: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const customerModel = {
  CUSTOMER_COLLECTION_NAME,
  CUSTOMER_COLLECTION_SCHEMA
}