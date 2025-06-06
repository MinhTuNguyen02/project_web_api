import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Không có token nào được cung cấp' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = { _id: decoded.userId, role: decoded.role, email: decoded.email }
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token hết hạn', statusCode: 401 })
    }
    return res.status(401).json({ message: 'Token không hợp lệ', statusCode: 401 })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Yêu cầu quyền amin' })
  }
  next()
}

export const authMiddleware = { verifyToken, isAdmin }