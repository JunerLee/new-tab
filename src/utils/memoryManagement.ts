interface MemoryStats {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  percentage: number
}

interface MemoryMonitorOptions {
  interval: number // in milliseconds
  warningThreshold: number // percentage (0-100)
  criticalThreshold: number // percentage (0-100)
  onWarning?: (stats: MemoryStats) => void
  onCritical?: (stats: MemoryStats) => void
  onLeak?: (stats: MemoryStats[]) => void
}

interface LeakDetectionOptions {
  sampleCount: number
  growthThreshold: number // MB
  consecutiveGrowthRequired: number
}

class MemoryMonitor {
  private intervalId: number | null = null
  private stats: MemoryStats[] = []
  private options: MemoryMonitorOptions
  private isSupported: boolean

  constructor(options: Partial<MemoryMonitorOptions> = {}) {
    this.options = {
      interval: 5000, // 5 seconds
      warningThreshold: 70,
      criticalThreshold: 90,
      ...options,
    }

    // Check if Performance API memory is supported
    this.isSupported = 'memory' in performance && 'usedJSHeapSize' in (performance as any).memory
  }

  start(): void {
    if (!this.isSupported) {
      console.warn('Memory monitoring not supported in this browser')
      return
    }

    if (this.intervalId) {
      this.stop()
    }

    this.intervalId = window.setInterval(() => {
      this.collectStats()
    }, this.options.interval)

    // Collect initial stats
    this.collectStats()
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  getStats(): MemoryStats[] {
    return [...this.stats]
  }

  getCurrentStats(): MemoryStats | null {
    if (!this.isSupported) return null

    const memory = (performance as any).memory
    const used = memory.usedJSHeapSize
    const total = memory.totalJSHeapSize
    const limit = memory.jsHeapSizeLimit

    return {
      usedJSHeapSize: used,
      totalJSHeapSize: total,
      jsHeapSizeLimit: limit,
      percentage: (used / limit) * 100,
    }
  }

  private collectStats(): void {
    const currentStats = this.getCurrentStats()
    if (!currentStats) return

    this.stats.push({
      ...currentStats,
      timestamp: Date.now(),
    } as MemoryStats & { timestamp: number })

    // Keep only last 100 samples
    if (this.stats.length > 100) {
      this.stats.shift()
    }

    // Check thresholds
    this.checkThresholds(currentStats)

    // Check for memory leaks
    this.checkForLeaks()
  }

  private checkThresholds(stats: MemoryStats): void {
    if (stats.percentage >= this.options.criticalThreshold) {
      this.options.onCritical?.(stats)
    } else if (stats.percentage >= this.options.warningThreshold) {
      this.options.onWarning?.(stats)
    }
  }

  private checkForLeaks(options: LeakDetectionOptions = {
    sampleCount: 10,
    growthThreshold: 5, // 5MB
    consecutiveGrowthRequired: 5
  }): void {
    if (this.stats.length < options.sampleCount) return

    const recentStats = this.stats.slice(-options.sampleCount)
    let consecutiveGrowth = 0
    let totalGrowth = 0

    for (let i = 1; i < recentStats.length; i++) {
      const current = recentStats[i].usedJSHeapSize
      const previous = recentStats[i - 1].usedJSHeapSize
      const growth = current - previous

      if (growth > 0) {
        consecutiveGrowth++
        totalGrowth += growth
      } else {
        consecutiveGrowth = 0
      }
    }

    const totalGrowthMB = totalGrowth / (1024 * 1024)

    if (
      consecutiveGrowth >= options.consecutiveGrowthRequired &&
      totalGrowthMB >= options.growthThreshold
    ) {
      this.options.onLeak?.(recentStats)
    }
  }
}

// Global memory monitor instance
let globalMemoryMonitor: MemoryMonitor | null = null

// Initialize memory monitoring with default options
export const initializeMemoryMonitoring = (options?: Partial<MemoryMonitorOptions>): void => {
  if (globalMemoryMonitor) {
    globalMemoryMonitor.stop()
  }

  globalMemoryMonitor = new MemoryMonitor({
    onWarning: (stats) => {
      console.warn('Memory usage warning:', {
        percentage: Math.round(stats.percentage),
        usedMB: Math.round(stats.usedJSHeapSize / (1024 * 1024)),
        totalMB: Math.round(stats.totalJSHeapSize / (1024 * 1024)),
      })
    },
    onCritical: (stats) => {
      console.error('Critical memory usage:', {
        percentage: Math.round(stats.percentage),
        usedMB: Math.round(stats.usedJSHeapSize / (1024 * 1024)),
        totalMB: Math.round(stats.totalJSHeapSize / (1024 * 1024)),
      })
      
      // Try to trigger garbage collection if available
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc()
      }
    },
    onLeak: (stats) => {
      console.error('Potential memory leak detected:', {
        samples: stats.length,
        firstUsage: Math.round(stats[0].usedJSHeapSize / (1024 * 1024)),
        lastUsage: Math.round(stats[stats.length - 1].usedJSHeapSize / (1024 * 1024)),
        growth: Math.round((stats[stats.length - 1].usedJSHeapSize - stats[0].usedJSHeapSize) / (1024 * 1024)),
      })
    },
    ...options,
  })

