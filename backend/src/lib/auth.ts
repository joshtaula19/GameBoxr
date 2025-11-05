import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// this is what we expect to be inside the token when we create it
export function createToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// extend Express's Request so we can attach userId
export interface AuthedRequest extends Request {
  userId?: string
}

// shape we expect after verifying
type DecodedToken = {
  userId: string
  iat?: number
  exp?: number
}

export function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No token' })
  }

  // Expect "Bearer <token>"
  const [, token] = authHeader.split(' ')
  if (!token) {
    return res.status(401).json({ error: 'Bad auth header format' })
  }

  try {
    // jwt.verify can return string | object. We'll narrow it.
    const decodedRaw = jwt.verify(token, JWT_SECRET)

    // runtime type check
    if (
      typeof decodedRaw === 'object' &&
      decodedRaw !== null &&
      'userId' in decodedRaw &&
      typeof (decodedRaw as any).userId === 'string'
    ) {
      const decoded = decodedRaw as DecodedToken
      req.userId = decoded.userId
      return next()
    } else {
      return res.status(401).json({ error: 'Token missing userId' })
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
