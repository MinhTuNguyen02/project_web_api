import { StatusCodes } from 'http-status-codes'
import { addressService } from '~/services/addressService'

const createNew = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Không tìm thấy userId, vui lòng đăng nhập lại', statusCode: 401 })
    }
    const { recipientName, phoneNumber, address, isDefault } = req.body
    if (!recipientName || !phoneNumber || !address) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Tên người nhận, số điện thoại, địa chỉ là bắt buộc', statusCode: 400 })
    }
    const newAddress = await addressService.createNew(req.user._id, {
      recipientName,
      phoneNumber,
      address,
      isDefault
    })
    res.status(StatusCodes.CREATED).json({ address: newAddress })
  } catch (error) {
    next(error)
  }
}

const getByUserId = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Không tìm thấy userId, vui lòng đăng nhập lại', statusCode: 401 })
    }
    const addresses = await addressService.getByUserId(req.user._id)
    res.status(StatusCodes.OK).json({ addresses })
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Không tìm thấy userId, vui lòng đăng nhập lại', statusCode: 401 })
    }
    const { id } = req.params
    const { recipientName, phoneNumber, address, isDefault } = req.body
    if (!recipientName || !phoneNumber || !address) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Tên người nhận, số điện thoại, địa chỉ là bắt buộc', statusCode: 400 })
    }
    const updatedAddress = await addressService.update(id, req.user._id, {
      recipientName,
      phoneNumber,
      address,
      isDefault
    })
    res.status(StatusCodes.OK).json({ address: updatedAddress })
  } catch (error) {
    next(error)
  }
}

const deleteOne = async (req, res, next) => {
  try {
    if (!req.user?._id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Không tìm thấy userId, vui lòng đăng nhập lại', statusCode: 401 })
    }
    const { id } = req.params
    const result = await addressService.deleteOne(id, req.user._id)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const addressController = {
  createNew,
  getByUserId,
  update,
  deleteOne
}