import { StatusCodes } from 'http-status-codes'
import { warehouseService } from '~/services/warehouseService'

const createNew = async (req, res, next) => {
  try {
    //Điều hướng dữ liệu sang tầng Service
    const createdWarehouse = await warehouseService.createNew(req.body)

    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdWarehouse)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const warehouseId = req.params.id
    //Điều hướng dữ liệu sang tầng Service
    const warehouse = await warehouseService.getDetails(warehouseId)
    //Có kết quả thì trả về phía Client
    res.status(StatusCodes.OK).json(warehouse)
  } catch (error) { next(error) }
}

export const warehouseController = {
  createNew,
  getDetails
}