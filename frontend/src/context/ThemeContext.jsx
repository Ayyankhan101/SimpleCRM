import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const THEMES = ['glassfin', 'dark', 'light']

function getInitialTheme() {
  try {
    const stored = localStorage.getItem('glassfin-theme')
    if (THEMES.includes(stored)) return stored
  } catch {}
  return 'glassfin'
}

function applyTheme(theme) {
  try {
    document.documentElement.classList.remove('dark', 'light', 'glassfin')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.add('glassfin')
    }
  } catch {}
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  const setThemeAndPersist = (t) => {
    try { localStorage.setItem('glassfin-theme', t) } catch {}
    setTheme(t)
    applyTheme(t)
  }

  const cycleTheme = () => {
    const idx = THEMES.indexOf(theme)
    const next = THEMES[(idx + 1) % THEMES.length]
    setThemeAndPersist(next)
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeAndPersist, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
