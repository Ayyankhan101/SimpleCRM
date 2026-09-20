import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { House, Users, CurrencyCircleDollar, Lightning, SignOut, List, X, Sun, Moon, Funnel, Leaf } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/', icon: House, label: 'Dashboard', end: true },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/deals', icon: CurrencyCircleDollar, label: 'Deals' },
  { to: '/pipeline', icon: Funnel, label: 'Pipeline' },
  { to: '/activities', icon: Lightning, label: 'Activities' },
]

function ThemeToggle({ className = '' }) {
  const { theme, cycleTheme } = useTheme()
  
  const configs = {
    carga: { icon: Leaf, label: 'CARGA', next: 'dark' },
    dark: { icon: Moon, label: 'Dark', next: 'light' },
    light: { icon: Sun, label: 'Light', next: 'carga' },
  }
  
  const { icon: Icon, label } = configs[theme] || configs.carga
  
  return (
    <button
      onClick={cycleTheme}
      className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs font-display tracking-widest uppercase transition-colors duration-200 ${
        theme === 'dark'
          ? 'text-carga-primary/50 hover:text-carga-primary hover:bg-carga-primary/10'
          : 'text-carga-secondary/50 hover:text-carga-secondary hover:bg-carga-primary/50'
      } ${className}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  )
}

function SidebarContent({ user, onLogout, onNavClick }) {
  return (
    <>
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-carga-tertiary flex items-center justify-center" style={{ borderRadius: 0 }}>
            <span className="text-carga-secondary font-display font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-display font-bold text-carga-primary tracking-widest uppercase">SimpleCRM</span>
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
              `flex items-center gap-3 px-3 py-2.5 text-xs font-display tracking-widest uppercase transition-all duration-200 ${
                isActive
                  ? 'bg-carga-primary/20 text-carga-primary'
                  : 'text-carga-primary/50 hover:text-carga-primary hover:bg-carga-primary/10'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-carga-tertiary"
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

      <div className="px-3 pb-4 mt-auto space-y-1">
        <ThemeToggle />
        <div className="border-t border-carga-primary/10 pt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 bg-carga-tertiary flex items-center justify-center flex-shrink-0" style={{ borderRadius: 0 }}>
              <span className="text-carga-secondary text-sm font-display font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-display tracking-widest uppercase text-carga-primary truncate">{user?.username}</div>
              <div className="text-xs text-carga-primary/40 font-mono truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-xs font-display tracking-widest uppercase text-carga-primary/50 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
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
    <div className="flex min-h-[100dvh] bg-carga-primary dark:bg-carga-neutral">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-carga-secondary border-r border-carga-secondary z-30">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-carga-neutral/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar panel */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            key="sidebar-panel"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 w-72 bg-carga-secondary shadow-carga-lg z-50 lg:hidden flex flex-col"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-carga-primary/50 hover:text-carga-primary hover:bg-carga-primary/10 transition-colors"
            >
              <X size={20} />
            </button>
            <SidebarContent user={user} onLogout={handleLogout} onNavClick={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 bg-carga-secondary border-b border-carga-secondary px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-carga-primary/50 hover:text-carga-primary transition-colors"
          >
            <List size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-carga-tertiary flex items-center justify-center" style={{ borderRadius: 0 }}>
              <span className="text-carga-secondary font-display font-bold text-xs">S</span>
            </div>
            <span className="font-display font-bold text-carga-primary tracking-widest uppercase">SimpleCRM</span>
          </div>
        </div>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
