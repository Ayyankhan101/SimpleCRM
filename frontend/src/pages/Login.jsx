import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendUp, Envelope, LockKey, ArrowRight } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(identifier, password)
      navigate('/')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Login failed'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google', { credentials: 'include' })
      const data = await response.json()
      if (data.auth_url) window.location.href = data.auth_url
    } catch {
      setError('Google login not configured')
    }
  }

  return (
    <div className="min-h-[100dvh] flex bg-carga-primary dark:bg-carga-neutral">
      {/* Left panel — branding (always dark) */}
      <div className="hidden lg:flex lg:w-1/2 bg-carga-neutral relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-carga-tertiary blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-carga-secondary blur-[96px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 bg-carga-tertiary text-carga-secondary flex items-center justify-center" style={{ borderRadius: 0 }}>
                <TrendUp size={22} weight="bold" />
              </div>
              <span className="text-xl font-bold text-carga-primary tracking-tight font-display">SimpleCRM</span>
            </div>
            <h1 className="text-4xl font-bold text-carga-primary tracking-tight leading-tight mb-4 font-display">
              Stop paying for
              <br />
              features you'll never use.
            </h1>
            <p className="text-lg text-carga-primary/50 max-w-md leading-relaxed font-mono">
              Contacts, deals, tasks. Nothing more. Built for small businesses that hate HubSpot.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-carga-primary dark:bg-carga-neutral">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-carga-tertiary text-carga-secondary flex items-center justify-center" style={{ borderRadius: 0 }}>
              <TrendUp size={18} weight="bold" />
            </div>
            <span className="text-lg font-bold text-carga-secondary dark:text-carga-primary font-display">SimpleCRM</span>
          </div>

          <h2 className="text-2xl font-bold text-carga-secondary dark:text-carga-primary tracking-tight mb-1 font-display">Welcome back</h2>
          <p className="text-sm text-carga-secondary/50 dark:text-carga-primary/50 mb-8 font-mono">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or Username"
              type="text"
              placeholder="you@example.com or username"
              icon={<Envelope size={18} className="text-carga-secondary/50 dark:text-carga-primary/50" />}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<LockKey size={18} className="text-carga-secondary/50 dark:text-carga-primary/50" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400 font-mono"
                style={{ borderRadius: 0 }}
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Sign in
              <ArrowRight size={16} weight="bold" />
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-carga-secondary/20 dark:border-carga-primary/10" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-carga-primary dark:bg-carga-neutral text-carga-secondary/50 dark:text-carga-primary/50 font-mono">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-5 py-2.5 border border-carga-secondary/30 dark:border-carga-primary/20 text-sm font-medium text-carga-secondary dark:text-carga-primary hover:bg-carga-surface dark:hover:bg-carga-surface-dark active:scale-[0.98] transition-all duration-200 font-mono"
            style={{ borderRadius: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-8 text-center text-sm text-carga-secondary/50 dark:text-carga-primary/50 font-mono">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-carga-secondary dark:text-carga-primary hover:opacity-70 transition-opacity">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
