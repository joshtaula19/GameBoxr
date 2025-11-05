import React from 'react'

export function useAuth() {
  const [token, setToken] = React.useState<string | null>(
    localStorage.getItem('token')
  )

  function login(newToken: string) {
    localStorage.setItem('token', newToken)
    setToken(newToken)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return { token, login, logout }
}
