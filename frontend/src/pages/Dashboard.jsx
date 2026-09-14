import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import api from '../utils/api'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState(90)

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    try {
      const [summaryRes, trendsRes, breakdownRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get(`/analytics/trends?days=${dateRange}`),
        api.get('/analytics/category-breakdown')
      ])
      setSummary(summaryRes.data)
      setTrends(trendsRes.data.trends)
      setBreakdown(breakdownRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    )
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const calcTrend = (field) => {
    if (trends.length < 2) return null
    const recent = trends[trends.length - 1]?.[field] || 0
    const previous = trends[trends.length - 2]?.[field] || 0
    if (previous === 0) return null
    return ((recent - previous) / previous * 100).toFixed(1)
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your data analytics</p>
        <div className="date-range-selector">
          {[7, 30, 90, 180].map(days => (
            <button
              key={days}
              className={`btn ${dateRange === days ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDateRange(days)}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value primary">{formatNumber(summary?.total_entries)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed Cases</div>
          <div className="stat-value danger">{formatNumber(summary?.total_confirmed)}</div>
          {calcTrend('confirmed') && (
            <div className={`stat-trend ${parseFloat(calcTrend('confirmed')) > 0 ? 'up' : 'down'}`}>
              {parseFloat(calcTrend('confirmed')) > 0 ? '↑' : '↓'} {Math.abs(calcTrend('confirmed'))}%
            </div>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-label">Deaths</div>
          <div className="stat-value">{formatNumber(summary?.total_deaths)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Recovery Rate</div>
          <div className="stat-value success">{summary?.recovery_rate || 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Mortality Rate</div>
          <div className="stat-value warning">{summary?.mortality_rate || 0}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Countries</div>
          <div className="stat-value">{summary?.countries_count || 0}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Trends Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Area type="monotone" dataKey="confirmed" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Confirmed" />
              <Area type="monotone" dataKey="deaths" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} name="Deaths" />
              <Area type="monotone" dataKey="recovered" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Recovered" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={breakdown}
                dataKey="total"
                nameKey="category_name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ category_name, percent }) => `${category_name} ${(percent * 100).toFixed(0)}%`}
              >
                {breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatNumber(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Top Countries by Cases</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary?.top_countries?.slice(0, 8) || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatNumber} />
              <YAxis type="category" dataKey="country" width={80} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="confirmed" fill="#3B82F6" name="Confirmed" />
              <Bar dataKey="deaths" fill="#EF4444" name="Deaths" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
