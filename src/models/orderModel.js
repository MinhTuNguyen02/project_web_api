/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const PRODUCT_COLLECTION_NAME = 'products'
const ORDER_COLLECTION_NAME = 'orders'
const PROMOTION_COLLECTION_NAME = 'promotions'
const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
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
    note: Joi.string().optional().allow('').trim(),
    shippingMethod: Joi.string().valid('standard', 'express').default('standard')
  }).required(),
  paymentMethod: Joi.string().valid('cod', 'bank').required(),
  shippingFee: Joi.number().min(0).required(),
  total: Joi.number().min(0).required(),
  promotion: Joi.object({
    code: Joi.string().min(3).max(20).uppercase().optional(),
    discount: Joi.number().min(0).optional()
  }).optional(),
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
            { _id: new ObjectId(item.productId), _destroy: false },
            { session }
          )
          if (!product) {
            throw new Error(`Sản phẩm ${item.productId} không tồn tại`)
          }
          if (product.inventory === undefined || product.inventory < item.quantity) {
            throw new Error(`Sản phẩm ${product.productName} không đủ hàng (còn ${product.inventory || 0})`)
          }
        }

        // Giảm inventory và tăng purchaseCount
        for (const item of validData.items) {
          await db.collection(PRODUCT_COLLECTION_NAME).updateOne(
            { _id: new ObjectId(item.productId) },
            {
              $inc: {
                inventory: -item.quantity,
                purchaseCount: item.quantity
              }
            },
            { session }
          )
        }

        // Cập nhật usedCount của promotion nếu có
        if (validData.promotion && validData.promotion.code) {
          const promotion = await db.collection(PROMOTION_COLLECTION_NAME).findOne(
            { code: validData.promotion.code.toUpperCase(), isActive: true, _destroy: false },
            { session }
          )
          if (!promotion) {
            throw new Error('Mã khuyến mãi không hợp lệ')
          }
          await db.collection(PROMOTION_COLLECTION_NAME).updateOne(
            { code: validData.promotion.code.toUpperCase() },
            { $inc: { usedCount: 1 }, $set: { updatedAt: new Date() } },
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

const countOrdersWithPromotion = async (userId, code) => {
  try {
    const count = await GET_DB().collection(ORDER_COLLECTION_NAME).countDocuments({
      userId: new ObjectId(userId),
      'promotion.code': code.toUpperCase()
    })
    return count
  } catch (error) {
    throw new Error(error)
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
            shippingFee: { $first: '$shippingFee' },
            paymentMethod: { $first: '$paymentMethod' },
            total: { $first: '$total' },
            promotion: { $first: '$promotion' },
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
            shippingFee: { $first: '$shippingFee' },
            paymentMethod: { $first: '$paymentMethod' },
            total: { $first: '$total' },
            promotion: { $first: '$promotion' },
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
            shippingFee: { $first: '$shippingFee' },
            paymentMethod: { $first: '$paymentMethod' },
            total: { $first: '$total' },
            promotion: { $first: '$promotion' },
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
    const db = GET_DB()
    const session = db.client.startSession()

    try {
      let updatedOrder
      await session.withTransaction(async () => {
        // Tìm đơn hàng
        const order = await db.collection(ORDER_COLLECTION_NAME).findOne(
          {
            _id: new ObjectId(id),
            userId: new ObjectId(userId),
            status: { $in: ['Đang chờ xử lý', 'Đang xử lý'] }
          },
          { session }
        )

        if (!order) {
          throw new Error('Không tìm thấy đơn hàng hoặc đơn hàng không thể hủy')
        }

        // Hoàn trả inventory và giảm purchaseCount cho từng sản phẩm
        for (const item of order.items) {
          const product = await db.collection(PRODUCT_COLLECTION_NAME).findOne(
            { _id: new ObjectId(item.productId), _destroy: false },
            { session }
          )
          if (!product) {
            throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại`)
          }
          const updateResult = await db.collection(PRODUCT_COLLECTION_NAME).updateOne(
            { _id: new ObjectId(item.productId), _destroy: false },
            {
              $inc: {
                inventory: item.quantity,
                purchaseCount: -item.quantity
              },
              $set: { updatedAt: new Date() }
            },
            { session }
          )
          if (updateResult.matchedCount === 0) {
            throw new Error(`Không thể cập nhật sản phẩm với ID ${item.productId}`)
          }
        }

        // Cập nhật trạng thái đơn hàng
        updatedOrder = await db.collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
          {
            _id: new ObjectId(id),
            userId: new ObjectId(userId),
            status: { $in: ['Đang chờ xử lý', 'Đang xử lý'] }
          },
          {
            $set: {
              status: 'Đã hủy',
              updatedAt: new Date()
            }
          },
          { returnDocument: 'after', session }
        )

        if (!updatedOrder) {
          throw new Error('Không thể hủy đơn hàng do không tìm thấy hoặc trạng thái không hợp lệ')
        }
      })

      return updatedOrder
    } finally {
      await session.endSession()
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const updateOrderStatus = async (id, status) => {
  try {
    const updatedOrder = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
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
        { $set: { status: 'Đã nhận hàng', updatedAt: new Date() } },
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

const getDailyStats = async (startDate, endDate) => {
  try {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime() + 86399999

    return await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'Đã hủy' }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: { $toDate: '$createdAt' } }
            },
            totalRevenue: { $sum: '$total' },
            orderCount: { $sum: 1 },
            itemCount: { $sum: { $sum: '$items.quantity' } }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            date: '$_id',
            totalRevenue: 1,
            orderCount: 1,
            itemCount: 1,
            _id: 0
          }
        }
      ])
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const getMonthlyStats = async (year) => {
  try {
    const start = new Date(`${year}-01-01`).getTime()
    const end = new Date(`${year}-12-31`).getTime() + 86399999

    return await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'Đã hủy' }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: { $toDate: '$createdAt' } }
            },
            totalRevenue: { $sum: '$total' },
            orderCount: { $sum: 1 },
            itemCount: { $sum: { $sum: '$items.quantity' } }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            month: '$_id',
            totalRevenue: 1,
            orderCount: 1,
            itemCount: 1,
            _id: 0
          }
        }
      ])
      .toArray()
  } catch (error) {
    throw new Error(error)
  }
}

const getTopProducts = async ({ startDate, endDate, year, month }) => {
  try {
    let start, end
    if (year && month) {
      // Monthly stats
      start = new Date(`${year}-${month.padStart(2, '0')}-01`).getTime()
      const lastDay = new Date(year, month, 0).getDate()
      end = new Date(`${year}-${month.padStart(2, '0')}-${lastDay}`).getTime() + 86399999
    } else if (year) {
      // Yearly stats
      start = new Date(`${year}-01-01`).getTime()
      end = new Date(`${year}-12-31`).getTime() + 86399999
    } else {
      // Daily stats
      start = new Date(startDate).getTime()
      end = new Date(endDate).getTime() + 86399999
    }

    return await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
            status: { $ne: 'Đã hủy' }
          }
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
          }
        },
        {
          $lookup: {
            from: PRODUCT_COLLECTION_NAME,
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $project: {
            productId: '$_id',
            productName: '$product.productName',
            totalQuantity: 1,
            totalRevenue: 1,
            img: '$product.img',
            _id: 0
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ])
      .toArray()
  } catch (error) {
    throw new Error(error)
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
  receiveOrder,
  countOrdersWithPromotion,
  getDailyStats,
  getMonthlyStats,
  getTopProducts
}