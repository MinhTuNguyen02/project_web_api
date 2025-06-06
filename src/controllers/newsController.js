import { StatusCodes } from 'http-status-codes'
import { newsService } from '~/services/newsService'

const createNew = async (req, res, next) => {
  try {
    const createdNews = await newsService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdNews)
  } catch (error) {
    next(error)
  }
}

const getAll = async (req, res, next) => {
  try {
    const news = await newsService.getAll()
    res.status(StatusCodes.OK).json(news)
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const newsId = req.params.id
    const news = await newsService.getById(newsId)
    res.status(StatusCodes.OK).json(news)
  } catch (error) {
    if (error.message === 'Không tim thấy tin' || error.message === 'ID tin không hợp lệ') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const newsId = req.params.id
    const updatedNews = await newsService.update(newsId, req.body)
    res.status(StatusCodes.OK).json(updatedNews)
  } catch (error) {
    if (error.message === 'Không tim thấy tin' || error.message === 'ID tin không hợp lệ') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
    next(error)
  }
}

const deleteItem = async (req, res, next) => {
  try {
    const newsId = req.params.id
    const deletedNews = await newsService.deleteItem(newsId)
    res.status(StatusCodes.OK).json(deletedNews)
  } catch (error) {
    next(error)
  }
}

export const newsController = {
  createNew,
  getAll,
  update,
  getById,
  deleteItem
}