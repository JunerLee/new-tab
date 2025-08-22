// Security utilities for the New Tab Extension

interface SecurityConfig {
  allowedDomains: string[]
  blockedDomains: string[]
  maxUrlLength: number
  allowedProtocols: string[]
  trustedImageSources: string[]
}

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  allowedDomains: [
    'www.bing.com',
    'api.openweathermap.org',
    'www.google.com',
    'duckduckgo.com',
    'github.com',
    'youtube.com',
  ],
  blockedDomains: [
    'malicious-site.com',
    // Add known malicious domains
  ],
  maxUrlLength: 2048,
  allowedProtocols: ['https:', 'http:'],
  trustedImageSources: [
    'www.bing.com',
    'api.openweathermap.org',
    'data:',
    'blob:',
  ],
}

// URL validation and sanitization
export const validateUrl = (url: string, config: SecurityConfig = DEFAULT_SECURITY_CONFIG): boolean => {
  try {
    // Check URL length
    if (url.length > config.maxUrlLength) {
      return false
    }

    const parsedUrl = new URL(url)

    // Check protocol
    if (!config.allowedProtocols.includes(parsedUrl.protocol)) {
      return false
    }

    // Check if domain is blocked
    if (config.blockedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      return false
    }

    // For external URLs, check if domain is allowed (if allowlist is not empty)
    if (config.allowedDomains.length > 0 && parsedUrl.protocol.startsWith('http')) {
      const isAllowed = config.allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
      )
      if (!isAllowed) {
        console.warn('URL not in allowlist:', url)
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Invalid URL:', url, error)
    return false
  }
}

// Sanitize URL for safe usage
export const sanitizeUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url)
    
    // Remove any dangerous parameters
    const dangerousParams = ['javascript:', 'data:', 'vbscript:']
    dangerousParams.forEach(param => {
      if (parsedUrl.href.toLowerCase().includes(param)) {
        throw new Error('Dangerous URL detected')
      }
    })

    // Normalize the URL
    return parsedUrl.href
  } catch (error) {
    console.error('Failed to sanitize URL:', url, error)
    return ''
  }
}

// Input sanitization
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') {
    return ''
  }

  return input
    .slice(0, maxLength) // Limit length
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .trim()
}

// HTML sanitization (basic)
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

// Validate image source
export const validateImageSource = (src: string, config: SecurityConfig = DEFAULT_SECURITY_CONFIG): boolean => {
  try {
    // Allow data URLs and blob URLs
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      return config.trustedImageSources.includes('data:') || config.trustedImageSources.includes('blob:')
    }

    const parsedUrl = new URL(src)
    
    // Check if domain is trusted for images
    return config.trustedImageSources.some(source => 
      parsedUrl.hostname === source || parsedUrl.hostname.endsWith('.' + source)
    )
  } catch (error) {
    console.error('Invalid image source:', src, error)
    return false
  }
}

// Content Security Policy helpers
export const createCSPHeader = (config: Partial<SecurityConfig> = {}): string => {
  const mergedConfig = { ...DEFAULT_SECURITY_CONFIG, ...config }
  
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self' 'unsafe-inline'", // Needed for CSS-in-JS
    `connect-src 'self' ${mergedConfig.allowedDomains.map(d => `https://${d}`).join(' ')} https:`,
    `img-src 'self' ${mergedConfig.trustedImageSources.map(s => s.includes(':') ? s : `https://${s}`).join(' ')}`,
    "font-src 'self' https://fonts.gstatic.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ]

  return directives.join('; ')
}

// Validate chrome extension permissions
export const validatePermissions = (permissions: string[]): boolean => {
  const allowedPermissions = [
    'storage',
    'topSites',
    'tabs',
    'favicon',
    'alarms',
  ]

  return permissions.every(permission => 
    allowedPermissions.includes(permission) || 
    permission.startsWith('https://') // Host permissions
  )
}

// Secure storage helpers
export const secureStorage = {
  // Encrypt sensitive data before storing (basic implementation)
  encryptData: (data: string, key: string): string => {
    // Simple XOR encryption (not cryptographically secure, just obfuscation)
    let encrypted = ''
    for (let i = 0; i < data.length; i++) {
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return btoa(encrypted)
  },

  // Decrypt data
  decryptData: (encryptedData: string, key: string): string => {
    try {
      const encrypted = atob(encryptedData)
      let decrypted = ''
      for (let i = 0; i < encrypted.length; i++) {
        decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length))
      }
      return decrypted
    } catch (error) {
      console.error('Failed to decrypt data:', error)
      return ''
    }
  },

  // Store sensitive data
  storeSensitive: async (key: string, data: any, encryptionKey: string): Promise<void> => {
    try {
      const serialized = JSON.stringify(data)
      const encrypted = secureStorage.encryptData(serialized, encryptionKey)
      await chrome.storage.local.set({ [key]: encrypted })
    } catch (error) {
      console.error('Failed to store sensitive data:', error)
      throw error
    }
  },

  // Retrieve sensitive data
  retrieveSensitive: async (key: string, encryptionKey: string): Promise<any> => {
    try {
      const result = await chrome.storage.local.get(key)
      if (!result[key]) return null

      const decrypted = secureStorage.decryptData(result[key], encryptionKey)
      return JSON.parse(decrypted)
    } catch (error) {
      console.error('Failed to retrieve sensitive data:', error)
      return null
    }
  },
}

