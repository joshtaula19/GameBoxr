// src/routes/discover.ts
import { Request, Response } from 'express'
import dotenv from 'dotenv'
import { getIGDBAccessToken } from '../lib/igdbAuth'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

export async function getDiscoverGames(req: Request, res: Response) {
  try {
    // 1) see if user is logged in (we make it optional for this endpoint)
    let userId: string | null = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice('Bearer '.length)
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
        userId = decoded.userId
      } catch (e) {
        // token bad? just treat as anonymous
        userId = null
      }
    }

    // 2) if logged in, get the gameIds they already rated/wishlisted
    let alreadyRatedIds = new Set<number>()
    if (userId) {
      const rows = await prisma.gameRating.findMany({
        where: { userId },
        select: { gameId: true },
      })
      alreadyRatedIds = new Set(rows.map((r) => r.gameId))
    }

    // 3) IGDB fetch (same as before)
    const accessToken = await getIGDBAccessToken()

    const page = parseInt((req.query.page as string) || '0', 10)
    const limit = 40
    const offset = page * limit

    const igdbQuery = `
      fields id, name, total_rating, rating, release_dates.date, cover.url, platforms.name, genres.name, first_release_date;
      where rating != null & cover != null & total_rating != null;
      sort total_rating desc;
      limit ${limit};
      offset ${offset};
    `

    const igdbResp = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID ?? '',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
      body: igdbQuery,
    })

    if (!igdbResp.ok) {
      const errText = await igdbResp.text()
      console.error('IGDB error:', errText)
      return res
        .status(500)
        .json({ error: 'Failed to fetch games from IGDB', details: errText })
    }

    const igdbData = (await igdbResp.json()) as any[]
    if (!Array.isArray(igdbData)) {
      return res.status(500).json({ error: 'Unexpected IGDB response' })
    }

    // 4) map + normalise
    const mapped = igdbData.map((g) => {
      let coverUrl: string | null = g.cover?.url ? `https:${g.cover.url}` : null
      if (coverUrl) coverUrl = coverUrl.replace('/t_thumb/', '/t_1080p/')

      const platforms = Array.isArray(g.platforms)
        ? g.platforms.map((p: any) => p.name).filter(Boolean)
        : []

      const genres = Array.isArray(g.genres)
        ? g.genres.map((gn: any) => gn.name).filter(Boolean)
        : []

      let released: string | null = null
      if (Array.isArray(g.release_dates) && g.release_dates.length > 0) {
        const dates = g.release_dates
          .map((r: any) => r.date)
          .filter((d: any): d is number => typeof d === 'number')
        if (dates.length > 0) {
          const earliest = Math.min(...dates)
          const d = new Date(earliest * 1000)
          released = d?.toISOString?.().split('T')[0] ?? null
        }
      } else if (typeof g.first_release_date === 'number') {
        const d = new Date(g.first_release_date * 1000)
        released = d?.toISOString?.().split('T')[0] ?? null
      }

      return {
        gameId: g.id,
        title: g.name,
        cover: coverUrl,
        released,
        rating: g.rating ?? null,
        totalRating: g.total_rating ?? null,
        platforms,
        genres,
      }
    })

    // 5) FILTER OUT what the user has already rated/wishlisted
    const filtered = userId
      ? mapped.filter((g) => !alreadyRatedIds.has(g.gameId))
      : mapped

    // 6) shuffle a little so it’s not super static
    const shuffled = filtered.sort(() => Math.random() - 0.5)

    res.json(shuffled)
  } catch (err: any) {
    console.error('Server crash in /discover:', err)
    return res.status(500).json({
      error: 'Failed to fetch games',
      details: err.message ?? err,
    })
  }
}
