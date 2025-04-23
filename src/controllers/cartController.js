import { cartService } from '~/services/cartService'

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    const userId = req.user._id
    const result = await cartService.addToCart({ userId, productId, quantity })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const getCart = async (req, res) => {
  try {
    const userId = req.user._id
    const result = await cartService.getCart(userId)
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params
    const { quantity } = req.body
    const userId = req.user._id
    const result = await cartService.updateQuantity({ userId, productId, quantity })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

const deleteItem = async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user._id
    const result = await cartService.deleteItem({ userId, productId })
    return res.status(200).json(result)
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

export const cartController = {
  addToCart,
  getCart,
  updateQuantity,
  deleteItem
}