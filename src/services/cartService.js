/* eslint-disable no-useless-catch */
import { cartModel } from '~/models/cartModel'
import { productModel } from '~/models/productModel'

const addToCart = async ({ userId, productId, quantity }) => {
  try {
    const product = await productModel.findOneById(productId)
    if (!product) {
      throw new Error('Product not found')
    }
    const cart = await cartModel.createOrUpdate(userId, { productId, quantity })
    const populatedCart = await populateCartItems(cart)
    return { cart: populatedCart }
  } catch (error) {
    throw error
  }
}

const getCart = async (userId) => {
  try {
    const cart = await cartModel.findOneByUserId(userId)
    const populatedCart = cart ? await populateCartItems(cart) : { userId, items: [] }
    return { cart: populatedCart }
  } catch (error) {
    throw error
  }
}

const updateQuantity = async ({ userId, productId, quantity }) => {
  try {
    const cart = await cartModel.updateQuantity(userId, productId, quantity)
    const populatedCart = await populateCartItems(cart)
    return { cart: populatedCart }
  } catch (error) {
    throw error
  }
}

const deleteItem = async ({ userId, productId }) => {
  try {
    const cart = await cartModel.deleteItem(userId, productId)
    const populatedCart = await populateCartItems(cart)
    return { cart: populatedCart }
  } catch (error) {
    throw error
  }
}

const populateCartItems = async (cart) => {
  if (!cart || !cart.items) return cart
  const populatedItems = await Promise.all(
    cart.items.map(async (item) => {
      const product = await productModel.findOneById(item.productId)
      return {
        productId: {
          _id: item.productId,
          productName: product?.productName || 'Unknown',
          price: product?.price || 0,
          img: product?.img || []
        },
        quantity: item.quantity
      }
    })
  )
  return {
    ...cart,
    items: populatedItems
  }
}

export const cartService = {
  addToCart,
  getCart,
  updateQuantity,
  deleteItem
}