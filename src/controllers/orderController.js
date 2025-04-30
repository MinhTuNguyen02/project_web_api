import { StatusCodes } from 'http-status-codes'
import { orderService } from '~/services/orderService'
import { env } from '~/config/environment'

const createOrder = async (req, res) => {
  try {
    const { userId, items, shippingInfo, paymentMethod, total } = req.body
    if (!userId || !items || !shippingInfo || !paymentMethod || !total) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Thiếu thông tin bắt buộc',
        statusCode: 400
      })
    }

    // Tính phí vận chuyển dựa trên khu vực
    let shippingFee = 0
    const { shippingMethod = 'standard', address } = shippingInfo

    const getCityFromAddress = (address) => {
      return env.CITIES.find(city => address.toLowerCase().includes(city.toLowerCase())) || 'default'
    }

    const city = getCityFromAddress(address)
    const { baseFee, distance, rate } = env.SHIPPING_RATES[city]
    shippingFee = baseFee + distance * rate
    if (shippingMethod === 'express') {
      shippingFee *= 1.5
    }

    // Kiểm tra total (items total + shippingFee)
    const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    if (Math.abs(total - (itemsTotal + shippingFee)) > 1) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Tổng tiền không khớp với đơn hàng và phí vận chuyển',
        statusCode: 400
      })
    }

    const order = await orderService.createOrder({
      userId,
      items,
      shippingInfo,
      paymentMethod,
      shippingFee,
      total
    })
    res.status(StatusCodes.CREATED).json({ order, message: 'Đơn hàng tạo thành công' })
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: error.message || 'Không thể tạo đơn hàng',
      statusCode: StatusCodes.BAD_REQUEST
    })
  }
}

const getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id.toString() // Lấy userId từ token đã xác thực
    const orders = await orderService.getOrdersByUserId(userId)
    res.status(StatusCodes.OK).json({ orders })
  } catch (error) {
    next(error)
  }
}

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders()
    res.status(StatusCodes.OK).json({ orders })
  } catch (error) {
    next(error)
  }
}

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id.toString()
    const order = await orderService.getOrderById(id, userId)
    if (!order) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Không tìm thấy đơn hàng',
        statusCode: 404
      })
    }
    res.status(StatusCodes.OK).json({ order })
  } catch (error) {
    next(error)
  }
}

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id.toString()
    const order = await orderService.cancelOrder(id, userId)
    res.status(StatusCodes.OK).json({ order, message: 'Hủy đơn hàng thành công' })
  } catch (error) {
    const statusCode = error.message.includes('không thể hủy') ? StatusCodes.BAD_REQUEST : StatusCodes.NOT_FOUND
    res.status(statusCode).json({
      message: error.message || 'Không thể hủy đơn hàng',
      statusCode
    })
  }
}

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    if (!status) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Trạng thái đơn hàng là bắt buộc',
        statusCode: StatusCodes.BAD_REQUEST
      })
    }
    const validStatuses = ['Đang chờ xử lý', 'Đang xử lý', 'Đang giao hàng', 'Đã nhận hàng', 'Đã hủy']
    if (!validStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Trạng thái đơn hàng không hợp lệ',
        statusCode: StatusCodes.BAD_REQUEST
      })
    }
    const order = await orderService.updateOrderStatus(id, status)
    res.status(StatusCodes.OK).json({ order, message: 'Cập nhật trạng thái thành công' })
  } catch (error) {
    const statusCode = error.message.includes('Không tìm thấy') ? StatusCodes.NOT_FOUND : StatusCodes.BAD_REQUEST
    res.status(statusCode).json({
      message: error.message || 'Không thể cập nhật trạng thái',
      statusCode
    })
  }
}

const receiveOrder = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id.toString()
    const order = await orderService.receiveOrder(id, userId)
    res.status(StatusCodes.OK).json({ order, message: 'Xác nhận nhận hàng thành công' })
  } catch (error) {
    const statusCode = error.message.includes('không thể xác nhận') ? StatusCodes.BAD_REQUEST : StatusCodes.NOT_FOUND
    res.status(statusCode).json({
      message: error.message || 'Không thể xác nhận nhận hàng',
      statusCode
    })
  }
}

export const orderController = {
  createOrder,
  getOrders,
  getAllOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  receiveOrder
}