import { type ClassValue, clsx } from 'clsx'
import { BingImage } from '@/types'
import { BING_API_BASE, FAVICON_API } from './constants'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatTime(date: Date, format: '12h' | '24h' = '24h', locale: string = 'zh-CN'): string {
  if (format === '12h') {
    return date.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function formatDate(date: Date, locale: string = 'zh-CN'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

export function getFaviconUrl(domain: string): string {
  return `${FAVICON_API}${domain}&sz=32`
}

export async function fetchBingImages(count: number = 8): Promise<BingImage[]> {
  try {
    const images: BingImage[] = []
    
    for (let i = 0; i < count; i++) {
      const response = await fetch(
        `${BING_API_BASE}?format=js&idx=${i}&n=1&mkt=en-US`
      )
      
      if (!response.ok) continue
      
      const data = await response.json()
      if (data.images && data.images.length > 0) {
        const image = data.images[0]
        images.push({
          url: `https://www.bing.com${image.url}`,
          title: image.title,
          copyright: image.copyright,
          date: image.enddate,
          downloadUrl: `https://www.bing.com${image.urlbase}&rf=LaDigue_1920x1080.jpg&pid=hp`
        })
      }
    }
    
    return images
  } catch (error) {
    console.error('Failed to fetch Bing images:', error)
    return []
  }
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function getTimeBasedTheme(): 'light' | 'dark' {
  const hour = new Date().getHours()
  return hour >= 6 && hour < 18 ? 'light' : 'dark'
}

export function exportToJson(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function importFromJson<T>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function getRandomItem<T>(array: T[]): T | null {
  if (array.length === 0) return null
  return array[Math.floor(Math.random() * array.length)]
}

export function createSearchUrl(engine: string, query: string): string {
  const engines = {
    google: 'https://www.google.com/search?q=',
    bing: 'https://www.bing.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    baidu: 'https://www.baidu.com/s?wd='
  }
  
  const baseUrl = engines[engine as keyof typeof engines] || engines.google
  return baseUrl + encodeURIComponent(query)
}