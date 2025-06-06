import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define collection
const WISHLIST_COLLECTION_NAME = 'wishlists'
const WISHLIST_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  products: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
  return await WISHLIST_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newWishlist = {
      ...validData,
      userId: new ObjectId(validData.userId),
      products: validData.products.map((id) => new ObjectId(id))
    }
    const result = await GET_DB().collection(WISHLIST_COLLECTION_NAME).insertOne(newWishlist)
    return { ...newWishlist, _id: result.insertedId }
  } catch (error) {
    throw new Error(error)
  }
}

const findOneByUserId = async (userId) => {
  try {
    const result = await GET_DB()
      .collection(WISHLIST_COLLECTION_NAME)
      .findOne({ userId: new ObjectId(userId), _destroy: false })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const addProduct = async (userId, productId) => {
  try {
    let wishlist = await findOneByUserId(userId)
    if (!wishlist) {
      wishlist = await createNew({
        userId,
        products: [productId]
      })
      return wishlist
    }

    if (!wishlist.products.some((id) => id.toString() === productId)) {
      wishlist.products.push(new ObjectId(productId))
    }

    const result = await GET_DB()
      .collection(WISHLIST_COLLECTION_NAME)
      .findOneAndUpdate(
        { userId: new ObjectId(userId), _destroy: false },
        { $set: { products: wishlist.products, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const removeProduct = async (userId, productId) => {
  try {
    const wishlist = await findOneByUserId(userId)
    if (!wishlist) throw new Error('Không tìm thấy danh sách yêu thích')

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId)

    const result = await GET_DB()
      .collection(WISHLIST_COLLECTION_NAME)
      .findOneAndUpdate(
        { userId: new ObjectId(userId), _destroy: false },
        { $set: { products: wishlist.products, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const wishlistModel = {
  WISHLIST_COLLECTION_NAME,
  WISHLIST_COLLECTION_SCHEMA,
  createNew,
  findOneByUserId,
  addProduct,
  removeProduct
}