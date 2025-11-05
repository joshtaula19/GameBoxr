import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth'
import { getDiscoverGames } from './routes/discover'
import ratingRouter from './routes/ratings'
import gamesRouter from './routes/game'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/games', getDiscoverGames)
app.use('/api/games', gamesRouter)
app.use('/api', ratingRouter)

app.listen(3000, () => {
  console.log('API on :3000')
})
