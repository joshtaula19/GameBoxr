// const API_URL = 'http://localhost:3000/api'

export async function apiGet(path: string, token?: string) {
  const res = await fetch(`http://localhost:3000/api${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Bad response: ${res.status}`)
  return res.json()
}

export async function apiPost(
  path: string,
  body: unknown,
  token?: string | null
) {
  const res = await fetch(
    `http://localhost:3000/api${path}`.replace('/api/api', '/api'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) {
    throw new Error(`POST ${path} failed ${res.status}`)
  }
  return res.json()
}
