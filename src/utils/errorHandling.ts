export class AppError extends Error {
  public readonly code: string
  public readonly statusCode?: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode?: number,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed', statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode)
  }
}

export class StorageError extends AppError {
  constructor(message: string = 'Storage operation failed') {
    super(message, 'STORAGE_ERROR')
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR')
  }
}

export class PermissionError extends AppError {
  constructor(message: string = 'Permission denied') {
    super(message, 'PERMISSION_ERROR')
  }
}

// Error codes for common scenarios
export const ERROR_CODES = {
  // Network errors
  FETCH_FAILED: 'FETCH_FAILED',
  TIMEOUT: 'TIMEOUT',
  NO_INTERNET: 'NO_INTERNET',
  
  // Storage errors
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_ACCESS_DENIED: 'STORAGE_ACCESS_DENIED',
  
  // API errors
  API_KEY_INVALID: 'API_KEY_INVALID',
  API_RATE_LIMITED: 'API_RATE_LIMITED',
  API_SERVICE_UNAVAILABLE: 'API_SERVICE_UNAVAILABLE',
  
  // Chrome extension errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  EXTENSION_CONTEXT_INVALIDATED: 'EXTENSION_CONTEXT_INVALIDATED',
  
  // Sync errors
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  SYNC_SERVER_ERROR: 'SYNC_SERVER_ERROR',
  SYNC_AUTH_FAILED: 'SYNC_AUTH_FAILED',
} as const

// Error handling utilities
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await asyncFn()
  } catch (error) {
    console.error('Async operation failed:', error)
    if (fallback !== undefined) {
      return fallback
    }
    throw error
  }
}

export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw new AppError(
          `Operation failed after ${maxRetries} attempts: ${lastError.message}`,
          'MAX_RETRIES_EXCEEDED'
        )
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError!
}

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof NetworkError) return true
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout')
    )
  }
  return false
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

export const logError = (error: unknown, context?: string): void => {
  const errorMessage = getErrorMessage(error)
  const logData = {
    message: errorMessage,
    context,
    timestamp: new Date().toISOString(),
    stack: error instanceof Error ? error.stack : undefined,
    userAgent: navigator.userAgent,
    url: window.location.href,
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', logData)
  } else {
    // In production, you might want to send this to an error reporting service
    // Example: sendErrorToService(logData)
  }
}

// Chrome extension specific error handling
export const handleChromeApiError = (): AppError | null => {
  if (chrome.runtime.lastError) {
    const error = new AppError(
      chrome.runtime.lastError.message || 'Chrome API error',
      'CHROME_API_ERROR'
    )
    chrome.runtime.lastError = undefined // Clear the error
    return error
  }
  return null
}

// Wrap chrome API calls with error handling
export const chromeApiCall = async <T>(
  apiCall: () => Promise<T> | T
): Promise<T> => {
  try {
    const result = await apiCall()
    const error = handleChromeApiError()
    if (error) throw error
    return result
  } catch (error) {
    const chromeError = handleChromeApiError()
    throw chromeError || error
  }
}

// Storage error handling
export const handleStorageError = (error: unknown): AppError => {
  const message = getErrorMessage(error)
  
  if (message.includes('quota') || message.includes('storage')) {
    return new StorageError('Storage quota exceeded. Please free up some space.')
  }
  
  if (message.includes('access') || message.includes('permission')) {
    return new StorageError('Storage access denied. Please check permissions.')
  }
  
  return new StorageError(`Storage operation failed: ${message}`)
}

// Network error handling
export const handleNetworkError = (error: unknown): NetworkError => {
  const message = getErrorMessage(error)
  
  if (message.includes('timeout')) {
    return new NetworkError('Request timed out. Please check your connection.')
  }
  
  if (message.includes('404')) {
    return new NetworkError('Requested resource not found.', 404)
  }
  
  if (message.includes('403') || message.includes('401')) {
    return new NetworkError('Access denied. Please check your credentials.', 403)
  }
  
  if (message.includes('500')) {
    return new NetworkError('Server error. Please try again later.', 500)
  }
  
  return new NetworkError(`Network request failed: ${message}`)
}