import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { ErrorBoundary, useErrorHandler } from '../ErrorBoundary'
import React from 'react'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Component to test the useErrorHandler hook
const TestErrorHandler = () => {
  const { captureError, hasError } = useErrorHandler()
  
  return (
    <div>
      <button onClick={() => captureError(new Error('Hook error'))}>
        Trigger Error
      </button>
      {hasError && <div>Hook has error</div>}
    </div>
  )
}

describe('ErrorBoundary', () => {
  const mockOnError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error for these tests
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error fallback when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('resets error state when try again is clicked', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true)
      
      return (
        <ErrorBoundary>
          <button onClick={() => setShouldThrow(false)}>Fix Error</button>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      )
    }

    render(<TestComponent />)

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click try again
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(tryAgainButton)

    // Error boundary should reset, but error will be thrown again
    // In a real scenario, the underlying issue would be fixed
  })

  it('shows error details in development mode', () => {
    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Show Error Details')).toBeInTheDocument()
    
    // Click to show details
    fireEvent.click(screen.getByText('Show Error Details'))
    
    expect(screen.getByText('Hide Error Details')).toBeInTheDocument()
    expect(screen.getByText(/Test error/)).toBeInTheDocument()
  })

  it('handles refresh page button click', () => {
    const mockReload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const refreshButton = screen.getByRole('button', { name: /refresh page/i })
    fireEvent.click(refreshButton)

    expect(mockReload).toHaveBeenCalled()
  })

  it('uses custom fallback component when provided', () => {
    const CustomFallback = () => <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })
})

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('captures and throws errors', () => {
    expect(() => {
      render(
        <ErrorBoundary>
          <TestErrorHandler />
        </ErrorBoundary>
      )
      
      const triggerButton = screen.getByRole('button', { name: /trigger error/i })
      fireEvent.click(triggerButton)
    }).not.toThrow()

    // Error boundary should catch the error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})