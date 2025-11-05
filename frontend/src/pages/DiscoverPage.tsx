import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGet, apiPost } from '../lib/api'
import { useAuth } from '../lib/auth'
import { GameCard, type Game } from '../components/GameCard'
import { MiniPosterCard } from '../components/miniPosterCard'

export function DiscoverPage() {
  const { token } = useAuth()
  const [queue, setQueue] = React.useState<Game[]>([])
  const [index, setIndex] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [exitDir, setExitDir] = React.useState<'left' | 'right' | null>(null)
  const [showTop, setShowTop] = React.useState(true)
  const [loadingMore, setLoadingMore] = React.useState(false)

  React.useEffect(() => {
    loadGames(0)
  }, [])

  async function loadGames(newPage: number) {
    try {
      setLoadingMore(true)
      const data = await apiGet(`/games/discover?page=${newPage}`)

      if (!Array.isArray(data)) {
        console.error('Bad API response:', data)
        return
      }

      if (newPage === 0) {
        setQueue(data)
        setIndex(0)
      } else {
        setQueue((prev) => [...prev, ...data])
      }

      setExitDir(null)
      setShowTop(true)
    } catch (err) {
      console.error('Failed to load games:', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const current = queue[index]

  function advanceDeck() {
    setIndex((prev) => {
      const nextIndex = prev + 1

      // if we’re nearing the end of the queue, fetch more
      if (nextIndex >= queue.length - 3 && !loadingMore) {
        const nextPage = page + 1
        setPage(nextPage)
        loadGames(nextPage)
      }

      return nextIndex
    })
    setExitDir(null)
    setShowTop(true)
  }

  function triggerSwipe(direction: 'left' | 'right') {
    setExitDir(direction)
    setShowTop(false)
  }

  async function handleRate(stars: number) {
    if (!current) return
    await apiPost(
      '/rate',
      {
        gameId: current.gameId,
        stars,
        status: 'rated',
        title: current.title,
        coverImage: current.cover,
        platforms: current.platforms,
        genres: current.genres,
        releaseYear: current.released
          ? Number(current.released.split('-')[0])
          : null,
      },
      token
    )
    triggerSwipe('right')
  }

  async function handleWishlist() {
    if (!current) return
    await apiPost(
      '/rate',
      {
        gameId: current.gameId,
        stars: null,
        status: 'wishlist',
        title: current.title,
        coverImage: current.cover,
        platforms: current.platforms,
        genres: current.genres,
        releaseYear: current.released
          ? Number(current.released.split('-')[0])
          : null,
      },
      token
    )
    triggerSwipe('right')
  }

  function handleSkip() {
    triggerSwipe('left')
  }

  return (
    <div
      className="
      relative
      w-full h-screen
      overflow-hidden
      bg-transparent
      flex flex-col items-center
    "
    >
      {/* Bottom cinematic fade */}
      <div
        className="
        pointer-events-none
        absolute bottom-0 left-0 w-full h-48
        bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent
        z-30
      "
      />

      {/* Page content column */}
      <div
        className="
        relative
        flex flex-col items-center
        w-full
        max-w-[900px]
        pt-8 sm:pt-10
      "
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="
          text-5xl sm:text-6xl font-extrabold tracking-tight text-white
          text-center
        "
        >
          GameBoxr
        </motion.h1>

        {/* Card stage */}
        <div
          className="
          relative
          mt-8    /* controls vertical distance from title */
          -mb-4   /* pulls everything slightly upward visually */
          flex items-start justify-center
          w-full
          h-[600px] sm:h-[640px]
          pointer-events-none /* so only the card itself gets clicks */
        "
          style={{
            // transparent container so we don't get that giant black block
            background: 'transparent',
          }}
        >
          {/* BACK CARDS */}
          <div
            className="absolute inset-0 flex items-start justify-center"
            style={{
              maskImage:
                'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage:
                'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)',
            }}
          >
            {queue.slice(index + 1, index + 3).map((game, i) => {
              const depth = i + 1
              const scale = 1 - depth * 0.06
              const translateY = depth * -20
              const opacity = 1 - depth * 0.25
              return (
                <div
                  key={game.gameId}
                  className="absolute will-change-transform transition-all duration-500 ease-out"
                  style={{
                    transform: `scale(${scale}) translateY(${translateY}px)`,
                    zIndex: 10 - depth,
                    opacity,
                    filter: 'blur(1px)',
                    pointerEvents: 'none',
                  }}
                >
                  <MiniPosterCard game={game} />
                </div>
              )
            })}
          </div>

          {/* ACTIVE CARD */}
          <AnimatePresence
            mode="wait"
            onExitComplete={() => {
              advanceDeck()
            }}
          >
            {current && showTop && (
              <motion.div
                key={current.gameId}
                className="absolute will-change-transform pointer-events-auto"
                initial={{ opacity: 0, scale: 0.9, y: 100 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    duration: 0.6,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                }}
                exit={
                  exitDir === 'left'
                    ? {
                        x: -500,
                        y: 80,
                        rotate: -10,
                        opacity: 0,
                        transition: {
                          duration: 0.6,
                          ease: [0.42, 0, 0.58, 1],
                        },
                      }
                    : exitDir === 'right'
                    ? {
                        x: 500,
                        y: 80,
                        rotate: 10,
                        opacity: 0,
                        transition: {
                          duration: 0.6,
                          ease: [0.42, 0, 0.58, 1],
                        },
                      }
                    : {}
                }
              >
                <GameCard
                  game={current}
                  onRate={handleRate}
                  onWishlist={handleWishlist}
                  onSkip={handleSkip}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status text below the stack */}
        {loadingMore && (
          <div className="text-sm text-neutral-400 mt-2 animate-pulse z-20">
            Loading more games...
          </div>
        )}

        {index >= queue.length - 1 && !loadingMore && (
          <div className="text-center text-neutral-400 text-sm mt-2 z-20">
            No more games in queue.
          </div>
        )}
      </div>
    </div>
  )
}
