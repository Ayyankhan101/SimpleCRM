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
        <div className="min-h-[100dvh] flex items-center justify-center bg-glassfin-neutral dark:bg-[#0a1a15] p-8">
          <div className="glass p-12 text-center max-w-md">
            <h2 className="text-lg font-display font-semibold text-glassfin-secondary dark:text-glassfin-neutral tracking-wide uppercase mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-glassfin-secondary/50 dark:text-glassfin-neutral/50 font-mono mb-6">
              An unexpected error occurred.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-5 py-2.5 text-xs font-medium font-display bg-glassfin-secondary text-glassfin-neutral hover:opacity-90 dark:bg-glassfin-neutral dark:text-glassfin-secondary transition-all duration-200 rounded-full uppercase tracking-wide"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
