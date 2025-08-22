import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showDetails?: boolean
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  resetError: () => void
  showDetails?: boolean
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  showDetails = false,
}) => {
  const [detailsOpen, setDetailsOpen] = React.useState(false)

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleReset = () => {
    resetError()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center"
      >
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={handleRefresh}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2',
              'bg-blue-600 hover:bg-blue-700 text-white rounded-md',
              'transition-colors duration-200'
            )}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Page
          </button>
          
          <button
            onClick={handleReset}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2',
              'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
              'text-gray-900 dark:text-gray-100 rounded-md',
              'transition-colors duration-200'
            )}
          >
            <Home className="w-4 h-4" />
            Try Again
          </button>
        </div>

        {showDetails && error && (
          <div className="text-left">
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-2"
            >
              {detailsOpen ? 'Hide' : 'Show'} Error Details
            </button>
            
            {detailsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gray-100 dark:bg-gray-900 rounded p-3 text-xs font-mono overflow-auto max-h-40"
              >
                <div className="text-red-600 dark:text-red-400 font-bold mb-2">
                  {error.name}: {error.message}
                </div>
                {error.stack && (
                  <div className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {error.stack}
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div className="mt-2 text-gray-600 dark:text-gray-400">
                    Component Stack:
                    <div className="whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          showDetails={this.props.showDetails}
        />
      )
    }

    return this.props.children
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return {
    captureError,
    resetError,
    hasError: !!error,
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`

  return WrappedComponent
}