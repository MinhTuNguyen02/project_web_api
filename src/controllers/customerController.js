import { StatusCodes } from 'http-status-codes'
import { customService } from '~/services/customerService'

const createNew = async (req, res, next) => {
  try {
    //Điều hướng dữ liệu sang tầng Service
    const createdCustomer = await customService.createNew(req.body)

    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdCustomer)
  } catch (error) { next(error) }
}

export const customerController = {
  createNew
}