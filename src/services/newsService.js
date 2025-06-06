/* eslint-disable no-useless-catch */
import { newsModel } from '~/models/newsModel'

const createNew = async (reqBody) => {
  try {
    const newNews = {
      ...reqBody
    }
    const createdNews = await newsModel.createNew(newNews)
    const getNewNews = await newsModel.findOneById(createdNews.insertedId)
    return getNewNews
  } catch (error) {
    throw error
  }
}

const getAll = async () => {
  try {
    const news = await newsModel.getAll()
    return news
  } catch (error) {
    throw error
  }
}

const getById = async (newsId) => {
  try {
    const news = await newsModel.findOneById(newsId)
    if (!news) {
      throw new Error('Không tìm thấy tin')
    }
    return news
  } catch (error) {
    throw error
  }
}

const update = async (newsId, reqBody) => {
  try {
    const updatedData = { ...reqBody }
    const updatedNews = await newsModel.update(newsId, updatedData)
    return updatedNews
  } catch (error) {
    throw error
  }
}

const deleteItem = async (id) => {
  try {
    const deletedNews = await newsModel.deleteItem(id)
    return deletedNews
  } catch (error) {
    throw error
  }
}

export const newsService = {
  createNew,
  getAll,
  update,
  getById,
  deleteItem
}