/* eslint-disable no-useless-catch */
import { StatusCodes } from 'http-status-codes'
import { messageService } from '~/services/messageService'

const createNew = async (req, res, next) => {
  try {
    const createdMessage = await messageService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Message sent successfully',
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
      message: 'Messages retrieved successfully',
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