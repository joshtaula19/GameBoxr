import React from 'react'
import { motion } from 'framer-motion'
import { apiGet } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Star } from 'lucide-react'

type GameRatingRow = {
  id: string
  gameId: number
  title: string
  coverImage: string | null
  platforms: string | null
  genres: string | null
  releaseYear: number | null
  stars: number | null
  status: string
  createdAt: string
}

export function ProfilePage() {
  const { token } = useAuth()
  const [ratings, setRatings] = React.useState<GameRatingRow[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!token) return
    apiGet('/me/ratings', token)
      .then(setRatings)
      .catch((err) => {
        console.error(err)
        setError('Failed to load your rated games')
      })
  }, [token])

  if (!token)
    return (
      <main className="p-6 text-white">
        <p>You’re not signed in.</p>
      </main>
    )

  if (error)
    return (
      <main className="p-6 text-white">
        <p className="text-red-400 text-sm">{error}</p>
      </main>
    )

  if (!ratings)
    return (
      <main className="p-6 text-white">
        <p>Loading your games…</p>
      </main>
    )

  return (
    <main
      className="
        relative w-full min-h-screen text-white
        overflow-y-auto
        bg-[radial-gradient(circle_at_20%_20%,rgba(255,90,0,0.12)_0%,rgba(0,0,0,0)_60%),radial-gradient(circle_at_80%_30%,rgba(0,130,255,0.12)_0%,rgba(0,0,0,0)_60%)]
      "
    >
      {/* bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <section className="p-6 pb-24 max-w-[1300px] mx-auto">
        <h1 className="text-3xl font-extrabold mb-3 text-center">
          Your Library
        </h1>
        <p className="text-neutral-400 text-sm text-center mb-10">
          Rated, wishlisted, and saved games
        </p>

        {ratings.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center">
            You haven’t rated or wishlisted anything yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {ratings.map((r) => {
              const genres = r.genres
                ? r.genres.split(',').map((g) => g.trim())
                : []
              return (
                <motion.div
                  key={r.id}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 16 }}
                  className="
                    relative group
                    rounded-2xl overflow-hidden
                    bg-[rgba(20,20,20,0.6)]
                    ring-1 ring-white/10
                    shadow-[0_10px_40px_rgba(0,0,0,0.7)]
                    backdrop-blur-xl
                    cursor-pointer
                    flex flex-col
                    transition
                  "
                >
                  {/* Poster cover */}
                  {r.coverImage ? (
                    <img
                      src={r.coverImage}
                      alt={r.title}
                      className="w-full aspect-[3/4] object-cover group-hover:opacity-90 transition-all"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-neutral-800 flex items-center justify-center text-neutral-500 text-xs">
                      No cover
                    </div>
                  )}

                  {/* Info area */}
                  <div className="p-3 flex flex-col gap-1">
                    <div className="font-semibold text-[13px] leading-tight truncate">
                      {r.title}
                    </div>

                    {/* Stars */}
                    {r.stars ? (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={`${
                              i < (r.stars ?? 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-neutral-700'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-neutral-500 italic">
                        {r.status === 'wishlist' ? 'Wishlist' : 'Unrated'}
                      </div>
                    )}

                    {/* Genre / Year */}
                    <div className="text-[11px] text-neutral-500 truncate">
                      {genres.slice(0, 2).join(' / ')}
                      {r.releaseYear && ` • ${r.releaseYear}`}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
