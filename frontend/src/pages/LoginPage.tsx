import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { apiPost } from '../lib/api'

export function LoginPage() {
  const { login } = useAuth() // renamed to match your hook
  const [mode, setMode] = React.useState<'login' | 'signup'>('login')

  const [email, setEmail] = React.useState('')
  const [username, setUsername] = React.useState('') // only used on signup
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/signup'
      const body =
        mode === 'signup' ? { email, username, password } : { email, password }

      const data = await apiPost(path, body)

      if (data?.token) {
        login(data.token)
        setSuccess(
          mode === 'login'
            ? 'Signed in successfully!'
            : 'Account created successfully!'
        )
      } else {
        setError('Unexpected server response')
      }
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(
          mode === 'login'
            ? 'Invalid email or password'
            : 'Signup failed (email or username may already exist)'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="
        relative w-full h-full flex flex-col items-center justify-start
        pt-16 sm:pt-20
        text-white overflow-hidden
      "
    >
      {/* Radial background lighting */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_20%_20%,rgba(255,90,0,0.15)_0%,rgba(0,0,0,0)_60%),radial-gradient(circle_at_80%_30%,rgba(0,130,255,0.15)_0%,rgba(0,0,0,0)_60%)]
        "
        style={{ filter: 'blur(40px)' }}
      />

      {/* Bottom fade gradient */}
      <div
        className="
          pointer-events-none absolute bottom-0 left-0 w-full h-48
          bg-gradient-to-t from-black via-black/60 to-transparent
        "
      />

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="
          text-4xl sm:text-5xl font-extrabold tracking-tight text-white
          text-center mb-10 relative z-10
        "
      >
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </motion.h1>

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="
          relative z-10
          w-full max-w-[360px]
          rounded-2xl
          bg-[rgba(15,15,15,0.6)]
          backdrop-blur-xl
          ring-1 ring-white/10
          shadow-[0_40px_120px_rgba(0,0,0,0.9)]
          p-6 flex flex-col gap-6
        "
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {/* Email field */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-neutral-300">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full rounded-xl bg-white/5 text-white
                text-[14px] px-3 py-2.5
                ring-1 ring-white/15
                outline-none
                placeholder:text-neutral-500
                focus:ring-blue-400/40 focus:bg-white/10
                transition
              "
              required
            />
          </div>

          {/* Username field (signup only) */}
          {mode === 'signup' && (
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-neutral-300">
                Username
              </label>
              <input
                type="text"
                placeholder="yourusername"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="
                  w-full rounded-xl bg-white/5 text-white
                  text-[14px] px-3 py-2.5
                  ring-1 ring-white/15
                  outline-none
                  placeholder:text-neutral-500
                  focus:ring-blue-400/40 focus:bg-white/10
                  transition
                "
                required
              />
            </div>
          )}

          {/* Password field */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-neutral-300">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full rounded-xl bg-white/5 text-white
                text-[14px] px-3 py-2.5
                ring-1 ring-white/15
                outline-none
                placeholder:text-neutral-500
                focus:ring-blue-400/40 focus:bg-white/10
                transition
              "
              required
            />
          </div>

          {/* Feedback */}
          {error && (
            <div className="text-[12px] text-red-400 tracking-wide">
              {error}
            </div>
          )}
          {success && (
            <div className="text-[12px] text-emerald-400 tracking-wide">
              {success}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full rounded-xl text-[14px] font-medium py-2.5
              shadow-[0_20px_40px_rgba(37,99,235,0.45)]
              ring-1 ring-blue-400/40
              bg-[linear-gradient(to_bottom_right,rgb(67,97,238)_0%,rgb(37,88,255)_60%)]
              text-white active:scale-[0.99]
              transition
              ${loading ? 'opacity-70 cursor-wait' : ''}
            `}
          >
            {loading
              ? mode === 'login'
                ? 'Signing in...'
                : 'Creating...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center text-[12px] text-neutral-400 leading-tight">
          {mode === 'login' ? (
            <>
              Don’t have an account?{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setSuccess(null)
                }}
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                onClick={() => {
                  setMode('login')
                  setError(null)
                  setSuccess(null)
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
