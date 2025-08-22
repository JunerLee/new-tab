import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  AppError,
  NetworkError,
  StorageError,
  ValidationError,
  PermissionError,
  handleAsyncError,
  withRetry,
  isNetworkError,
  getErrorMessage,
  logError,
  handleChromeApiError,
  chromeApiCall,
  handleStorageError,
  handleNetworkError
} from '../errorHandling'

describe('Error Classes', () => {
  it('creates AppError with correct properties', () => {
    const error = new AppError('Test message', 'TEST_CODE', 400, true)
    
    expect(error.message).toBe('Test message')
    expect(error.code).toBe('TEST_CODE')
    expect(error.statusCode).toBe(400)
    expect(error.isOperational).toBe(true)
    expect(error.name).toBe('AppError')
  })

  it('creates AppError with default values', () => {
    const error = new AppError('Test message')
    
    expect(error.code).toBe('UNKNOWN_ERROR')
    expect(error.statusCode).toBeUndefined()
    expect(error.isOperational).toBe(true)
  })

  it('creates NetworkError', () => {
    const error = new NetworkError('Network failed', 500)
    
    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe('NETWORK_ERROR')
    expect(error.statusCode).toBe(500)
  })

  it('creates StorageError', () => {
    const error = new StorageError('Storage failed')
    
    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe('STORAGE_ERROR')
  })

  it('creates ValidationError', () => {
    const error = new ValidationError('Validation failed')
    
    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe('VALIDATION_ERROR')
  })

  it('creates PermissionError', () => {
    const error = new PermissionError('Permission denied')
    
    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe('PERMISSION_ERROR')
  })
})

describe('handleAsyncError', () => {
  it('returns result when async function succeeds', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success')
    
    const result = await handleAsyncError(asyncFn)
    
    expect(result).toBe('success')
    expect(asyncFn).toHaveBeenCalled()
  })

  it('returns fallback when async function fails', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('Failed'))
    
    const result = await handleAsyncError(asyncFn, 'fallback')
    
    expect(result).toBe('fallback')
  })

  it('throws error when no fallback is provided', async () => {
    const asyncFn = vi.fn().mockRejectedValue(new Error('Failed'))
    
    await expect(handleAsyncError(asyncFn)).rejects.toThrow('Failed')
  })
})

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    
    const result = await withRetry(fn, 3, 1000)
    
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries on failure and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success')
    
    const promise = withRetry(fn, 3, 1000)
    
    // Fast-forward through retry delays
    await vi.runAllTimersAsync()
    
    const result = await promise
    
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('throws AppError after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Always fails'))
    
    const promise = withRetry(fn, 2, 1000)
    
    await vi.runAllTimersAsync()
    
    await expect(promise).rejects.toThrow(AppError)
    await expect(promise).rejects.toThrow('Operation failed after 2 attempts')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

describe('isNetworkError', () => {
  it('returns true for NetworkError', () => {
    const error = new NetworkError('Network failed')
    expect(isNetworkError(error)).toBe(true)
  })

  it('returns true for errors with network-related messages', () => {
    expect(isNetworkError(new Error('Network request failed'))).toBe(true)
    expect(isNetworkError(new Error('Fetch error'))).toBe(true)
    expect(isNetworkError(new Error('Connection timeout'))).toBe(true)
  })

  it('returns false for non-network errors', () => {
    expect(isNetworkError(new Error('Generic error'))).toBe(false)
    expect(isNetworkError('String error')).toBe(false)
    expect(isNetworkError(null)).toBe(false)
  })
})

describe('getErrorMessage', () => {
  it('returns message from AppError', () => {
    const error = new AppError('App error message')
    expect(getErrorMessage(error)).toBe('App error message')
  })

  it('returns message from Error', () => {
    const error = new Error('Standard error message')
    expect(getErrorMessage(error)).toBe('Standard error message')
  })

  it('returns string as-is', () => {
    expect(getErrorMessage('String error')).toBe('String error')
  })

  it('returns default message for unknown error types', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred')
    expect(getErrorMessage({})).toBe('An unexpected error occurred')
  })
})

