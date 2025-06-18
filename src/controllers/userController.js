import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'

const register = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({ user: createdUser })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await userService.getById(req.user._id)
    res.status(StatusCodes.OK).json({ user })
  } catch (error) {
    next(error)
  }
}

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers()
    res.status(StatusCodes.OK).json({ users })
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req, res, next) => {
  try {
    const { email, oldPassword, newPassword } = req.body
    if (!email || !oldPassword || !newPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email, mật khẩu cũ, và mật khẩu mới là bắt buộc' })
    }
    if (email !== req.user.email) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email không hợp lệ' })
    }
    if (newPassword.length < 6) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Mật khẩu mới ít nhất phải có 6 ký tự' })
    }

    await userService.changePassword(req.user._id, oldPassword, newPassword)
    res.status(StatusCodes.OK).json({ message: 'Đổi mật khẩu thành công' })
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email là bắt buộc', statusCode: 400 })
    }
    await userService.forgotPassword(email)
    res.status(StatusCodes.OK).json({ message: 'Email đặt lại mật khẩu đã được gửi' })
  } catch (error) {
    next(error)
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Token và mật khẩu là bắt buộc', statusCode: 400 })
    }
    if (password.length < 6) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự', statusCode: 400 })
    }
    await userService.resetPassword(token, password)
    res.status(StatusCodes.OK).json({ message: 'Đặt lại mật khẩu thành công' })
  } catch (error) {
    next(error)
  }
}

const updateUserInfo = async (req, res, next) => {
  try {
    const { fullName, phoneNumber } = req.body
    if (!fullName || !phoneNumber) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Họ tên và số điện thoại là bắt buộc' })
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Số điện thoại phải là 10 chữ số' })
    }

    const updatedUser = await userService.updateUserInfo(req.user._id, { fullName, phoneNumber })
    res.status(StatusCodes.OK).json({ user: updatedUser, message: 'Thông tin đã được cập nhật' })
  } catch (error) {
    next(error)
  }
}

export const userController = {
  register,
  login,
  getMe,
  getAllUsers,
  changePassword,
  forgotPassword,
  resetPassword,
  updateUserInfo
}