import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { requireUser, AuthedRequest } from '../middleware/requireUser'
import { rateGame } from './rate'

const prisma = new PrismaClient()
const ratingRouter = Router()

// POST /rate
ratingRouter.post(
  '/rate',
  requireUser,
  rateGame,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.userId!
      const {
        gameId,
        stars,
        status, // 'rated' or 'wishlist'
        title,
        coverImage,
        platforms,
        genres,
        releaseYear,
      } = req.body

      if (!gameId || !status || !title) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // create or update rating row for that game+user
      const entry = await prisma.gameRating.upsert({
        where: {
          // need a unique constraint on (userId, gameId). we'll add that in a sec
          userId_gameId: {
            userId,
            gameId,
          },
        },
        create: {
          userId,
          gameId,
          title,
          coverImage: coverImage ?? null,
          platforms: Array.isArray(platforms)
            ? platforms.join(', ')
            : platforms ?? '',
          genres: Array.isArray(genres) ? genres.join(', ') : genres ?? '',
          releaseYear: releaseYear ?? null,
          stars: stars ?? null,
          status,
        },
        update: {
          stars: stars ?? null,
          status,
          title,
          coverImage: coverImage ?? null,
          platforms: Array.isArray(platforms)
            ? platforms.join(', ')
            : platforms ?? '',
          genres: Array.isArray(genres) ? genres.join(', ') : genres ?? '',
          releaseYear: releaseYear ?? null,
        },
      })

      return res.json(entry)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to save rating' })
    }
  }
)

const ratingsHandler = async (req: AuthedRequest, res: any) => {
  try {
    const userId = req.userId!
    const rows = await prisma.gameRating.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch ratings' })
  }
}

// GET /me/ratings  -> for ProfilePage
ratingRouter.get(
  '/me/ratings',
  requireUser,
  async (req: AuthedRequest, res) => {
    try {
      const userId = req.userId!
      const rows = await prisma.gameRating.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })
      return res.json(rows)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'Failed to fetch ratings' })
    }
  }
)

export default ratingRouter
