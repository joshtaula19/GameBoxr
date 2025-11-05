import { type Game } from './GameCard'

export function MiniPosterCard({ game }: { game: Game }) {
  return (
    <div
      className="
        relative
        w-full
        max-w-[400px] sm:max-w-[420px]
        rounded-[32px]
        overflow-hidden
        shadow-[0_50px_140px_rgba(0,0,0,0.8)]
        ring-1 ring-white/10
        bg-neutral-900
      "
      style={{
        background:
          'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.07) 0%, rgba(0,0,0,0) 60%)',
      }}
    >
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
        {/* add the same subtle bottom fade so it matches the hero card silhouette */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
    </div>
  )
}
