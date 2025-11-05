import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const router = Router()

// REGISTER
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body
    if (!email || !username || !password)
      return res.status(400).json({ error: 'Missing required fields' })

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing)
      return res.status(409).json({ error: 'Email or username already in use' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, username, password: hashed },
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    })

    res.json({ token, user: { id: user.id, email, username } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Signup failed' })
  }
})

// LOGIN
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Missing fields' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    })

    res.json({ token, user: { id: user.id, email, username: user.username } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
