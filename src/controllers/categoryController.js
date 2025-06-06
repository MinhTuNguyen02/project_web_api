import { StatusCodes } from 'http-status-codes'
import { categoryService } from '~/services/categoryService'

const createNew = async (req, res, next) => {
  try {
    //Điều hướng dữ liệu sang tầng Service
    const createdCategory = await categoryService.createNew(req.body)

    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdCategory)
  } catch (error) { next(error) }
}
const getAll = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll()
    res.status(StatusCodes.OK).json(categories)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const categoryId = req.params.id
    const updatedCategory = await categoryService.update(categoryId, req.body)
    res.status(StatusCodes.OK).json(updatedCategory)
  } catch (error) {
    if (error.message === 'Không tìm thấy danh mục' || error.message === 'ID danh mục không hợp lệ') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: error.message })
    }
    next(error)
  }
}

export const categoryController = {
  createNew,
  getAll,
  update
}