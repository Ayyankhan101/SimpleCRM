import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'
import api from '../utils/api'

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
      const [contactsRes, dealsRes, activitiesRes] = await Promise.all([
        api.get('/contacts'),
        api.get('/deals'),
        api.get('/activities')
      ])

      const contacts = contactsRes.data.items || []
      const deals = dealsRes.data.items || []
      const activities = activitiesRes.data.items || []

      setStats({
        contacts: contactsRes.data.total || 0,
        deals: dealsRes.data.total || 0,
        activities: activitiesRes.data.total || 0
      })

      // Build pipeline data from deals
      const stageCounts = {}
      deals.forEach(deal => {
        stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1
      })
      setPipeline(Object.entries(stageCounts).map(([stage, count]) => ({ stage, count })))

      // Get upcoming activities
      setUpcomingActivities(
        activities
          .filter(a => !a.completed && a.due_date)
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
          .slice(0, 5)
      )
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  const formatStage = (stage) => stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Welcome back to SimpleCRM</p>
      </div>

      <div className="stats-grid">
        <Link to="/contacts" className="stat-card">
          <div className="stat-label">Total Contacts</div>
          <div className="stat-value primary">{stats.contacts}</div>
        </Link>
        <Link to="/deals" className="stat-card">
          <div className="stat-label">Total Deals</div>
          <div className="stat-value success">{stats.deals}</div>
        </Link>
        <Link to="/activities" className="stat-card">
          <div className="stat-label">Total Activities</div>
          <div className="stat-value warning">{stats.activities}</div>
        </Link>
      </div>

      <div className="charts-grid">
        {pipeline.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Deal Pipeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" tickFormatter={formatStage} />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Deals']} labelFormatter={formatStage} />
                <Bar dataKey="count" fill="#3B82F6" name="Deals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-card">
          <h3 className="chart-title">Upcoming Activities</h3>
          {upcomingActivities.length === 0 ? (
            <p className="empty-state">No upcoming activities</p>
          ) : (
            <div className="activities-list">
              {upcomingActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-type">{activity.type}</div>
                  <div className="activity-subject">{activity.subject}</div>
                  <div className="activity-date">
                    {new Date(activity.due_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
