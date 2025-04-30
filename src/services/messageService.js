/* eslint-disable no-useless-catch */
import { messageModel } from '~/models/messageModel'

const createNew = async (reqBody) => {
  try {
    const newMessage = {
      ...reqBody
    }
    const createdMessage = await messageModel.createNew(newMessage)
    return createdMessage
  } catch (error) {
    throw error
  }
}

const getAll = async () => {
  try {
    const messages = await messageModel.getAll()
    return messages
  } catch (error) {
    throw error
  }
}

export const messageService = {
  createNew,
  getAll
}