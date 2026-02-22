import { useState, useEffect } from 'react'
import * as d3 from 'd3'
import api from '../utils/api'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (summary) {
      drawTrendsChart()
      drawBreakdownChart()
      drawCountryChart()
    }
  }, [summary, trends, breakdown])

  const fetchData = async () => {
    try {
      const [summaryRes, trendsRes, breakdownRes] = await Promise.all([
        api.get('/api/analytics/summary'),
        api.get('/api/analytics/trends?days=90'),
        api.get('/api/analytics/category-breakdown')
      ])
      setSummary(summaryRes.data)
      setTrends(trendsRes.data.trends)
      setBreakdown(breakdownRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const drawTrendsChart = () => {
    const container = d3.select('#trends-chart')
    container.selectAll('*').remove()
    
    if (!trends.length) return

    const margin = { top: 20, right: 30, bottom: 30, left: 60 }
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right
    const height = 260 - margin.top - margin.bottom

    const svg = container.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const parseDate = d3.timeParse('%Y-%m-%d')
    const data = trends.map(d => ({
      date: parseDate(d.date),
      confirmed: d.confirmed,
      deaths: d.deaths
    })).filter(d => d.date)

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width])

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.confirmed)])
      .range([height, 0])

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s')))

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.confirmed))
      .curve(d3.curveMonotoneX)

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)
      .attr('d', line)

    const deathsLine = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.deaths))
      .curve(d3.curveMonotoneX)

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 2)
      .attr('d', deathsLine)
  }

  const drawBreakdownChart = () => {
    const container = d3.select('#breakdown-chart')
    container.selectAll('*').remove()
    
    if (!breakdown.length) return

    const width = container.node().getBoundingClientRect().width
    const height = 260
    const radius = Math.min(width, height) / 2 - 20

    const svg = container.append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    const color = d3.scaleOrdinal()
      .domain(breakdown.map(d => d.category_name))
      .range(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'])

    const pie = d3.pie()
      .value(d => d.total)
      .sort(null)

    const arc = d3.arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius)

    const arcs = svg.selectAll('arc')
      .data(pie(breakdown))
      .enter()
      .append('g')

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.category_name))
      .attr('stroke', 'white')
      .style('stroke-width', 2)

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', 'white')
      .text(d => d.data.category_name.substring(0, 8))
  }

  const drawCountryChart = () => {
    const container = d3.select('#country-chart')
    container.selectAll('*').remove()
    
    if (!summary?.top_countries?.length) return

    const margin = { top: 20, right: 30, bottom: 60, left: 80 }
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right
    const height = 260 - margin.top - margin.bottom

    const svg = container.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const data = summary.top_countries.slice(0, 8)

    const x = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, width])
      .padding(0.3)

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.confirmed)])
      .range([height, 0])

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s')))

    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.country))
      .attr('y', d => y(d.confirmed))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.confirmed))
      .attr('fill', '#3B82F6')
      .attr('rx', 4)
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your data analytics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Entries</div>
          <div className="stat-value primary">{formatNumber(summary?.total_entries)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed Cases</div>
          <div className="stat-value danger">{formatNumber(summary?.total_confirmed)}</div>
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
          <div id="trends-chart" className="chart-container"></div>
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Category Breakdown</h3>
          <div id="breakdown-chart" className="chart-container"></div>
        </div>
        <div className="chart-card">
          <h3 className="chart-title">Top Countries by Cases</h3>
          <div id="country-chart" className="chart-container"></div>
        </div>
      </div>
    </div>
  )
}
