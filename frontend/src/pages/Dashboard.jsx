import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Users, CurrencyCircleDollar, Lightning, ArrowRight, CalendarBlank, EnvelopeSimple } from '@phosphor-icons/react'
import api from '../utils/api'
import { DEAL_STAGES, ACTIVITY_TYPES, getStageColor, getStageLabel, formatRelativeDate } from '../lib/constants'
import { StatSkeleton } from '../components/ui/Skeleton'
import Badge from '../components/ui/Badge'

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
    <div className={`flex items-center gap-3 p-3 border-l-2 ${border} hover:bg-carga-primary/50 dark:hover:bg-carga-neutral/50 transition-colors`}>
      <Badge color={typeColor} dot>
        {getStageLabel(ACTIVITY_TYPES, activity.type)}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium font-display text-carga-secondary dark:text-carga-primary truncate">{activity.subject}</p>
      </div>
      <span className="text-xs text-carga-secondary/50 dark:text-carga-primary/50 whitespace-nowrap font-mono">
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
  const [reminderStatus, setReminderStatus] = useState(null)
  const [sendingReminder, setSendingReminder] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    checkReminders()
  }, [])

  const checkReminders = async () => {
    try {
      const res = await api.get('/v1/reminders/check')
      setReminderStatus(res.data)
    } catch {}
  }

  const sendDigest = async () => {
    setSendingReminder(true)
    try {
      await api.post('/v1/reminders/digest')
      setReminderStatus(prev => ({ ...prev, should_send_digest: false, last_digest_sent: new Date().toISOString() }))
    } catch {}
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
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <StatSkeleton />

  const statItems = [
    { label: 'Contacts', value: stats.contacts, color: 'text-carga-secondary dark:text-carga-primary', icon: Users, to: '/contacts' },
    { label: 'Deals', value: stats.deals, color: 'text-emerald-600 dark:text-emerald-400', icon: CurrencyCircleDollar, to: '/deals' },
    { label: 'Activities', value: stats.activities, color: 'text-amber-600 dark:text-amber-400', icon: Lightning, to: '/activities' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl font-bold font-display text-carga-secondary dark:text-carga-primary tracking-tight">Dashboard</h1>
        <p className="text-sm text-carga-secondary/50 dark:text-carga-primary/50 mt-1">Overview of your CRM</p>
      </motion.div>

      {/* Email reminder banner */}
      {reminderStatus?.email_configured && reminderStatus?.should_send_digest && (
        <motion.div variants={item}
          className="mb-6 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" style={{ borderRadius: 0 }}>
          <EnvelopeSimple size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium font-display text-amber-800 dark:text-amber-200">
              {reminderStatus.overdue + reminderStatus.due_today} activit{(reminderStatus.overdue + reminderStatus.due_today) === 1 ? 'y' : 'ies'} need attention
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {reminderStatus.overdue} overdue, {reminderStatus.due_today} due today
            </p>
          </div>
          <button onClick={sendDigest} disabled={sendingReminder}
            className="px-3 py-1.5 text-xs font-medium font-display bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors whitespace-nowrap" style={{ borderRadius: 0 }}>
            {sendingReminder ? 'Sending...' : 'Email Digest'}
          </button>
        </motion.div>
      )}

      {/* Stats — border-top grouping, no cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-0 mb-8">
        {statItems.map(({ label, value, color, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="group p-6 border-t-2 border-carga-secondary/20 hover:border-emerald-500 transition-colors duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className="text-carga-secondary/30 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs font-medium font-display text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider">{label}</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${color}`}>
              <AnimatedNumber value={value} />
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Analytics row: Revenue + Email + Activity breakdown */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <div className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg p-6" style={{ borderRadius: 0 }}>
          <h3 className="text-sm font-semibold font-display text-carga-secondary dark:text-carga-primary mb-4">Revenue Trend</h3>
          {revenueTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={revenueTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: 0, border: '1px solid #332B1C33', background: '#F0E5C5', color: '#332B1C', fontSize: '13px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-sm text-carga-secondary/30">No closed deals yet</div>
          )}
        </div>

        {/* Email Engagement */}
        <div className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg p-6" style={{ borderRadius: 0 }}>
          <h3 className="text-sm font-semibold font-display text-carga-secondary dark:text-carga-primary mb-4">Email Engagement</h3>
          {emailEngagement.total > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-bold font-mono text-carga-secondary dark:text-carga-primary">{emailEngagement.total}</div>
                  <div className="text-[10px] text-carga-secondary/30 uppercase tracking-wider mt-1 font-display">Sent</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{emailEngagement.opened}</div>
                  <div className="text-[10px] text-carga-secondary/30 uppercase tracking-wider mt-1 font-display">Opened</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{emailEngagement.clicked}</div>
                  <div className="text-[10px] text-carga-secondary/30 uppercase tracking-wider mt-1 font-display">Clicked</div>
                </div>
              </div>
              <div className="pt-3 border-t border-carga-secondary/10">
                <div className="flex justify-between text-xs text-carga-secondary/50">
                  <span className="font-display">Open rate</span>
                  <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{Math.round((emailEngagement.opened / emailEngagement.total) * 100)}%</span>
                </div>
                <div className="flex justify-between text-xs text-carga-secondary/50 mt-1">
                  <span className="font-display">Click rate</span>
                  <span className="font-mono font-medium text-blue-600 dark:text-blue-400">{Math.round((emailEngagement.clicked / emailEngagement.total) * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-sm text-carga-secondary/30">No emails sent yet</div>
          )}
        </div>

        {/* Activity Breakdown */}
        <div className="bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg p-6" style={{ borderRadius: 0 }}>
          <h3 className="text-sm font-semibold font-display text-carga-secondary dark:text-carga-primary mb-4">Activity Breakdown</h3>
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
                      const colors = { call: '#3b82f6', email: '#10b981', meeting: '#f59e0b', note: '#8b5cf6', task: '#ef4444', follow_up: '#ec4899' }
                      return <Cell key={i} fill={colors[entry.type] || '#71717a'} />
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 0, border: '1px solid #332B1C33', background: '#F0E5C5', color: '#332B1C', fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {activityBreakdown.map((entry) => {
                  const colors = { call: 'bg-blue-500', email: 'bg-emerald-500', meeting: 'bg-amber-500', note: 'bg-violet-500', task: 'bg-red-500', follow_up: 'bg-pink-500' }
                  return (
                    <div key={entry.type} className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${colors[entry.type] || 'bg-carga-secondary/30'}`} style={{ borderRadius: 0 }} />
                      <span className="text-xs text-carga-secondary/50 dark:text-carga-primary/50 flex-1 capitalize font-display">{entry.type.replace('_', ' ')}</span>
                      <span className="text-xs font-mono font-medium text-carga-secondary dark:text-carga-primary">{entry.count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[120px] text-sm text-carga-secondary/30">No activities yet</div>
          )}
        </div>
      </motion.div>

      {/* Bento grid: 2fr 1fr */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pipeline chart — 3 cols */}
        <motion.div variants={item} className="lg:col-span-3 bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg p-8" style={{ borderRadius: 0 }}>
          <h3 className="text-sm font-semibold font-display text-carga-secondary dark:text-carga-primary mb-6">Deal Pipeline</h3>
          {pipeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipeline} barSize={32}>
                <XAxis
                  dataKey="stage"
                  tickFormatter={(s) => getStageLabel(DEAL_STAGES, s)}
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => [v, 'Deals']}
                  labelFormatter={(s) => getStageLabel(DEAL_STAGES, s)}
                  contentStyle={{
                    borderRadius: 0,
                    border: '1px solid #332B1C33',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    background: '#F0E5C5',
                    color: '#332B1C',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-sm text-carga-secondary/30">
              No deals yet
            </div>
          )}
        </motion.div>

        {/* Activities panel — 2 cols */}
        <motion.div variants={item} className="lg:col-span-2 bg-carga-surface dark:bg-carga-surface-dark border border-carga-secondary dark:border-carga-primary/20 shadow-carga-lg p-8" style={{ borderRadius: 0 }}>
          {overdueActivities.length === 0 && dueTodayActivities.length === 0 && upcomingActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarBlank size={28} className="text-carga-secondary/20 dark:text-carga-primary/20 mb-3" />
              <p className="text-sm text-carga-secondary/30 dark:text-carga-primary/30">No upcoming activities</p>
            </div>
          ) : (
            <div className="space-y-5">
              {overdueActivities.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xs font-semibold font-display text-red-600 dark:text-red-400 uppercase tracking-wider">Overdue</h4>
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" style={{ borderRadius: 0 }}>{overdueActivities.length}</span>
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
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" style={{ borderRadius: 0 }}>{dueTodayActivities.length}</span>
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
                    <h4 className="text-xs font-semibold font-display text-carga-secondary/50 dark:text-carga-primary/50 uppercase tracking-wider">Upcoming</h4>
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
