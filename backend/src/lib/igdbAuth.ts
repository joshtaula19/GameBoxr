import dotenv from 'dotenv'
dotenv.config()

let cachedToken: string | null = null
let tokenExpiresAt = 0 // ms epoch

export async function getIGDBAccessToken(): Promise<string> {
  const now = Date.now()

  // If we already have a token and it's not expired (give ~60s buffer)
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  // Otherwise, request a new one from Twitch
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID ?? '',
    client_secret: process.env.TWITCH_CLIENT_SECRET ?? '',
    grant_type: 'client_credentials',
  })

  const resp = await fetch(
    `https://id.twitch.tv/oauth2/token?${params.toString()}`,
    {
      method: 'POST',
    }
  )

  if (!resp.ok) {
    console.error('Failed to get IGDB access token', await resp.text())
    throw new Error('IGDB auth failed')
  }

  const data = (await resp.json()) as {
    access_token: string
    expires_in: number // seconds
    token_type: string
  }

  cachedToken = data.access_token
  tokenExpiresAt = now + data.expires_in * 1000

  return cachedToken
}
