/* eslint-disable no-useless-catch */
import { userModel } from '~/models/userModel'
import { addressModel } from '~/models/addressModel'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const createNew = async (reqBody) => {
  try {
    const existingUser = await userModel.findOneByEmail(reqBody.email)
    if (existingUser) {
      throw new Error('Email đã tồn tại')
    }
    return await userModel.createNew(reqBody)
  } catch (error) {
    throw error
  }
}

const login = async ({ email, password }) => {
  try {
    const user = await userModel.findOneByEmail(email)
    if (!user) {
      throw new Error('Email hoặc mật khẩu không hợp lệ')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      throw new Error('Email hoặc mật khẩu không hợp lệ')
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '2h' }
    )
    const addresses = await addressModel.findByUserId(user._id)
    return {
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        addresses
      },
      token
    }
  } catch (error) {
    throw error
  }
}

const getById = async (userId) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) {
      throw new Error('Không thìm thấy user')
    }
    const addresses = await addressModel.findByUserId(userId)
    return {
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      addresses
    }
  } catch (error) {
    throw error
  }
}

const getAllUsers = async () => {
  try {
    return await userModel.findAll()
  } catch (error) {
    throw error
  }
}

const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await userModel.findOneById(userId)
    if (!user) {
      throw new Error('Không tìm thấy user')
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      throw new Error('Mật khẩu cũ không đúng')
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await userModel.update(userId, { password: hashedNewPassword })
  } catch (error) {
    throw error
  }
}

const forgotPassword = async (email) => {
  try {
    const user = await userModel.findOneByEmail(email)
    if (!user) {
      throw new Error('Email không tồn tại')
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = Date.now() + 3600000 // Hết hạn sau 1 giờ

    await userModel.update(user._id, {
      resetToken,
      resetTokenExpiry
    })

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    const resetUrl = `http://localhost:3000/pages/reset-password?token=${resetToken}`
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
        <p>Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Liên kết này có hiệu lực trong 1 giờ.</p>
      `
    }

    await transporter.sendMail(mailOptions)
  } catch (error) {
    throw error
  }
}

const resetPassword = async (token, password) => {
  try {
    const user = await userModel.findOneByResetToken(token)
    if (!user || user.resetTokenExpiry < Date.now()) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn')
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await userModel.update(user._id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    })
  } catch (error) {
    throw error
  }
}

const updateUserInfo = async (userId, data) => {
  try {
    const { fullName, phoneNumber } = data
    const updatedUser = await userModel.update(userId, { fullName, phoneNumber })
    if (!updatedUser) {
      throw new Error('Không tìm thấy user để cập nhật')
    }
    return updatedUser
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  login,
  getById,
  getAllUsers,
  changePassword,
  forgotPassword,
  resetPassword,
  updateUserInfo
}