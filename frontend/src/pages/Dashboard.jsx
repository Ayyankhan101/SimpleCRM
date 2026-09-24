import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { UsersGroupRoundedIcon, DollarIcon, LightningIcon, AltArrowRightIcon, CalendarIcon, LetterIcon } from '@solar-icons/react/linear'
import api from '../utils/api'
import { DEAL_STAGES, ACTIVITY_TYPES, getStageColor, getStageLabel, formatRelativeDate } from '../lib/constants'
import { StatSkeleton } from '../components/ui/Skeleton'
import Badge from '../components/ui/Badge'

let gsapRegistered = false
function ensureGsap() {
  if (gsapRegistered || typeof window === 'undefined' || !window.matchMedia) return
  import('gsap').then(({ default: gsap }) =>
    import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger)
      gsapRegistered = true
    })
  )
}

function useScrollReveal(ref) {
  useEffect(() => {
    ensureGsap()
    if (!ref.current || typeof window === 'undefined' || !window.matchMedia) return
    const el = ref.current
    let kill
    import('gsap').then(({ default: gsap }) =>
      import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
        if (!window.matchMedia) return
        gsap.registerPlugin(ScrollTrigger)
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true }
          }
        )
        kill = () => { ScrollTrigger.getAll().forEach(t => t.kill()) }
      })
    )
    return () => { if (kill) kill() }
  }, [ref])
}

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    let start = 0
    const startTime = performance.now()
    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) ref.current = requestAnimationFrame(animate)
    }
    ref.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(ref.current)
  }, [value, duration])

  return <span>{display}</span>
}

const glassTooltipStyle = {
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.15)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
  backdropFilter: 'blur(12px)',
  background: 'rgba(255, 246, 241, 0.9)',
  color: '#123029',
  fontSize: '13px',
  padding: '8px 12px',
}

const darkTooltipStyle = {
  ...glassTooltipStyle,
  background: 'rgba(18, 48, 41, 0.9)',
  color: '#FFF6F1',
  border: '1px solid rgba(255,255,255,0.08)',
}

function useIsDark() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.classList.contains('dark')
}

