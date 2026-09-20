import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const THEMES = ['carga', 'dark', 'light']

function getInitialTheme() {
  const stored = localStorage.getItem('simplecrm-theme')
  if (THEMES.includes(stored)) return stored
  return 'carga'
}

function applyTheme(theme) {
  document.documentElement.classList.remove('dark', 'light')
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme === 'light') {
    document.documentElement.classList.add('light')
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  const setThemeAndPersist = (t) => {
    localStorage.setItem('simplecrm-theme', t)
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
