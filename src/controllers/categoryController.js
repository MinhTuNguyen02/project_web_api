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


export const categoryController = {
  createNew
}