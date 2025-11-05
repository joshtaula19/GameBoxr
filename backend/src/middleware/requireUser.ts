import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

export interface AuthedRequest extends Request {
  userId?: string
}

export function requireUser(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization
  // expecting "Bearer <token>"
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }

  const [, token] = authHeader.split(' ')
  if (!token) {
    return res.status(401).json({ error: 'Bad Authorization header' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch (err) {
    console.error('JWT verify failed', err)
    return res.status(401).json({ error: 'Invalid token' })
  }
}
