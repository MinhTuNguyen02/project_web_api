/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'

const PRODUCT_COLLECTION_NAME = 'products'
const ORDER_COLLECTION_NAME = 'orders'
const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
        price: Joi.number().min(0).required()
      })
    )
    .min(1)
    .required(),
  shippingInfo: Joi.object({
    fullName: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),
    phone: Joi.string().pattern(/^\d{10}$/).required().trim(),
    address: Joi.string().required().trim(),
    note: Joi.string().optional().allow('').trim()
  }).required(),
  paymentMethod: Joi.string().valid('cod', 'bank').required(),
  total: Joi.number().min(0).required(),
  status: Joi.string().valid('Đang chờ xử lý', 'Đang xử lý', 'Đang giao hàng', 'Đã nhận hàng', 'Đã hủy').default('Đang chờ xử lý'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createOrder = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const db = GET_DB()
    const session = db.client.startSession()

    try {
      let createdOrder
      await session.withTransaction(async () => {
        // Kiểm tra inventory
        for (const item of validData.items) {
          const product = await db.collection(PRODUCT_COLLECTION_NAME).findOne(
            { _id: new ObjectId(item.productId) },
            { session }
          )
          if (!product) {
            throw new Error(`Sản phẩm ${item.productId} không tồn tại`)
          }
          if (product.inventory === undefined || product.inventory < item.quantity) {
            throw new Error(`Sản phẩm ${product.productName} không đủ hàng (còn ${product.inventory || 0})`)
          }
        }

        // Giảm inventory
        for (const item of validData.items) {
          await db.collection(PRODUCT_COLLECTION_NAME).updateOne(
            { _id: new ObjectId(item.productId) },
            { $inc: { inventory: -item.quantity } },
            { session }
          )
        }

        // Chuẩn bị dữ liệu đơn hàng
        const newOrder = {
          ...validData,
          userId: new ObjectId(validData.userId),
          items: validData.items.map(item => ({
            ...item,
            productId: new ObjectId(item.productId)
          }))
        }

        // Tạo đơn hàng
        const result = await db.collection(ORDER_COLLECTION_NAME).insertOne(newOrder, { session })
        createdOrder = await db.collection(ORDER_COLLECTION_NAME).findOne(
          { _id: result.insertedId },
          { session }
        )
      })

      return createdOrder
    } finally {
      await session.endSession()
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const getOrdersByUserId = async (userId) => {
  try {
    return await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: PRODUCT_COLLECTION_NAME,
            localField: 'items.productId',
            foreignField: '_id',
            as: 'items.product'
          }
        },
        {
          $unwind: {
            path: '$items.product',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$_id',
            userId: { $first: '$userId' },
            items: {
              $push: {
                productId: {
                  $cond: [
                    { $eq: ['$items.product', {}] },
                    { _id: '$items.productId' },
                    '$items.product'
                  ]
                },
                quantity: '$items.quantity',
                price: '$items.price'
              }
            },
            shippingInfo: { $first: '$shippingInfo' },
            paymentMethod: { $first: '$paymentMethod' },
            total: { $first: '$total' },
            status: { $first: '$status' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' }
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const getAllOrders = async () => {
  try {
    return await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: PRODUCT_COLLECTION_NAME,
            localField: 'items.productId',
            foreignField: '_id',
            as: 'items.product'
          }
        },
        {
          $unwind: {
            path: '$items.product',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$_id',
            userId: { $first: '$userId' },
            items: {
              $push: {
                productId: {
                  $cond: [
                    { $eq: ['$items.product', {}] },
                    { _id: '$items.productId' },
                    '$items.product'
                  ]
                },
                quantity: '$items.quantity',
                price: '$items.price'
              }
            },
            shippingInfo: { $first: '$shippingInfo' },
            paymentMethod: { $first: '$paymentMethod' },
            total: { $first: '$total' },
            status: { $first: '$status' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' }
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const getOrderById = async (id, userId) => {
  try {
    const order = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            userId: new ObjectId(userId)
          }
        },
        {
          $unwind: '$items'
        },
        {
          $lookup: {
            from: PRODUCT_COLLECTION_NAME,
            localField: 'items.productId',
            foreignField: '_id',
            as: 'items.product'
          }
        },
        {
          $unwind: {
            path: '$items.product',
            preserveNullAndEmptyArrays: true // Giữ item nếu không tìm thấy sản phẩm
          }
        },
        {
          $group: {
            _id: '$_id',
            userId: { $first: '$userId' },
            items: {
              $push: {
                productId: {
                  $cond: [
                    { $eq: ['$items.product', {}] },
                    { _id: '$items.productId' }, // Trả về ObjectId nếu không có sản phẩm
                    '$items.product'
                  ]
                },
                quantity: '$items.quantity',
                price: '$items.price'
              }
            },
            shippingInfo: { $first: '$shippingInfo' },
            paymentMethod: { $first: '$paymentMethod' },
            total: { $first: '$total' },
            status: { $first: '$status' },
            createdAt: { $first: '$createdAt' },
            updatedAt: { $first: '$updatedAt' }
          }
        }
      ])
      .toArray()

    return order.length > 0 ? order[0] : null
  } catch (error) {
    throw new Error(error)
  }
}

const cancelOrder = async (id, userId) => {
  try {
    const updatedOrder = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
          userId: new ObjectId(userId),
          status: { $in: ['Đang chờ xử lý', 'Đang xử lý'] }
        },
        { $set: { status: 'Đã hủy', updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )

    if (!updatedOrder) {
      throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng không thể hủy')
    }

    return updatedOrder
  } catch (error) {
    throw error
  }
}

const updateOrderStatus = async (id, status) => {
  try {
    const updatedOrder = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    if (!updatedOrder) {
      throw new Error('Không tìm thấy đơn hàng')
    }
    return updatedOrder
  } catch (error) {
    throw error
  }
}

const receiveOrder = async (id, userId) => {
  try {
    const updatedOrder = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
          userId: new ObjectId(userId),
          status: 'Đang giao hàng'
        },
        { $set: { status: 'Đã nhận hàng', updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    if (!updatedOrder) {
      throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng không thể xác nhận nhận')
    }
    return updatedOrder
  } catch (error) {
    throw error
  }
}


export const orderModel = {
  ORDER_COLLECTION_NAME,
  ORDER_COLLECTION_SCHEMA,
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  receiveOrder
}