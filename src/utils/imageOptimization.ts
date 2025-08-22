import React from 'react'
import { handleNetworkError, NetworkError } from './errorHandling'

interface ImageCacheEntry {
  url: string
  blob: Blob
  timestamp: number
  size: number
}

interface ImageOptimizationOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  format?: 'webp' | 'jpeg' | 'png'
  enableCache?: boolean
  cacheMaxAge?: number // in milliseconds
  cacheMaxSize?: number // in bytes
}

class ImageCache {
  private cache = new Map<string, ImageCacheEntry>()
  private totalSize = 0
  private readonly maxSize: number
  private readonly maxAge: number

  constructor(maxSize = 50 * 1024 * 1024, maxAge = 24 * 60 * 60 * 1000) { // 50MB, 24 hours
    this.maxSize = maxSize
    this.maxAge = maxAge
  }

  private cleanup(): void {
    const now = Date.now()
    const entries = Array.from(this.cache.entries())
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.maxAge) {
        this.delete(key)
      }
    })

    // Remove oldest entries if cache is too large
    while (this.totalSize > this.maxSize && this.cache.size > 0) {
      const oldestEntry = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
      
      if (oldestEntry) {
        this.delete(oldestEntry[0])
      }
    }
  }

  set(url: string, blob: Blob): void {
    this.cleanup()
    
    if (blob.size > this.maxSize / 10) {
      return // Don't cache very large images
    }

    const entry: ImageCacheEntry = {
      url,
      blob,
      timestamp: Date.now(),
      size: blob.size,
    }

    // Remove existing entry if it exists
    if (this.cache.has(url)) {
      this.delete(url)
    }

    this.cache.set(url, entry)
    this.totalSize += blob.size
  }

  get(url: string): Blob | null {
    const entry = this.cache.get(url)
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.delete(url)
      return null
    }

    return entry.blob
  }

  delete(url: string): boolean {
    const entry = this.cache.get(url)
    if (entry) {
      this.totalSize -= entry.size
      return this.cache.delete(url)
    }
    return false
  }

  clear(): void {
    this.cache.clear()
    this.totalSize = 0
  }

  getStats() {
    return {
      totalSize: this.totalSize,
      entryCount: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
    }
  }
}

// Global image cache instance
const imageCache = new ImageCache()

// Image loading with retry logic
export const loadImageWithRetry = async (
  url: string,
  maxRetries = 3,
  delay = 1000
): Promise<HTMLImageElement> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        
        const cleanup = () => {
          img.onload = null
          img.onerror = null
        }

        img.onload = () => {
          cleanup()
          resolve(img)
        }

        img.onerror = () => {
          cleanup()
          reject(new NetworkError(`Failed to load image: ${url}`))
        }

        // Set crossorigin if needed
        if (url.startsWith('http') && !url.startsWith(window.location.origin)) {
          img.crossOrigin = 'anonymous'
        }

        img.src = url
      })
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw handleNetworkError(lastError)
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError!
}

// Optimize image using canvas
export const optimizeImage = async (
  imageUrl: string,
  options: ImageOptimizationOptions = {}
): Promise<Blob> => {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp',
    enableCache = true,
  } = options

  // Check cache first
  if (enableCache) {
    const cacheKey = `${imageUrl}_${quality}_${maxWidth}_${maxHeight}_${format}`
    const cached = imageCache.get(cacheKey)
    if (cached) {
      return cached
    }
  }

  try {
    // Load the image
    const img = await loadImageWithRetry(imageUrl)

    // Calculate new dimensions
    let { width, height } = img
    const aspectRatio = width / height

    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }

    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }

    // Create canvas and draw optimized image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    canvas.width = width
    canvas.height = height

    // Set image smoothing for better quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Draw the image
    ctx.drawImage(img, 0, 0, width, height)

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        `image/${format}`,
        quality
      )
    })

    // Cache the optimized image
    if (enableCache) {
      const cacheKey = `${imageUrl}_${quality}_${maxWidth}_${maxHeight}_${format}`
      imageCache.set(cacheKey, blob)
    }

    return blob
  } catch (error) {
    throw handleNetworkError(error)
  }
}

// Create optimized image URL
export const createOptimizedImageUrl = async (
  imageUrl: string,
  options?: ImageOptimizationOptions
): Promise<string> => {
  try {
    const blob = await optimizeImage(imageUrl, options)
    return URL.createObjectURL(blob)
  } catch (error) {
    console.warn('Image optimization failed, using original:', error)
    return imageUrl
  }
}

// Preload images for better UX
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => 
    loadImageWithRetry(url).catch(error => {
      console.warn(`Failed to preload image: ${url}`, error)
      return null
    })
  )

  await Promise.allSettled(promises)
}

// Progressive image loading hook
export const useProgressiveImage = (
  src: string,
  options?: ImageOptimizationOptions
) => {
  const [imageSrc, setImageSrc] = React.useState<string>('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let isCancelled = false
    setIsLoading(true)
    setError(null)

    const loadImage = async () => {
      try {
        const optimizedUrl = await createOptimizedImageUrl(src, options)
        
        if (!isCancelled) {
          setImageSrc(optimizedUrl)
          setIsLoading(false)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err as Error)
          setImageSrc(src) // Fallback to original
          setIsLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      isCancelled = true
      // Clean up object URL if it was created
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc)
      }
    }
  }, [src])

  return { imageSrc, isLoading, error }
}

// Utility to convert image to different formats
export const convertImageFormat = async (
  imageUrl: string,
  targetFormat: 'webp' | 'jpeg' | 'png',
  quality = 0.8
): Promise<Blob> => {
  const img = await loadImageWithRetry(imageUrl)
  
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert image format'))
        }
      },
      `image/${targetFormat}`,
      quality
    )
  })
}

// Check if WebP is supported
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').startsWith('data:image/webp')
}

// Get optimal image format based on browser support
export const getOptimalImageFormat = (): 'webp' | 'jpeg' => {
  return supportsWebP() ? 'webp' : 'jpeg'
}

// Export cache management
export const imageCacheManager = {
  clear: () => imageCache.clear(),
  getStats: () => imageCache.getStats(),
  delete: (url: string) => imageCache.delete(url),
}