  globalMemoryMonitor.start()
}

// Stop memory monitoring
export const stopMemoryMonitoring = (): void => {
  globalMemoryMonitor?.stop()
  globalMemoryMonitor = null
}

// Get memory monitoring instance
export const getMemoryMonitor = (): MemoryMonitor | null => {
  return globalMemoryMonitor
}

// Utility functions for memory management

// Force garbage collection if available
export const forceGarbageCollection = (): boolean => {
  if ('gc' in window && typeof (window as any).gc === 'function') {
    (window as any).gc()
    return true
  }
  return false
}

// Clear caches and cleanup
export const performMemoryCleanup = (): void => {
  // Clear image cache if available
  if ('imageCacheManager' in window) {
    ;(window as any).imageCacheManager.clear()
  }

  // Clear any stored blob URLs
  const blobUrls = Array.from(document.querySelectorAll('img[src^="blob:"]'))
  blobUrls.forEach(img => {
    const src = (img as HTMLImageElement).src
    if (src.startsWith('blob:')) {
      URL.revokeObjectURL(src)
    }
  })

  // Clear storage caches
  try {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name)
        })
      })
    }
  } catch (error) {
    console.warn('Failed to clear caches:', error)
  }

  // Force garbage collection
  forceGarbageCollection()
}

// Memory usage reporter
export const getMemoryUsageReport = (): string => {
  const monitor = getMemoryMonitor()
  const stats = monitor?.getCurrentStats()

  if (!stats) {
    return 'Memory monitoring not available'
  }

  return `
Memory Usage Report:
- Used: ${Math.round(stats.usedJSHeapSize / (1024 * 1024))} MB
- Total: ${Math.round(stats.totalJSHeapSize / (1024 * 1024))} MB  
- Limit: ${Math.round(stats.jsHeapSizeLimit / (1024 * 1024))} MB
- Usage: ${Math.round(stats.percentage)}%
  `.trim()
}

// Hook for React components to monitor memory
export const useMemoryMonitoring = (options?: Partial<MemoryMonitorOptions>) => {
  React.useEffect(() => {
    initializeMemoryMonitoring(options)

    return () => {
      stopMemoryMonitoring()
    }
  }, [])

  const getCurrentStats = React.useCallback(() => {
    return globalMemoryMonitor?.getCurrentStats() || null
  }, [])

  const performCleanup = React.useCallback(() => {
    performMemoryCleanup()
  }, [])

  return {
    getCurrentStats,
    performCleanup,
    getReport: getMemoryUsageReport,
  }
}

// Cleanup utilities for specific resources

// Cleanup event listeners
export const createEventListenerCleanup = () => {
  const listeners: Array<{
    target: EventTarget
    type: string
    listener: EventListener
    options?: boolean | AddEventListenerOptions
  }> = []

  const addEventListener = (
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    target.addEventListener(type, listener, options)
    listeners.push({ target, type, listener, options })
  }

  const cleanup = () => {
    listeners.forEach(({ target, type, listener, options }) => {
      target.removeEventListener(type, listener, options)
    })
    listeners.length = 0
  }

  return { addEventListener, cleanup }
}

// Cleanup timers
export const createTimerCleanup = () => {
  const timers: number[] = []

  const setTimeout = (callback: () => void, delay: number): number => {
    const id = window.setTimeout(callback, delay)
    timers.push(id)
    return id
  }

  const setInterval = (callback: () => void, delay: number): number => {
    const id = window.setInterval(callback, delay)
    timers.push(id)
    return id
  }

  const cleanup = () => {
    timers.forEach(id => {
      window.clearTimeout(id)
      window.clearInterval(id)
    })
    timers.length = 0
  }

  return { setTimeout, setInterval, cleanup }
}

// Cleanup object URLs
export const createObjectURLCleanup = () => {
  const urls: string[] = []

  const createObjectURL = (object: Blob | MediaSource): string => {
    const url = URL.createObjectURL(object)
    urls.push(url)
    return url
  }

  const cleanup = () => {
    urls.forEach(url => {
      URL.revokeObjectURL(url)
    })
    urls.length = 0
  }

  return { createObjectURL, cleanup }
}

// All-in-one cleanup manager
export const createCleanupManager = () => {
  const eventCleanup = createEventListenerCleanup()
  const timerCleanup = createTimerCleanup()
  const urlCleanup = createObjectURLCleanup()

  return {
    addEventListener: eventCleanup.addEventListener,
    setTimeout: timerCleanup.setTimeout,
    setInterval: timerCleanup.setInterval,
    createObjectURL: urlCleanup.createObjectURL,
    cleanup: () => {
      eventCleanup.cleanup()
      timerCleanup.cleanup()
      urlCleanup.cleanup()
    },
  }
}

// Import React for the hook
import React from 'react'