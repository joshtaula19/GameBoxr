import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthedRequest } from '../lib/auth'

export async function rateGame(req: AuthedRequest, res: Response) {
  if (!req.userId) return res.status(401).json({ error: 'Not authed' })

  const {
    gameId,
    stars,
    status,
    title,
    coverImage,
    platforms,
    genres,
    releaseYear,
  } = req.body

  if (!gameId || !status) {
    return res.status(400).json({ error: 'Missing gameId or status' })
  }

  // turn ["PC","PS5","Switch"] -> "PC,PS5,Switch"
  const platformsString = Array.isArray(platforms)
    ? platforms.join(',')
    : platforms ?? null

  const genresString = Array.isArray(genres) ? genres.join(',') : genres ?? null

  // Cache the game locally
  await prisma.game.upsert({
    where: { id: gameId },
    update: {},
    create: {
      id: gameId,
      title: title ?? 'Unknown',
      coverImage: coverImage ?? null,
      platforms: platformsString,
      genres: genresString,
      releaseYear: releaseYear ?? null,
    },
  })

  // Save / update the user's rating or wishlist status
  const ratingRow = await prisma.gameRating.upsert({
    where: {
      userId_gameId: {
        userId: req.userId,
        gameId,
      },
    },
    update: {
      stars: stars ?? null,
      status,
      title: title ?? 'Unknown',
      coverImage: coverImage ?? null,
      platforms: platformsString,
      genres: genresString,
      releaseYear: releaseYear ?? null,
    },
    create: {
      userId: req.userId,
      gameId,
      title: title ?? 'Unknown',
      coverImage: coverImage ?? null,
      platforms: platformsString,
      genres: genresString,
      releaseYear: releaseYear ?? null,
      stars: stars ?? null,
      status,
    },
  })

  res.json(ratingRow)
}
