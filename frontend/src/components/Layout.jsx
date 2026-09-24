import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HomeIcon, UsersGroupRoundedIcon, DollarIcon, FilterIcon, LightningIcon, LogoutIcon, HamburgerMenuIcon, CloseIcon, SunIcon, MoonIcon, LeafIcon } from '@solar-icons/react/linear'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navItems = [
  { to: '/', icon: HomeIcon, label: 'Dashboard', end: true },
  { to: '/contacts', icon: UsersGroupRoundedIcon, label: 'Contacts' },
  { to: '/deals', icon: DollarIcon, label: 'Deals' },
  { to: '/pipeline', icon: FilterIcon, label: 'Pipeline' },
  { to: '/activities', icon: LightningIcon, label: 'Activities' },
]

function ThemeToggle({ className = '' }) {
  const { theme, cycleTheme } = useTheme()
  const isGlassfin = theme === 'glassfin'

  const configs = {
    glassfin: { icon: LeafIcon, label: 'GLASSFIN', next: 'dark' },
    dark: { icon: MoonIcon, label: 'Dark', next: 'light' },
    light: { icon: SunIcon, label: 'Light', next: 'glassfin' },
  }

  const { icon: Icon, label } = configs[theme] || configs.glassfin

  return (
    <button
      onClick={cycleTheme}
      className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs font-display tracking-widest uppercase transition-colors duration-200 rounded-full ${
        theme === 'dark'
          ? 'text-glassfin-primary/50 hover:text-glassfin-primary hover:bg-glassfin-primary/10'
          : theme === 'light'
            ? 'text-glassfin-secondary/50 hover:text-glassfin-secondary hover:bg-glassfin-secondary/8'
            : 'text-glassfin-neutral/50 hover:text-glassfin-neutral hover:bg-glassfin-primary/10'
      } ${className}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  )
}

function SidebarContent({ user, onLogout, onNavClick }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const isGlassfin = theme === 'glassfin'

  return (
    <>
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 ${isLight ? 'bg-glassfin-secondary' : 'bg-glassfin-tertiary'} flex items-center justify-center rounded-full`}>
            <span className={`${isLight ? 'text-glassfin-neutral' : 'text-glassfin-neutral'} font-display font-bold text-sm`}>S</span>
          </div>
          <span className={`text-lg font-display font-bold ${isLight ? 'text-glassfin-secondary' : 'text-glassfin-primary'} tracking-widest uppercase`}>SimpleCRM</span>
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
              `flex items-center gap-3 px-3 py-2.5 text-xs font-display tracking-widest uppercase transition-all duration-200 rounded-full ${
                isActive
                  ? isLight
                    ? 'bg-glassfin-secondary/10 text-glassfin-secondary'
                    : 'bg-glassfin-primary/15 text-glassfin-primary dark:bg-glassfin-primary/20 dark:text-glassfin-primary'
                  : isLight
                    ? 'text-glassfin-secondary/50 hover:text-glassfin-secondary hover:bg-glassfin-secondary/8'
                    : isGlassfin
                      ? 'text-glassfin-neutral/60 hover:text-glassfin-neutral hover:bg-glassfin-primary/8'
                      : 'text-glassfin-neutral/50 hover:text-glassfin-neutral hover:bg-glassfin-primary/12'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className={`absolute -left-3 top-1/2 -translate-y-1/2 w-0.5 h-5 ${isLight ? 'bg-glassfin-secondary' : 'bg-glassfin-tertiary'} rounded-full`}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} weight={isActive ? 'Bold' : 'Linear'} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 mt-auto space-y-1">
        <ThemeToggle />
        <div className={`border-t ${isLight ? 'border-glassfin-secondary/10' : 'border-glassfin-neutral/10'} pt-4`}>
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className={`w-9 h-9 ${isLight ? 'bg-glassfin-secondary' : 'bg-glassfin-tertiary'} flex items-center justify-center flex-shrink-0 rounded-full`}>
              <span className="text-glassfin-neutral text-sm font-display font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0">
              <div className={`text-xs font-display tracking-widest uppercase ${isLight ? 'text-glassfin-secondary' : 'text-glassfin-neutral'} truncate`}>{user?.username}</div>
              <div className={`text-xs ${isLight ? 'text-glassfin-secondary/40' : 'text-glassfin-neutral/40'} font-mono truncate`}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs font-display tracking-widest uppercase ${isLight ? 'text-glassfin-secondary/50 hover:text-red-600 hover:bg-red-50' : isGlassfin ? 'text-glassfin-neutral/50 hover:text-red-400 hover:bg-red-500/12' : 'text-glassfin-neutral/50 hover:text-red-400 hover:bg-red-500/12'} transition-colors duration-200 rounded-full`}
          >
            <LogoutIcon size={20} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isLight = theme === 'light'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className={`flex min-h-[100dvh] ${isLight ? 'bg-[#f5ede6]' : 'bg-glassfin-neutral dark:bg-[#0a1a15]'}`}>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 ${isLight ? 'bg-[#f5ede6] border-r border-glassfin-secondary/10' : 'bg-glassfin-secondary'} z-30 rounded-r-2xl`}>
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
            className={`fixed inset-0 ${isLight ? 'bg-glassfin-secondary/20' : 'bg-glassfin-secondary/40'} backdrop-blur-sm z-40 lg:hidden`}
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
            className={`fixed inset-y-0 left-0 w-72 ${isLight ? 'bg-[#f5ede6]' : 'bg-glassfin-secondary shadow-glass-dark'} z-50 lg:hidden flex flex-col rounded-r-2xl`}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className={`absolute top-4 right-4 p-2 ${isLight ? 'text-glassfin-secondary/50 hover:text-glassfin-secondary hover:bg-glassfin-secondary/10' : 'text-glassfin-neutral/50 hover:text-glassfin-neutral hover:bg-glassfin-primary/15'} transition-colors rounded-full`}
            >
              <CloseIcon size={20} />
            </button>
            <SidebarContent user={user} onLogout={handleLogout} onNavClick={() => setMobileOpen(false)} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className={`lg:hidden sticky top-0 z-20 ${isLight ? 'bg-[#f5ede6]/80 border-b border-glassfin-secondary/10' : 'bg-glassfin-secondary/80 backdrop-blur-lg border-b border-glassfin-secondary/10'} px-4 py-3 flex items-center gap-3`}>
          <button
            onClick={() => setMobileOpen(true)}
            className={`p-2 -ml-2 ${isLight ? 'text-glassfin-secondary/50 hover:text-glassfin-secondary' : 'text-glassfin-neutral/50 hover:text-glassfin-neutral'} transition-colors rounded-full`}
          >
            <HamburgerMenuIcon size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 ${isLight ? 'bg-glassfin-secondary' : 'bg-glassfin-tertiary'} flex items-center justify-center rounded-full`}>
              <span className="text-glassfin-neutral font-display font-bold text-xs">S</span>
            </div>
            <span className={`font-display font-bold ${isLight ? 'text-glassfin-secondary' : 'text-glassfin-neutral'} tracking-widest uppercase`}>SimpleCRM</span>
          </div>
        </div>

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
