import React from 'react'
import { DiscoverPage } from './pages/DiscoverPage'
import { ProfilePage } from './pages/ProfilePage'
import { LoginPage } from './pages/LoginPage'
import { useAuth } from './lib/auth'
import { Home, Star, Heart, User, Menu } from 'lucide-react'

export default function App() {
  // this controls which "page" is visible in the main area
  const [tab, setTab] = React.useState<'discover' | 'profile' | 'login'>(
    'discover'
  )

  // slide / collapse the sidebar
  const [menuOpen, setMenuOpen] = React.useState(true)

  const { token } = useAuth()

  return (
    <div
      className="
        flex min-h-screen w-full
        bg-neutral-950 text-white overflow-hidden
      "
    >
      {/* ─────────────────────────
          Sidebar (Global Nav)
         ───────────────────────── */}
      <aside
        className={`
          ${menuOpen ? 'w-56' : 'w-20'}
          flex flex-col justify-between items-center py-6 px-3
          bg-black/40 backdrop-blur-xl border-r border-white/10
          transition-all duration-500 ease-in-out
        `}
      >
        {/* Top section: burger + nav */}
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Burger button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition ring-1 ring-white/20 text-white"
          >
            <Menu size={20} />
          </button>

          {/* Nav items */}
          <nav
            className={`
              flex flex-col gap-5 items-start w-full transition-all
              ${menuOpen ? 'pl-4' : 'pl-0 items-center'}
            `}
          >
            {/* Discover / Home */}
            <button
              onClick={() => setTab('discover')}
              className={`
                flex items-center gap-3 text-neutral-300 hover:text-white transition
                ${tab === 'discover' ? 'text-white' : ''}
              `}
            >
              <Home size={20} />
              {menuOpen && <span>Discover</span>}
            </button>

            {/* Wishlist placeholder (not wired yet, but keep for visual) */}
            <button
              onClick={() => {
                // could become wishlist page later
              }}
              className="flex items-center gap-3 text-neutral-300 hover:text-white transition"
            >
              <Heart size={20} />
              {menuOpen && <span>Wishlist</span>}
            </button>

            {/* Rated / Activity placeholder */}
            <button
              onClick={() => {
                // could become rated/logged page later
              }}
              className="flex items-center gap-3 text-neutral-300 hover:text-white transition"
            >
              <Star size={20} />
              {menuOpen && <span>My Ratings</span>}
            </button>

            {/* Profile */}
            <button
              onClick={() => setTab('profile')}
              className={`
                flex items-center gap-3 text-neutral-300 hover:text-white transition
                ${tab === 'profile' ? 'text-white' : ''}
              `}
            >
              <User size={20} />
              {menuOpen && <span>Profile</span>}
            </button>

            {/* Sign in / account */}
            {!token && (
              <button
                onClick={() => setTab('login')}
                className={`
                  flex items-center gap-3 text-neutral-300 hover:text-white transition
                  ${tab === 'login' ? 'text-white' : ''}
                `}
              >
                {/* reuse User icon for now */}
                <User size={20} />
                {menuOpen && <span>Sign In</span>}
              </button>
            )}
          </nav>
        </div>

        {/* Footer / brand */}
        <div
          className={`
            text-[11px] text-neutral-500 transition-all
            ${menuOpen ? 'self-start pl-4' : 'text-center'}
          `}
        >
          © {new Date().getFullYear()} GameBoxr
        </div>
      </aside>

      {/* ─────────────────────────
          Main content area
         ───────────────────────── */}
      <main
        className="
          flex-1 flex flex-col items-center justify-start
          px-6 sm:px-10 py-0
          bg-[radial-gradient(circle_at_20%_15%,rgba(255,90,0,0.18)_0%,rgba(0,0,0,0)_60%),radial-gradient(circle_at_80%_10%,rgba(0,130,255,0.18)_0%,rgba(0,0,0,0)_60%)]
          overflow-hidden
        "
      >
        {tab === 'discover' && <DiscoverPage />}
        {tab === 'profile' && <ProfilePage />}
        {tab === 'login' && <LoginPage />}
      </main>
    </div>
  )
}
