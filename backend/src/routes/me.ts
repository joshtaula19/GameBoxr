import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthedRequest } from '../lib/auth'

export async function getMe(req: AuthedRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authed' })

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      username: true,
      ratings: {
        select: {
          stars: true,
          status: true,
          game: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              platforms: true,
              genres: true,
              releaseYear: true,
            },
          },
        },
      },
    },
  })

  res.json(user)
}
