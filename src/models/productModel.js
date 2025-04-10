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

  createAt: Joi.date().timestamp('javascript').default(Date.now),
  updateAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const { quantity, ...rest } = data // Tách quantity ra
    const validData = await validateBeforeCreate({ ...rest, inventory: quantity })
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
      _id: new ObjectId(id)
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getAll = async (categoryId) => {
  try {
    const query = categoryId ? { categoryId: new ObjectId(categoryId) } : {}
    const products = await GET_DB().collection('products').find(query).toArray()
    return products
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (productId, data) => {
  try {
    const { quantity, ...rest } = data
    const existingProduct = await findOneById(productId)
    if (!existingProduct) {
      throw new Error('Product not found')
    }
    const newInventory = existingProduct.inventory + (quantity || 0) // Cộng quantity vào inventory
    const updateData = {
      ...rest,
      categoryId: new ObjectId(existingProduct.categoryId),
      inventory: newInventory,
      updateAt: Date.now()
    }
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )

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
  update
}