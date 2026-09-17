import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { House, Users, CurrencyCircleDollar, Lightning, SignOut, List, X } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', icon: House, label: 'Dashboard', end: true },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/deals', icon: CurrencyCircleDollar, label: 'Deals' },
  { to: '/activities', icon: Lightning, label: 'Activities' },
]

function SidebarContent({ user, onLogout, onNavClick }) {
  return (
    <>
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-zinc-950 tracking-tight">SimpleCRM</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative ${isActive ? '' : ''}`}>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 mt-auto">
        <div className="border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-zinc-950 truncate">{user?.username}</div>
              <div className="text-xs text-zinc-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
          >
            <SignOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-[100dvh] bg-zinc-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-glass z-30">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div key="mobile-sidebar">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 bg-white shadow-diffusion-lg z-50 lg:hidden flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
              <SidebarContent user={user} onLogout={handleLogout} onNavClick={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-zinc-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            <List size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-zinc-950">SimpleCRM</span>
          </div>
        </div>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
