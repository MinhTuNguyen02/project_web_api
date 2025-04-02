/* eslint-disable no-useless-catch */

import { slugify } from '~/utils/formatters'

const createNew = async (reqBody) => {
  try {
    const newCustomer = {
      ...reqBody,
      slug: slugify(reqBody.fullName)
    }

    return newCustomer
  } catch (error) {
    throw error
  }
}

export const customService = {
  createNew
}