describe('logError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs error in development mode', () => {
    process.env.NODE_ENV = 'development'
    
    const error = new Error('Test error')
    logError(error, 'Test context')
    
    expect(console.error).toHaveBeenCalledWith(
      'Error logged:',
      expect.objectContaining({
        message: 'Test error',
        context: 'Test context',
        timestamp: expect.any(String),
        stack: expect.any(String),
        userAgent: expect.any(String),
        url: expect.any(String)
      })
    )
  })
})

describe('Chrome API Error Handling', () => {
  beforeEach(() => {
    // Mock chrome runtime
    global.chrome = {
      runtime: {
        lastError: undefined
      }
    } as any
  })

  it('returns null when no chrome error', () => {
    const error = handleChromeApiError()
    expect(error).toBeNull()
  })

  it('returns AppError when chrome error exists', () => {
    global.chrome.runtime.lastError = { message: 'Chrome API error' }
    
    const error = handleChromeApiError()
    
    expect(error).toBeInstanceOf(AppError)
    expect(error?.message).toBe('Chrome API error')
    expect(error?.code).toBe('CHROME_API_ERROR')
    expect(global.chrome.runtime.lastError).toBeUndefined()
  })

  it('chromeApiCall handles successful API calls', async () => {
    const apiCall = vi.fn().mockResolvedValue('success')
    
    const result = await chromeApiCall(apiCall)
    
    expect(result).toBe('success')
  })

  it('chromeApiCall handles chrome API errors', async () => {
    global.chrome.runtime.lastError = { message: 'API error' }
    const apiCall = vi.fn().mockResolvedValue('success')
    
    await expect(chromeApiCall(apiCall)).rejects.toThrow(AppError)
  })
})

describe('Storage Error Handling', () => {
  it('handles quota errors', () => {
    const error = handleStorageError(new Error('Storage quota exceeded'))
    
    expect(error).toBeInstanceOf(StorageError)
    expect(error.message).toContain('Storage quota exceeded')
  })

  it('handles access errors', () => {
    const error = handleStorageError(new Error('Access denied'))
    
    expect(error).toBeInstanceOf(StorageError)
    expect(error.message).toContain('Storage access denied')
  })

  it('handles generic storage errors', () => {
    const error = handleStorageError(new Error('Generic storage error'))
    
    expect(error).toBeInstanceOf(StorageError)
    expect(error.message).toContain('Storage operation failed')
  })
})

describe('Network Error Handling', () => {
  it('handles timeout errors', () => {
    const error = handleNetworkError(new Error('Request timeout'))
    
    expect(error).toBeInstanceOf(NetworkError)
    expect(error.message).toContain('Request timed out')
  })

  it('handles 404 errors', () => {
    const error = handleNetworkError(new Error('404 not found'))
    
    expect(error).toBeInstanceOf(NetworkError)
    expect(error.message).toContain('Requested resource not found')
    expect(error.statusCode).toBe(404)
  })

  it('handles 403 errors', () => {
    const error = handleNetworkError(new Error('403 forbidden'))
    
    expect(error).toBeInstanceOf(NetworkError)
    expect(error.message).toContain('Access denied')
    expect(error.statusCode).toBe(403)
  })

  it('handles 500 errors', () => {
    const error = handleNetworkError(new Error('500 server error'))
    
    expect(error).toBeInstanceOf(NetworkError)
    expect(error.message).toContain('Server error')
    expect(error.statusCode).toBe(500)
  })

  it('handles generic network errors', () => {
    const error = handleNetworkError(new Error('Generic network error'))
    
    expect(error).toBeInstanceOf(NetworkError)
    expect(error.message).toContain('Network request failed')
  })
})