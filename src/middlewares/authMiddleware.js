import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = { _id: decoded.userId, role: decoded.role, email: decoded.email }
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', statusCode: 401 })
    }
    return res.status(401).json({ message: 'Invalid token', statusCode: 401 })
  }
}

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export const authMiddleware = { verifyToken, isAdmin }