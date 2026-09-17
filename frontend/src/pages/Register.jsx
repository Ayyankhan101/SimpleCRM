import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendUp, Envelope, User, LockKey, ArrowRight, Check, X } from '@phosphor-icons/react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const passwordRules = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p) => /[0-9]/.test(p), label: 'One number' },
]

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!passwordRules.every((r) => r.test(form.password))) {
      setError('Password does not meet requirements')
      return
    }

    setLoading(true)
    try {
      await register(form.email, form.password, form.username)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-emerald-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-emerald-400 rounded-full blur-[96px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center">
                <TrendUp size={22} className="text-white" weight="bold" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SimpleCRM</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight mb-4">
              Simple CRM for
              <br />
              small businesses.
            </h1>
            <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
              Free for 1 user and 100 contacts. Upgrade when you're ready.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <TrendUp size={18} className="text-white" weight="bold" />
            </div>
            <span className="text-lg font-bold text-zinc-950">SimpleCRM</span>
          </div>

          <h2 className="text-2xl font-bold text-zinc-950 tracking-tight mb-1">Create account</h2>
          <p className="text-sm text-zinc-500 mb-8">Start your free trial</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Envelope size={18} className="text-zinc-400" />}
              value={form.email}
              onChange={update('email')}
              required
            />
            <Input
              label="Username"
              placeholder="Choose a username"
              icon={<User size={18} className="text-zinc-400" />}
              value={form.username}
              onChange={update('username')}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              icon={<LockKey size={18} className="text-zinc-400" />}
              value={form.password}
              onChange={update('password')}
              required
            />

            {/* Password rules */}
            {form.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                {passwordRules.map(({ test, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    {test(form.password) ? (
                      <Check size={14} className="text-emerald-500" weight="bold" />
                    ) : (
                      <X size={14} className="text-zinc-300" />
                    )}
                    <span className={test(form.password) ? 'text-emerald-600' : 'text-zinc-400'}>
                      {label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}

            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              icon={<LockKey size={18} className="text-zinc-400" />}
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Create account
              <ArrowRight size={16} weight="bold" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
