/* eslint-disable no-useless-catch */
import { orderModel } from '~/models/orderModel'

const createOrder = async (data) => {
  try {
    return await orderModel.createOrder(data)
  } catch (error) {
    throw error
  }
}

const getOrdersByUserId = async (userId) => {
  try {
    return await orderModel.getOrdersByUserId(userId)
  } catch (error) {
    throw error
  }
}

const getAllOrders = async () => {
  try {
    return await orderModel.getAllOrders()
  } catch (error) {
    throw error
  }
}

const getOrderById = async (id, userId) => {
  try {
    return await orderModel.getOrderById(id, userId)
  } catch (error) {
    throw error
  }
}

const cancelOrder = async (id, userId) => {
  try {
    return await orderModel.cancelOrder(id, userId)
  } catch (error) {
    throw error
  }
}

const updateOrderStatus = async (id, status) => {
  try {
    return await orderModel.updateOrderStatus(id, status)
  } catch (error) {
    throw error
  }
}

const receiveOrder = async (id, userId) => {
  try {
    return await orderModel.receiveOrder(id, userId)
  } catch (error) {
    throw error
  }
}

const getDailyStats = async (startDate, endDate) => {
  try {
    return await orderModel.getDailyStats(startDate, endDate)
  } catch (error) {
    throw error
  }
}

const getMonthlyStats = async (year) => {
  try {
    return await orderModel.getMonthlyStats(year)
  } catch (error) {
    throw error
  }
}

const getYearlyStats = async (startYear, endYear) => {
  try {
    return await orderModel.getYearlyStats(startYear, endYear)
  } catch (error) {
    throw error
  }
}

export const orderService = {
  createOrder,
  getOrdersByUserId,
  getAllOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  receiveOrder,
  getDailyStats,
  getMonthlyStats,
  getYearlyStats
}