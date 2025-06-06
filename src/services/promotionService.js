import { promotionModel } from '~/models/promotionModel'
import { orderModel } from '~/models/orderModel'

const validatePromotion = async (code, userId, itemsTotal) => {
  try {
    const promotion = await promotionModel.findOneByCode(code)
    if (!promotion) {
      throw new Error('Mã khuyến mãi không hợp lệ')
    }

    const now = new Date()
    if (now < new Date(promotion.startDate) || now > new Date(promotion.endDate)) {
      throw new Error('Mã khuyến mãi đã hết hạn')
    }
    if (promotion.maxUses > 0 && promotion.usedCount >= promotion.maxUses) {
      throw new Error('Mã khuyến mãi đã hết lượt sử dụng')
    }
    if (itemsTotal < promotion.minOrderValue) {
      throw new Error(`Đơn hàng cần tối thiểu ${promotion.minOrderValue} VND để áp dụng mã này`)
    }

    const userOrdersWithPromo = await orderModel.countOrdersWithPromotion(userId, code)
    if (promotion.maxUsesPerUser > 0 && userOrdersWithPromo >= promotion.maxUsesPerUser) {
      throw new Error('Bạn đã sử dụng mã này tối đa số lần cho phép')
    }

    let discount = 0
    if (promotion.type === 'fixed') {
      discount = promotion.value
    } else if (promotion.type === 'percentage') {
      discount = (promotion.value / 100) * itemsTotal
    }
    // free_shipping xử lý ở orderController

    return { promotion, discount }
  } catch (error) {
    throw new Error(error.message)
  }
}

const getAllPromotions = async (isActive) => {
  try {
    const query = { _destroy: false }
    if (isActive !== undefined) {
      query.isActive = isActive // true hoặc false
    }
    const promotions = await promotionModel.getAllPromotions(query)
    return promotions
  } catch (error) {
    throw new Error(error.message)
  }
}

const createNew = async (data) => {
  try {
    const existingPromotion = await promotionModel.findOneByCode(data.code)
    if (existingPromotion) {
      throw new Error('Mã khuyến mãi đã tồn tại')
    }
    const createdPromotion = await promotionModel.createNew(data)
    if (!createdPromotion || !createdPromotion._id) {
      throw new Error('Không thể tạo khuyến mãi: dữ liệu trả về không hợp lệ')
    }
    return createdPromotion
  } catch (error) {
    throw new Error(error.message)
  }
}

const update = async (id, data) => {
  try {
    if (data.code) {
      const existingPromotion = await promotionModel.findOneByCode(data.code)
      if (existingPromotion && existingPromotion._id.toString() !== id) {
        throw new Error('Mã khuyến mãi đã tồn tại')
      }
    }
    const updatedPromotion = await promotionModel.update(id, data)
    if (!updatedPromotion) {
      throw new Error('Không tìm thấy khuyến mãi')
    }
    return updatedPromotion
  } catch (error) {
    throw new Error(error.message)
  }
}

const deletePromotion = async (id) => {
  try {
    const deletedPromotion = await promotionModel.deletePromotion(id)
    if (!deletedPromotion) {
      throw new Error('Không tìm thấy khuyến mãi')
    }
    return deletedPromotion
  } catch (error) {
    throw new Error(error.message)
  }
}

export const promotionService = {
  validatePromotion,
  getAllPromotions,
  createNew,
  update,
  deletePromotion
}