import { motion, useAnimation } from 'framer-motion'
import { StarRating } from './StarRating'
import { Star, Heart, X } from 'lucide-react'

export type Game = {
  gameId: number
  title: string
  cover: string | null
  released: string | null
  rating: number | null
  platforms: string[]
  genres: string[]
}

type Props = {
  game: Game
  onRate: (stars: number) => void
  onWishlist: () => void
  onSkip: () => void
}

export function GameCard({ game, onRate, onWishlist, onSkip }: Props) {
  const year = game.released
    ? new Date(game.released).getUTCFullYear()
    : undefined

  const platformsText =
    game.platforms && game.platforms.length > 0
      ? game.platforms.slice(0, 3).join(', ')
      : '—'

  const genresText =
    game.genres && game.genres.length > 0
      ? game.genres.slice(0, 2).join(' / ')
      : '—'

  // Small motion controls for each icon
  const starControls = useAnimation()
  const heartControls = useAnimation()
  const skipControls = useAnimation()

  async function handleAnimatedRate() {
    await starControls.start({
      scale: [1, 1.4, 1],
      rotate: [0, -10, 0],
      transition: { duration: 0.4, ease: 'easeOut' },
    })
    onRate(5)
  }

  async function handleAnimatedWishlist() {
    await heartControls.start({
      scale: [1, 1.3, 1],
      transition: { duration: 0.4, ease: 'easeOut' },
    })
    onWishlist()
  }

  async function handleAnimatedSkip() {
    await skipControls.start({
      scale: [1, 0.9, 1.2, 1],
      color: ['#a1a1aa', '#ef4444', '#ef4444', '#a1a1aa'],
      transition: { duration: 0.5, ease: 'easeOut' },
    })
    onSkip()
  }

  return (
    <section
      className={`
        relative
        w-full
        max-w-[400px] sm:max-w-[420px]
        rounded-[32px]
        overflow-hidden
        shadow-[0_50px_140px_rgba(0,0,0,0.9)]
        ring-1 ring-white/10
        bg-neutral-900
        text-white
      `}
      style={{
        background:
          'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0) 60%)',
      }}
    >
      {/* Poster */}
      <div className="relative w-full aspect-[3/4] bg-neutral-800">
        {game.cover ? (
          <img
            src={game.cover}
            alt={game.title}
            className="h-full w-full object-cover select-none pointer-events-none"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-neutral-600 text-sm">
            No cover
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Info / Actions */}
      <div
        className="
          relative -mt-6
          rounded-t-[24px]
          bg-[rgba(15,15,15,0.75)]
          backdrop-blur-xl
          ring-1 ring-white/10
          px-5 pt-4 pb-5
          flex flex-col gap-4
        "
      >
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold leading-snug text-white truncate">
              {game.title}
            </h2>
            <p className="text-[12px] text-neutral-300 leading-tight truncate">
              {year ? `${year} • ${platformsText}` : platformsText}
            </p>
            <p className="text-[11px] text-neutral-500 leading-tight truncate">
              {genresText}
            </p>
          </div>

          <div className="flex-none rounded-xl bg-white/10 px-2 py-1 text-[11px] font-medium text-neutral-100 ring-1 ring-white/20 leading-none min-w-[3rem] text-center">
            {game.rating ? `${game.rating.toFixed(1)}★` : '—'}
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex items-center justify-center mt-2">
          <StarRating onSelect={onRate} />
        </div>

        {/* Animated Icon Toolbar */}
        <div className="flex items-center justify-around pt-3 border-t border-white/10">
          {/* Rate */}
          <motion.button
            animate={starControls}
            onClick={handleAnimatedRate}
            className="
              p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95
              transition-all duration-200 ring-1 ring-white/10 hover:ring-yellow-400/40
              text-yellow-400 hover:text-yellow-300
            "
            title="Rate"
          >
            <Star size={20} />
          </motion.button>

          {/* Wishlist */}
          <motion.button
            animate={heartControls}
            onClick={handleAnimatedWishlist}
            className="
              p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95
              transition-all duration-200 ring-1 ring-white/10 hover:ring-pink-500/40
              text-pink-500 hover:text-pink-400
            "
            title="Add to Wishlist"
          >
            <Heart size={20} />
          </motion.button>

          {/* Skip */}
          <motion.button
            animate={skipControls}
            onClick={handleAnimatedSkip}
            className="
              p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95
              transition-all duration-200 ring-1 ring-white/10 hover:ring-red-400/40
              text-neutral-400 hover:text-red-400
            "
            title="Skip"
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <p className="text-[11px] text-neutral-500 leading-none">
            Released: {game.released ?? 'Unknown'}
          </p>
        </div>
      </div>
    </section>
  )
}
