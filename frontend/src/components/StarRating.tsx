import React from 'react'

type Props = {
  onSelect: (stars: number) => void
}

export function StarRating({ onSelect }: Props) {
  // which star index we're currently hovering, 1-5
  const [hovered, setHovered] = React.useState<number | null>(null)

  // We'll render 5 stars. Each star:
  // - muted gray by default
  // - turns gold if its index <= hovered
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => {
        // is this star "active" based on hover?
        const active = hovered !== null && n <= hovered

        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              onSelect(n)
              // optional: clear hover instantly to avoid flicker as card swaps
              setHovered(null)
            }}
            className={`
              text-2xl leading-none transition-transform
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500/60 rounded-md px-1
              ${active ? 'text-yellow-400 scale-110' : 'text-neutral-500'}
            `}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        )
      })}
    </div>
  )
}
