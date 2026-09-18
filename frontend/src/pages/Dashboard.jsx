import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, CurrencyCircleDollar, Lightning, ArrowRight, CalendarBlank } from '@phosphor-icons/react'
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

export default function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, deals: 0, activities: 0 })
  const [pipeline, setPipeline] = useState([])
  const [upcomingActivities, setUpcomingActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

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
      setUpcomingActivities(data.upcoming_activities || [])
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <StatSkeleton />

  const statItems = [
    { label: 'Contacts', value: stats.contacts, color: 'text-zinc-950 dark:text-zinc-50', icon: Users, to: '/contacts' },
    { label: 'Deals', value: stats.deals, color: 'text-emerald-600 dark:text-emerald-400', icon: CurrencyCircleDollar, to: '/deals' },
    { label: 'Activities', value: stats.activities, color: 'text-amber-600 dark:text-amber-400', icon: Lightning, to: '/activities' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="visible">
      <motion.div variants={item} className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Overview of your CRM</p>
      </motion.div>

      {/* Stats — border-top grouping, no cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-0 mb-8">
        {statItems.map(({ label, value, color, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className="group p-6 border-t-2 border-zinc-100 dark:border-zinc-800 hover:border-emerald-500 transition-colors duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className="text-zinc-400 group-hover:text-emerald-500 transition-colors" />
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</span>
            </div>
            <div className={`text-3xl font-bold font-mono ${color}`}>
              <AnimatedNumber value={value} />
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Bento grid: 2fr 1fr */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Pipeline chart — 3 cols */}
        <motion.div variants={item} className="lg:col-span-3 bg-white dark:bg-zinc-900 rounded-4xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-8">
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 mb-6">Deal Pipeline</h3>
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
                    borderRadius: '12px',
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-sm text-zinc-400">
              No deals yet
            </div>
          )}
        </motion.div>

        {/* Upcoming activities — 2 cols */}
        <motion.div variants={item} className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-4xl border border-slate-200/50 dark:border-zinc-700/50 shadow-diffusion p-8">
          <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 mb-6">Upcoming Activities</h3>
          {upcomingActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarBlank size={28} className="text-zinc-300 dark:text-zinc-600 mb-3" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">No upcoming activities</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingActivities.map((activity) => {
                const typeColor = getStageColor(ACTIVITY_TYPES, activity.type)
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <Badge color={typeColor} dot>
                      {getStageLabel(ACTIVITY_TYPES, activity.type)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50 truncate">{activity.subject}</p>
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                      {formatRelativeDate(activity.due_date)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