// Rate limiting
class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }

  reset(identifier?: string): void {
    if (identifier) {
      this.requests.delete(identifier)
    } else {
      this.requests.clear()
    }
  }
}

// Global rate limiter instances
export const apiRateLimiter = new RateLimiter(50, 60000) // 50 requests per minute
export const imageRateLimiter = new RateLimiter(20, 60000) // 20 image requests per minute

// Security event logger
export const securityLogger = {
  logSecurityEvent: (event: string, details: any): void => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    }

    // In production, you might want to send this to a security monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.warn('Security Event:', logEntry)
    }

    // Store locally for analysis
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
    logs.push(logEntry)
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100)
    }
    
    localStorage.setItem('securityLogs', JSON.stringify(logs))
  },

  getSecurityLogs: (): any[] => {
    return JSON.parse(localStorage.getItem('securityLogs') || '[]')
  },

  clearSecurityLogs: (): void => {
    localStorage.removeItem('securityLogs')
  },
}

// Secure fetch wrapper
export const secureFetch = async (
  url: string,
  options: RequestInit = {},
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): Promise<Response> => {
  // Validate URL
  if (!validateUrl(url, config)) {
    securityLogger.logSecurityEvent('BLOCKED_REQUEST', { url, reason: 'Invalid URL' })
    throw new Error('Request blocked: Invalid URL')
  }

  // Check rate limiting
  const domain = new URL(url).hostname
  if (!apiRateLimiter.isAllowed(domain)) {
    securityLogger.logSecurityEvent('RATE_LIMITED', { url, domain })
    throw new Error('Request blocked: Rate limit exceeded')
  }

  // Add security headers
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      'X-Requested-With': 'Extension',
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, secureOptions)
    
    // Log successful requests
    securityLogger.logSecurityEvent('REQUEST_SUCCESS', { 
      url, 
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    return response
  } catch (error) {
    securityLogger.logSecurityEvent('REQUEST_FAILED', { url, error: error.message })
    throw error
  }
}

// Content validation
export const validateContent = (content: any): boolean => {
  try {
    // Check for dangerous patterns in content
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi, // Event handlers
    ]

    const contentString = JSON.stringify(content)
    
    return !dangerousPatterns.some(pattern => pattern.test(contentString))
  } catch (error) {
    console.error('Content validation failed:', error)
    return false
  }
}

// Privacy helpers
export const privacyManager = {
  // Remove tracking parameters from URLs
  cleanUrl: (url: string): string => {
    try {
      const parsedUrl = new URL(url)
      const trackingParams = [
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        'fbclid', 'gclid', 'ref', 'source', 'campaign'
      ]
      
      trackingParams.forEach(param => {
        parsedUrl.searchParams.delete(param)
      })
      
      return parsedUrl.href
    } catch (error) {
      return url
    }
  },

  // Generate privacy-safe user identifier
  generateSafeId: (): string => {
    const array = new Uint32Array(4)
    crypto.getRandomValues(array)
    return Array.from(array, dec => dec.toString(16)).join('')
  },

  // Check if content contains PII
  containsPII: (content: string): boolean => {
    const piiPatterns = [
      /\b\d{3}-?\d{2}-?\d{4}\b/g, // SSN
      /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}[- ]?\d{3}[- ]?\d{4}\b/g, // Phone number
    ]

    return piiPatterns.some(pattern => pattern.test(content))
  },
}

// Export security configuration
export { DEFAULT_SECURITY_CONFIG }

// Initialize security monitoring
export const initializeSecurity = (): void => {
  // Set up CSP violation reporting
  document.addEventListener('securitypolicyviolation', (e) => {
    securityLogger.logSecurityEvent('CSP_VIOLATION', {
      violatedDirective: e.violatedDirective,
      blockedURI: e.blockedURI,
      sourceFile: e.sourceFile,
      lineNumber: e.lineNumber,
    })
  })

  // Monitor for suspicious activity
  let clickCount = 0
  const suspiciousClickThreshold = 50
  
  document.addEventListener('click', () => {
    clickCount++
    if (clickCount > suspiciousClickThreshold) {
      securityLogger.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
        type: 'EXCESSIVE_CLICKS',
        count: clickCount,
      })
      clickCount = 0 // Reset counter
    }
  })

  console.log('Security monitoring initialized')
}