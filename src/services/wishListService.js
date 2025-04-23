/* eslint-disable no-useless-catch */
import { wishlistModel } from '~/models/wishListModel'
import { productModel } from '~/models/productModel'

const getWishlist = async (userId) => {
  try {
    const wishlist = await wishlistModel.findOneByUserId(userId)
    const populatedWishlist = wishlist ? await populateWishlistProducts(wishlist) : { userId, products: [] }
    return { wishlist: populatedWishlist }
  } catch (error) {
    throw error
  }
}

const addToWishlist = async ({ userId, productId }) => {
  try {
    const product = await productModel.findOneById(productId)
    if (!product) {
      throw new Error('Product not found')
    }
    const wishlist = await wishlistModel.addProduct(userId, productId)
    const populatedWishlist = await populateWishlistProducts(wishlist)
    return { wishlist: populatedWishlist }
  } catch (error) {
    throw error
  }
}

const removeFromWishlist = async ({ userId, productId }) => {
  try {
    const wishlist = await wishlistModel.removeProduct(userId, productId)
    const populatedWishlist = await populateWishlistProducts(wishlist)
    return { wishlist: populatedWishlist }
  } catch (error) {
    throw error
  }
}

const populateWishlistProducts = async (wishlist) => {
  if (!wishlist || !wishlist.products) return wishlist
  const populatedProducts = await Promise.all(
    wishlist.products.map(async (productId) => {
      const product = await productModel.findOneById(productId)
      return {
        _id: productId,
        productName: product?.productName || 'Unknown',
        price: product?.price || 0,
        img: product?.img || []
      }
    })
  )
  return {
    ...wishlist,
    products: populatedProducts
  }
}

export const wishlistService = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
}