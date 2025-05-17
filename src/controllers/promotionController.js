import { StatusCodes } from 'http-status-codes'
import { promotionService } from '~/services/promotionService'

const validatePromotion = async (req, res, next) => {
  try {
    const { code, itemsTotal, userId } = req.body
    const { promotion, discount } = await promotionService.validatePromotion(code, userId, itemsTotal)
    res.status(StatusCodes.OK).json({
      promotion: {
        code: promotion.code,
        type: promotion.type,
        value: promotion.value,
        minOrderValue: promotion.minOrderValue
      },
      discount,
      message: 'Mã khuyến mãi hợp lệ'
    })
  } catch (error) {
    next(new Error(error.message))
  }
}

const getAllPromotions = async (req, res, next) => {
  try {
    const { isActive } = req.query
    let isActiveValue
    if (isActive === 'true') {
      isActiveValue = true
    } else if (isActive === 'false') {
      isActiveValue = false
    } else {
      isActiveValue = undefined // Lấy tất cả trạng thái
    }
    const promotions = await promotionService.getAllPromotions(isActiveValue)
    res.status(StatusCodes.OK).json({ promotions })
  } catch (error) {
    next(error)
  }
}

const createNew = async (req, res, next) => {
  try {
    const createdPromotion = await promotionService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      promotion: createdPromotion,
      message: 'Tạo khuyến mãi thành công'
    })
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const { id } = req.params
    const updatedPromotion = await promotionService.update(id, req.body)
    res.status(StatusCodes.OK).json({
      promotion: updatedPromotion,
      message: 'Cập nhật khuyến mãi thành công'
    })
  } catch (error) {
    next(error)
  }
}

const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params
    const deletedPromotion = await promotionService.deletePromotion(id)
    res.status(StatusCodes.OK).json({
      promotion: deletedPromotion,
      message: 'Xóa khuyến mãi thành công'
    })
  } catch (error) {
    next(error)
  }
}

export const promotionController = {
  validatePromotion,
  getAllPromotions,
  createNew,
  update,
  deletePromotion
}