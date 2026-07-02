import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../components/ErrorBoundary'

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('shows fallback UI when child throws', () => {
    const ThrowingChild = () => {
      throw new Error('Test error')
    }
    
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
  })

  it('shows Try again button', () => {
    const ThrowingChild = () => {
      throw new Error('Test error')
    }
    
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })
})
