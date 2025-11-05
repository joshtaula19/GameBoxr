// src/routes/games.ts
import { Router } from 'express'
import { getDiscoverGames } from './discover'

const router = Router()

// GET /api/games/discover
router.get('/discover', getDiscoverGames)

export default router
