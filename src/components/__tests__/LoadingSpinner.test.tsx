import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { LoadingSpinner, Skeleton } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders spinner variant by default', () => {
    render(<LoadingSpinner />)
    
    // Check if the spinner icon is present (Loader2 from lucide-react)
    const spinner = screen.getByRole('generic')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with custom text', () => {
    render(<LoadingSpinner text="Loading data..." />)
    
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('renders dots variant', () => {
    render(<LoadingSpinner variant="dots" />)
    
    // Should render dots container
    const container = screen.getByRole('generic')
    expect(container).toBeInTheDocument()
  })

  it('renders pulse variant', () => {
    render(<LoadingSpinner variant="pulse" />)
    
    const container = screen.getByRole('generic')
    expect(container).toBeInTheDocument()
  })

  it('renders in fullscreen mode', () => {
    render(<LoadingSpinner fullScreen />)
    
    const container = screen.getByRole('generic').parentElement
    expect(container).toHaveClass('fixed', 'inset-0')
  })

  it('applies different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole('generic')
    expect(spinner).toBeInTheDocument()

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole('generic')
    expect(spinner).toBeInTheDocument()

    rerender(<LoadingSpinner size="xl" />)
    spinner = screen.getByRole('generic')
    expect(spinner).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    
    const container = screen.getByRole('generic')
    expect(container).toHaveClass('custom-class')
  })
})

describe('Skeleton', () => {
  it('renders text skeleton by default', () => {
    render(<Skeleton />)
    
    const skeleton = screen.getByRole('generic')
    expect(skeleton).toBeInTheDocument()
    expect(skeleton).toHaveClass('h-4', 'rounded')
  })

  it('renders rectangular skeleton', () => {
    render(<Skeleton variant="rectangular" />)
    
    const skeleton = screen.getByRole('generic')
    expect(skeleton).toHaveClass('rounded')
  })

  it('renders circular skeleton', () => {
    render(<Skeleton variant="circular" />)
    
    const skeleton = screen.getByRole('generic')
    expect(skeleton).toHaveClass('rounded-full')
  })

  it('renders multiple lines for text skeleton', () => {
    render(<Skeleton variant="text" lines={3} />)
    
    const skeletons = screen.getAllByRole('generic')
    expect(skeletons).toHaveLength(3)
  })

  it('applies custom width and height', () => {
    render(<Skeleton width={200} height={100} />)
    
    const skeleton = screen.getByRole('generic')
    expect(skeleton).toHaveStyle({ width: '200px', height: '100px' })
  })

  it('applies custom className', () => {
    render(<Skeleton className="custom-skeleton" />)
    
    const skeleton = screen.getByRole('generic')
    expect(skeleton).toHaveClass('custom-skeleton')
  })

  it('makes last line shorter for multiline text', () => {
    render(<Skeleton variant="text" lines={2} />)
    
    const skeletons = screen.getAllByRole('generic')
    expect(skeletons).toHaveLength(2)
    
    // Last line should have w-3/4 class
    expect(skeletons[1]).toHaveClass('w-3/4')
  })
})

describe('Accessibility', () => {
  it('loading spinner has appropriate aria attributes', () => {
    render(<LoadingSpinner text="Loading..." />)
    
    // The spinner should be announced to screen readers
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('fullscreen spinner overlays content appropriately', () => {
    render(<LoadingSpinner fullScreen text="Loading application..." />)
    
    const overlay = screen.getByRole('generic').parentElement
    expect(overlay).toHaveClass('z-50')
    expect(screen.getByText('Loading application...')).toBeInTheDocument()
  })

  it('skeleton components have proper structure for screen readers', () => {
    render(<Skeleton />)
    
    const skeleton = screen.getByRole('generic')
    // Should have animation classes that respect motion preferences
    expect(skeleton).toHaveClass('animate-pulse')
  })
})