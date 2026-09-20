import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: '"Barlow Condensed", system-ui, sans-serif' }}>
          <h2 style={{ color: '#332B1C', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Something went wrong</h2>
          <p style={{ color: '#332B1C80', marginTop: '0.5rem', fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px' }}>An unexpected error occurred.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#332B1C',
              color: '#F0E5C5',
              border: '1.5px solid #332B1C',
              borderRadius: 0,
              cursor: 'pointer',
              fontFamily: '"Barlow Condensed", system-ui, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontSize: '12px',
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
