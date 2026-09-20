import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import api from '../utils/api'

vi.mock('../utils/api')

vi.mock('d3-selection', () => {
  function makeChain() {
    const fn = function (...args) { return fn }
    fn.node = function () { return { getBoundingClientRect: function () { return { width: 400 } } } }
    fn.selectAll = makeChain
    fn.remove = makeChain
    fn.append = makeChain
    fn.attr = makeChain
    fn.call = makeChain
    fn.datum = makeChain
    fn.data = makeChain
    fn.enter = makeChain
    fn.text = makeChain
    fn.style = makeChain
    fn.centroid = function () { return [0, 0] }
    fn.bandwidth = function () { return 50 }
    return fn
  }
  return { select: function () { return makeChain() } }
})

vi.mock('d3-scale', () => {
  function makeChain() {
    const fn = function (...args) { return fn }
    fn.domain = makeChain
    fn.range = makeChain
    fn.padding = makeChain
    fn.ticks = makeChain
    fn.tickFormat = makeChain
    fn.bandwidth = function () { return 50 }
    return fn
  }
  return { scaleTime: makeChain, scaleLinear: makeChain, scaleBand: makeChain, scaleOrdinal: makeChain }
})

vi.mock('d3-shape', () => {
  function makeChain() {
    const fn = function (...args) { return fn }
    fn.x = makeChain
    fn.y = makeChain
    fn.curve = makeChain
    fn.innerRadius = makeChain
    fn.outerRadius = makeChain
    fn.value = makeChain
    fn.sort = makeChain
    fn.centroid = function () { return [0, 0] }
    return fn
  }
  return { line: makeChain, arc: makeChain, pie: makeChain, curveMonotoneX: 'curve' }
})

vi.mock('d3-axis', () => {
  function makeChain() {
    const fn = function (...args) { return fn }
    fn.ticks = makeChain
    fn.tickFormat = makeChain
    return fn
  }
  return { axisBottom: makeChain, axisLeft: makeChain }
})

vi.mock('d3-time-format', () => ({
  timeParse: function () { return function (s) { return new Date(s) } }
}))

vi.mock('d3-format', () => ({
  format: function () { return function (v) { return v } }
}))

vi.mock('d3-array', () => ({
  extent: function () { return [new Date('2024-01-01'), new Date('2024-01-02')] },
  max: function () { return 1000 }
}))

import Dashboard from '../pages/Dashboard'

const mockSummary = {
  total_entries: 100,
  total_metric_a: 50000,
  total_metric_b: 1000,
  total_metric_c: 45000,
  mortality_rate: 2.0,
  recovery_rate: 90.0,
  groups_count: 10,
  top_groups: [{ group_name: 'USA', metric_a: 10000 }]
}

const mockTrends = [
  { date: '2024-01-01', confirmed: 100, metric_b: 5, metric_c: 90, active: 5 },
  { date: '2024-01-02', confirmed: 200, metric_b: 10, metric_c: 180, active: 10 }
]

const mockBreakdown = [
  { category_id: 1, category_name: 'COVID-19', color: '#EF4444', total: 50000, count: 80 }
]

describe('Dashboard', () => {
  const originalConsoleError = console.error
  beforeEach(() => {
    console.error = vi.fn()
  })
  afterEach(() => {
    console.error = originalConsoleError
  })

  it('shows loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {}))
    render(<MemoryRouter><Dashboard /></MemoryRouter>)
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument()
  })

  it('fetches data on mount', async () => {
    api.get.mockResolvedValueOnce({ data: mockSummary })
    api.get.mockResolvedValueOnce({ data: { trends: mockTrends } })
    api.get.mockResolvedValueOnce({ data: mockBreakdown })

    render(<MemoryRouter><Dashboard /></MemoryRouter>)

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled()
    })
    expect(api.get.mock.calls.length).toBeGreaterThanOrEqual(3)
  })

  it('renders stats cards after loading', async () => {
    api.get.mockResolvedValueOnce({ data: mockSummary })
    api.get.mockResolvedValueOnce({ data: { trends: mockTrends } })
    api.get.mockResolvedValueOnce({ data: mockBreakdown })

    render(<MemoryRouter><Dashboard /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('Total Entries')).toBeInTheDocument()
    })

    expect(screen.getByText('Metric A')).toBeInTheDocument()
    expect(screen.getByText('Metric B')).toBeInTheDocument()
    expect(screen.getByText('Recovery Rate')).toBeInTheDocument()
    expect(screen.getByText('Mortality Rate')).toBeInTheDocument()
    expect(screen.getByText('Countries')).toBeInTheDocument()
  })

  it('shows error state when API fails', async () => {
    api.get.mockRejectedValue(new Error('API Error'))

    render(<MemoryRouter><Dashboard /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })

    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('retry button is clickable and shows in error state', async () => {
    const user = userEvent.setup()
    api.get.mockRejectedValue(new Error('API Error'))

    render(<MemoryRouter><Dashboard /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument()
    })

    const retryBtn = screen.getByText('Retry')
    expect(retryBtn).toBeInTheDocument()
    expect(retryBtn.tagName).toBe('BUTTON')
  })

  it('formats numbers correctly', async () => {
    api.get.mockResolvedValueOnce({ data: { ...mockSummary, total_entries: 1500000 } })
    api.get.mockResolvedValueOnce({ data: { trends: [] } })
    api.get.mockResolvedValueOnce({ data: [] })

    render(<MemoryRouter><Dashboard /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('1.5M')).toBeInTheDocument()
    })
  })
})
