/* eslint-disable no-useless-catch */
import { addressModel } from '~/models/addressModel'

const createNew = async (_id, addressData) => {
  try {
    const newAddress = {
      userId: _id,
      recipientName: addressData.recipientName,
      phoneNumber: addressData.phoneNumber,
      address: addressData.address,
      isDefault: !!addressData.isDefault
    }
    return await addressModel.createNew(newAddress)
  } catch (error) {
    throw error
  }
}

const getByUserId = async (_id) => {
  try {
    return await addressModel.findByUserId(_id)
  } catch (error) {
    throw error
  }
}

const update = async (id, _id, addressData) => {
  try {
    const updatedAddress = {
      userId: _id,
      recipientName: addressData.recipientName,
      phoneNumber: addressData.phoneNumber,
      address: addressData.address,
      isDefault: !!addressData.isDefault
    }
    return await addressModel.update(id, _id, updatedAddress)
  } catch (error) {
    throw error
  }
}

const deleteOne = async (id, _id) => {
  try {
    return await addressModel.deleteOne(id, _id)
  } catch (error) {
    throw error
  }
}

export const addressService = {
  createNew,
  getByUserId,
  update,
  deleteOne
}