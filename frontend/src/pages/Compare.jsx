import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'
import api from '../utils/api'

export default function Compare() {
  const [countries, setCountries] = useState([])
  const [selected, setSelected] = useState([])
  const [trends, setTrends] = useState({})
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState(30)

  useEffect(() => {
    fetchCountries()
  }, [])

  useEffect(() => {
    if (selected.length > 0) {
      fetchTrends()
    }
  }, [selected, dateRange])

  const fetchCountries = async () => {
    try {
      const response = await api.get('/analytics/summary')
      const countryList = response.data.top_countries?.map(c => c.country) || []
      setCountries(countryList)
    } catch (error) {
      console.error('Error fetching countries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrends = async () => {
    try {
      const results = await Promise.all(
        selected.map(country =>
          api.get(`/analytics/trends?days=${dateRange}&country=${country}`)
            .then(res => ({ country, trends: res.data.trends }))
        )
      )

      const merged = {}
      results.forEach(({ country, trends: t }) => {
        t.forEach(point => {
          if (!merged[point.date]) {
            merged[point.date] = { date: point.date }
          }
          merged[point.date][country] = point.confirmed
        })
      })

      setTrends(merged)
    } catch (error) {
      console.error('Error fetching trends:', error)
    }
  }

  const toggleCountry = (country) => {
    setSelected(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : prev.length < 4 ? [...prev, country] : prev
    )
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Compare</h1>
        <p className="page-subtitle">Compare trends across countries (max 4)</p>
      </div>

      <div className="compare-controls">
        <div className="country-selector">
          {countries.map(country => (
            <button
              key={country}
              className={`btn btn-sm ${selected.includes(country) ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => toggleCountry(country)}
              disabled={!selected.includes(country) && selected.length >= 4}
            >
              {country}
            </button>
          ))}
        </div>
        <div className="date-range-selector">
          {[7, 30, 90].map(days => (
            <button
              key={days}
              className={`btn btn-sm ${dateRange === days ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDateRange(days)}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 ? (
        <div className="chart-card">
          <h3 className="chart-title">
            Comparing: {selected.join(', ')}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={Object.values(trends)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              {selected.map((country, index) => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  name={country}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="empty-state">
          <h3>Select countries to compare</h3>
          <p>Click up to 4 countries above to see their trends overlaid</p>
        </div>
      )}
    </div>
  )
}
