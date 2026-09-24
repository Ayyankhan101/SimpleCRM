import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChartIcon, LetterIcon, UserIcon, LockPasswordIcon, AltArrowRightIcon, CheckCircleIcon, CloseIcon } from '@solar-icons/react/linear'
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
    <div className="min-h-[100dvh] flex bg-glassfin-neutral dark:bg-[#0a1a15]">
      {/* Left panel — branding (always dark) */}
      <div className="hidden lg:flex lg:w-1/2 bg-glassfin-secondary relative overflow-hidden rounded-r-3xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-glassfin-tertiary rounded-full blur-[128px]" />
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-glassfin-tertiary rounded-full blur-[96px]" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-2xl bg-glassfin-tertiary flex items-center justify-center">
                <ChartIcon size={22} className="text-glassfin-secondary" />
              </div>
              <span className="text-xl font-bold text-glassfin-neutral tracking-tight font-display">SimpleCRM</span>
            </div>
            <h1 className="text-4xl font-bold text-glassfin-neutral tracking-tight leading-tight mb-4 font-display">
              Simple CRM for
              <br />
              small businesses.
            </h1>
            <p className="text-lg text-glassfin-neutral/50 max-w-md leading-relaxed font-mono">
              Free for 1 user and 100 contacts. Upgrade when you're ready.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-glassfin-neutral dark:bg-[#0a1a15]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 rounded-2xl bg-glassfin-tertiary flex items-center justify-center">
              <ChartIcon size={18} className="text-glassfin-secondary" />
            </div>
            <span className="text-lg font-bold text-glassfin-secondary dark:text-glassfin-neutral font-display">SimpleCRM</span>
          </div>

          <h2 className="text-2xl font-bold text-glassfin-secondary dark:text-glassfin-neutral tracking-tight mb-1 font-display">Create account</h2>
          <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mb-8 font-mono">Start your free trial</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<LetterIcon size={18} className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50" />}
              value={form.email}
              onChange={update('email')}
              required
            />
            <Input
              label="Username"
              placeholder="Choose a username"
              icon={<UserIcon size={18} className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50" />}
              value={form.username}
              onChange={update('username')}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              icon={<LockPasswordIcon size={18} className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50" />}
              value={form.password}
              onChange={update('password')}
              required
            />

            {form.password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1.5"
              >
                {passwordRules.map(({ test, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    {test(form.password) ? (
                      <CheckCircleIcon size={14} className="text-glassfin-tertiary" />
                    ) : (
                      <CloseIcon size={14} className="text-glassfin-secondary/30 dark:text-glassfin-neutral/30" />
                    )}
                    <span className={test(form.password) ? 'text-glassfin-tertiary' : 'text-glassfin-secondary/50 dark:text-glassfin-neutral/50'}>
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
              icon={<LockPasswordIcon size={18} className="text-glassfin-secondary/50 dark:text-glassfin-neutral/50" />}
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 text-sm text-red-600 dark:text-red-400 font-mono rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Create account
              <AltArrowRightIcon size={16} />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-glassfin-secondary dark:text-glassfin-neutral hover:opacity-70 transition-opacity font-display">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
