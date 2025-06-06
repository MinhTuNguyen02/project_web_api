import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define collection
const CART_COLLECTION_NAME = 'carts'
const CART_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        quantity: Joi.number().required().min(1).default(1)
      })
    )
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await CART_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newCart = {
      ...validData,
      userId: new ObjectId(validData.userId),
      items: validData.items.map((item) => ({
        ...item,
        productId: new ObjectId(item.productId)
      }))
    }
    const result = await GET_DB().collection(CART_COLLECTION_NAME).insertOne(newCart)
    return { ...newCart, _id: result.insertedId }
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByUserId = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOne({ userId: new ObjectId(userId), _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const createOrUpdate = async (userId, item) => {
  try {
    const validItem = await Joi.object({
      productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      quantity: Joi.number().required().min(1).default(1)
    }).validateAsync(item, { abortEarly: false })

    let cart = await findOneByUserId(userId)
    if (!cart) {
      cart = await createNew({
        userId,
        items: [validItem]
      })
      return cart
    }

    const existingItem = cart.items.find(
      (i) => i.productId.toString() === validItem.productId.toString()
    )
    if (existingItem) {
      existingItem.quantity += validItem.quantity
    } else {
      cart.items.push({
        productId: new ObjectId(validItem.productId),
        quantity: validItem.quantity
      })
    }

    const result = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOneAndUpdate(
        { userId: new ObjectId(userId), _destroy: false },
        { $set: { items: cart.items, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateQuantity = async (userId, productId, quantity) => {
  try {
    const cart = await findOneByUserId(userId)
    if (!cart) throw new Error('Không tìm thấy giỏ hàng')

    const item = cart.items.find((i) => i.productId.toString() === productId)
    if (!item) throw new Error('Không tìm thấy hàng')

    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId.toString() !== productId)
    } else {
      item.quantity = quantity
    }

    const result = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOneAndUpdate(
        { userId: new ObjectId(userId), _destroy: false },
        { $set: { items: cart.items, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const deleteItem = async (userId, productId) => {
  try {
    const cart = await findOneByUserId(userId)
    if (!cart) throw new Error('Không tìm thấy giỏ hàng')

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId)

    const result = await GET_DB()
      .collection(CART_COLLECTION_NAME)
      .findOneAndUpdate(
        { userId: new ObjectId(userId), _destroy: false },
        { $set: { items: cart.items, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const cartModel = {
  CART_COLLECTION_NAME,
  CART_COLLECTION_SCHEMA,
  createNew,
  findOneByUserId,
  createOrUpdate,
  updateQuantity,
  deleteItem
}