function GlassTooltip({ active, payload, label, formatter }) {
  const isDark = useIsDark()
  if (!active || !payload?.length) return null
  return (
    <div style={isDark ? darkTooltipStyle : glassTooltipStyle}>
      {label && <p style={{ marginBottom: 4, opacity: 0.6, fontSize: 11 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontWeight: 600 }}>
          {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
}

function ActivityRow({ activity, border }) {
  const typeColor = getStageColor(ACTIVITY_TYPES, activity.type)
  return (
    <div className={`flex items-center gap-3 p-3 border-l-2 ${border} hover:bg-glassfin-primary/5 dark:hover:bg-glassfin-primary/8 transition-colors rounded-r-lg`}>
      <Badge color={typeColor} dot>
        {getStageLabel(ACTIVITY_TYPES, activity.type)}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium font-display text-glassfin-secondary dark:text-glassfin-neutral truncate">{activity.subject}</p>
      </div>
      <span className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 whitespace-nowrap font-mono">
        {formatRelativeDate(activity.due_date)}
      </span>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, deals: 0, activities: 0 })
  const [pipeline, setPipeline] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [emailEngagement, setEmailEngagement] = useState({ total: 0, opened: 0, clicked: 0 })
  const [activityBreakdown, setActivityBreakdown] = useState([])
  const [overdueActivities, setOverdueActivities] = useState([])
  const [dueTodayActivities, setDueTodayActivities] = useState([])
  const [upcomingActivities, setUpcomingActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reminderStatus, setReminderStatus] = useState(null)
  const [sendingReminder, setSendingReminder] = useState(false)
  const analyticsRef = useRef(null)
  const bentoRef = useRef(null)

  useScrollReveal(analyticsRef)
  useScrollReveal(bentoRef)

  useEffect(() => {
    fetchDashboardData()
    checkReminders()
  }, [])

  const checkReminders = async () => {
    try {
      const res = await api.get('/v1/reminders/check')
      setReminderStatus(res.data)
    } catch (err) {
      console.error('Failed to check reminders:', err)
    }
  }

  const sendDigest = async () => {
    setSendingReminder(true)
    try {
      await api.post('/v1/reminders/digest')
      setReminderStatus(prev => ({ ...prev, should_send_digest: false, last_digest_sent: new Date().toISOString() }))
    } catch (err) {
      console.error('Failed to send digest:', err)
    }
    setSendingReminder(false)
  }

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/v1/stats')
      const data = statsRes.data

      setStats({
        contacts: data.contacts || 0,
        deals: data.deals || 0,
        activities: data.activities || 0,
      })

      setPipeline(data.pipeline || [])
      setRevenueTrend(data.revenue_trend || [])
      setEmailEngagement(data.email_engagement || { total: 0, opened: 0, clicked: 0 })
      setActivityBreakdown(data.activity_breakdown || [])
      setOverdueActivities(data.overdue_activities || [])
      setDueTodayActivities(data.due_today_activities || [])
      setUpcomingActivities(data.upcoming_activities || [])
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <StatSkeleton />

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mb-4">{error}</p>
        <button onClick={() => { setError(null); setLoading(true); fetchDashboardData(); }}
          className="px-4 py-2 text-xs font-medium font-display bg-glassfin-primary text-white hover:bg-glassfin-primary/90 transition-colors rounded-full">
          Retry
        </button>
      </div>
    )
  }

  const statItems = [
    { label: 'Contacts', value: stats.contacts, color: 'text-glassfin-secondary dark:text-glassfin-neutral', icon: UsersGroupRoundedIcon, to: '/contacts' },
    { label: 'Deals', value: stats.deals, color: 'text-glassfin-tertiary', icon: DollarIcon, to: '/deals' },
    { label: 'Activities', value: stats.activities, color: 'text-glassfin-primary', icon: LightningIcon, to: '/activities' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl font-bold font-display text-glassfin-secondary dark:text-glassfin-neutral tracking-tight">Dashboard</h1>
        <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">Overview of your CRM</p>
      </motion.div>

      {/* Email reminder banner */}
      {reminderStatus?.email_configured && reminderStatus?.should_send_digest && (
        <motion.div variants={item}
          className="mb-6 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <LetterIcon size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium font-display text-amber-800 dark:text-amber-200">
              {reminderStatus.overdue + reminderStatus.due_today} activit{(reminderStatus.overdue + reminderStatus.due_today) === 1 ? 'y' : 'ies'} need attention
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {reminderStatus.overdue} overdue, {reminderStatus.due_today} due today
            </p>
          </div>
          <button onClick={sendDigest} disabled={sendingReminder}
            className="px-3 py-1.5 text-xs font-medium font-display bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors whitespace-nowrap rounded-full">
            {sendingReminder ? 'Sending...' : 'Email Digest'}
          </button>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statItems.map(({ label, value, color, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="group glass p-6 hover:shadow-glass-lg transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className="text-glassfin-secondary/30 dark:text-glassfin-neutral/30 group-hover:text-glassfin-tertiary transition-colors" />
              <span className="text-xs font-medium font-display text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider">{label}</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${color}`}>
              <AnimatedNumber value={value} />
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Analytics row */}
      <motion.div ref={analyticsRef} variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="glass p-6">
          <h3 className="text-sm font-semibold font-display text-glassfin-secondary dark:text-glassfin-neutral mb-4">Revenue Trend</h3>
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={<GlassTooltip formatter={(v) => `$${v.toLocaleString()}`} />}
                />
                <Line type="monotone" dataKey="value" stroke="#2F9078" strokeWidth={2} dot={{ r: 3, fill: '#2F9078' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] text-sm text-glassfin-secondary/30 dark:text-glassfin-neutral/30 gap-2">
              <DollarIcon size={28} className="opacity-40" />
              <span>No closed deals yet</span>
            </div>
          )}
        </div>

        {/* Email Engagement */}
        <div className="glass p-6">
          <h3 className="text-sm font-semibold font-display text-glassfin-secondary dark:text-glassfin-neutral mb-4">Email Engagement</h3>
          {emailEngagement.total > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold font-mono text-glassfin-secondary dark:text-glassfin-neutral">{emailEngagement.total}</div>
                  <div className="text-[10px] text-glassfin-secondary/30 dark:text-glassfin-neutral/30 uppercase tracking-wider mt-1 font-display">Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-glassfin-tertiary">{emailEngagement.opened}</div>
                  <div className="text-[10px] text-glassfin-secondary/30 dark:text-glassfin-neutral/30 uppercase tracking-wider mt-1 font-display">Opened</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-glassfin-primary">{emailEngagement.clicked}</div>
                  <div className="text-[10px] text-glassfin-secondary/30 dark:text-glassfin-neutral/30 uppercase tracking-wider mt-1 font-display">Clicked</div>
                </div>
              </div>
              <div className="pt-3 border-t border-glassfin-secondary/10 dark:border-glassfin-neutral/10">
                <div className="flex justify-between text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50">
                  <span className="font-display">Open rate</span>
                  <span className="font-mono font-medium text-glassfin-tertiary">{Math.round((emailEngagement.opened / emailEngagement.total) * 100)}%</span>
                </div>
                <div className="flex justify-between text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 mt-1">
                  <span className="font-display">Click rate</span>
                  <span className="font-mono font-medium text-glassfin-primary">{Math.round((emailEngagement.clicked / emailEngagement.total) * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-sm text-glassfin-secondary/30 dark:text-glassfin-neutral/30">No emails sent yet</div>
          )}
        </div>

        {/* Activity Breakdown */}
        <div className="glass p-6">
          <h3 className="text-sm font-semibold font-display text-glassfin-secondary dark:text-glassfin-neutral mb-4">Activity Breakdown</h3>
          {activityBreakdown.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={activityBreakdown}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={50}
                    innerRadius={25}
                    strokeWidth={0}
                  >
                    {activityBreakdown.map((entry, i) => {
                       const colors = { call: '#123029', email: '#2F9078', meeting: '#E0714A', note: '#64748b', task: '#2F9078', follow_up: '#ef4444' }
                       return <Cell key={i} fill={colors[entry.type] || '#64748b'} />
                    })}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {activityBreakdown.map((entry) => {
                  const colors = { call: 'bg-glassfin-secondary', email: 'bg-glassfin-tertiary', meeting: 'bg-glassfin-primary', note: 'bg-gray-400', task: 'bg-glassfin-tertiary', follow_up: 'bg-red-500' }
                  return (
                    <div key={entry.type} className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${colors[entry.type] || 'bg-glassfin-secondary/30'} rounded-full`} />
                      <span className="text-xs text-glassfin-secondary/50 dark:text-glassfin-neutral/50 flex-1 capitalize font-display">{entry.type.replace('_', ' ')}</span>
                      <span className="text-xs font-mono font-medium text-glassfin-secondary dark:text-glassfin-neutral">{entry.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-sm text-glassfin-secondary/30 dark:text-glassfin-neutral/30">No activities yet</div>
          )}
        </div>
      </motion.div>

      {/* Bento grid: 2fr 1fr */}
      <div ref={bentoRef} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pipeline chart — 3 cols */}
        <motion.div variants={item} className="lg:col-span-3 glass p-8">
          <h3 className="text-sm font-semibold font-display text-glassfin-secondary dark:text-glassfin-neutral mb-6">Deal Pipeline</h3>
          {pipeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipeline} barSize={32}>
                <XAxis
                  dataKey="stage"
                  tickFormatter={(s) => getStageLabel(DEAL_STAGES, s)}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={<GlassTooltip formatter={(v) => [v, 'Deals']} />}
                  labelFormatter={(s) => getStageLabel(DEAL_STAGES, s)}
                />
                <Bar dataKey="count" fill="#2F9078" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-sm text-glassfin-secondary/30 dark:text-glassfin-neutral/30">
              No deals yet
            </div>
          )}
        </motion.div>

        {/* Activities panel — 2 cols */}
        <motion.div variants={item} className="lg:col-span-2 glass p-8">
          {overdueActivities.length === 0 && dueTodayActivities.length === 0 && upcomingActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarIcon size={28} className="text-glassfin-secondary/20 dark:text-glassfin-neutral/20 mb-3" />
              <p className="text-sm text-glassfin-secondary/30 dark:text-glassfin-neutral/30">No upcoming activities</p>
            </div>
          ) : (
            <div className="space-y-5">
              {overdueActivities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xs font-semibold font-display text-red-600 dark:text-red-400 uppercase tracking-wider">Overdue</h4>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 rounded-full">{overdueActivities.length}</span>
                  </div>
                  <div className="space-y-2">
                    {overdueActivities.map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} border="border-l-red-500" />
                    ))}
                  </div>
                </div>
              )}
              {dueTodayActivities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xs font-semibold font-display text-amber-600 dark:text-amber-400 uppercase tracking-wider">Due Today</h4>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-full">{dueTodayActivities.length}</span>
                  </div>
                  <div className="space-y-2">
                    {dueTodayActivities.map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} border="border-l-amber-500" />
                    ))}
                  </div>
                </div>
              )}
              {upcomingActivities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xs font-semibold font-display text-glassfin-secondary/50 dark:text-glassfin-neutral/50 uppercase tracking-wider">Upcoming</h4>
                  </div>
                  <div className="space-y-2">
                    {upcomingActivities.map((activity) => (
                      <ActivityRow key={activity.id} activity={activity} border="" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
