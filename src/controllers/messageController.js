/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { messageService } from '~/services/messageService'

const createNew = async (req, res, next) => {
  try {
    const createdMessage = await messageService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Gửi tin nhắn thành công',
      data: createdMessage
    })
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const messages = await messageService.getAll()
    res.status(StatusCodes.OK).json({
      message: 'Lấy danh sách tin nhắn thành công',
      data: messages
    })
  } catch (error) {
    next(error)
  }
}

export const messageController = {
  createNew,
  getAll
}