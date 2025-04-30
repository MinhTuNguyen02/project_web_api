import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

//define collection
const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  categoryId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  productName: Joi.string().required().min(3).max(100).trim().strict(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().required().min(0),
  img: Joi.array().items(Joi.string()).default([]),
  inventory: Joi.number().min(0).default(0),
  purchaseCount: Joi.number().min(0).default(0),

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newProductToAdd = {
      ...validData,
      categoryId: new ObjectId(validData.categoryId)
    }
    const createdProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(newProductToAdd)
    return createdProduct
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
      _destroy: false
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async (categoryId, name, sort, limit) => {
  try {
    const query = { _destroy: false }
    if (categoryId) query.categoryId = new ObjectId(categoryId)
    if (name) query.productName = { $regex: name, $options: 'i' }

    let queryBuilder = GET_DB().collection(PRODUCT_COLLECTION_NAME).find(query)

    // Áp dụng sort
    if (sort) {
      const sortFields = {}
      sort.split(',').forEach(field => {
        const prefix = field.startsWith('-') ? -1 : 1
        const fieldName = field.startsWith('-') ? field.slice(1) : field
        sortFields[fieldName] = prefix
      })
      queryBuilder = queryBuilder.sort(sortFields)
    }

    // Áp dụng limit
    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit))
    }

    const products = await queryBuilder.toArray()
    return products
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (productId, data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { $set: { ...validData, categoryId: new ObjectId(validData.categoryId) } },
      { returnDocument: 'after' }
    )

    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteItem = async (id) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id), _destroy: false },
      { $set: { _destroy: true, updateAt: Date.now() } },
      { returnDocument: 'after' }
    )
    if (!result) {
      throw new Error('Product not found or already deleted')
    }
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getAll,
  update,
  deleteItem
}