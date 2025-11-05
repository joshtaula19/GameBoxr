export type GameSummary = {
  gameId: number
  title: string
  cover: string | null
  released: string | null
  gameRating: number | null
  platforms: string[]
  genres: string[]
}
