import { wishlistService } from '~/services/wishListService'

const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id
    const result = await wishlistService.getWishlist(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user._id
    const result = await wishlistService.addToWishlist({ userId, productId })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user._id
    const result = await wishlistService.removeFromWishlist({ userId, productId })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const wishlistController = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
}