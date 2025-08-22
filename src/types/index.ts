/**
 * 搜索引擎接口
 */
export interface SearchEngine {
  id: string
  name: string
  url: string
  icon: string
  placeholder: string
  favicon?: string
}

/**
 * 快速启动项接口
 */
export interface QuickLaunchItem {
  id: string
  name: string
  url: string
  icon?: string
  favicon?: string
  category?: string
  order: number
  isCustom: boolean
}

/**
 * 背景设置接口
 */
export interface BackgroundSettings {
  type: 'bing' | 'solid' | 'gradient' | 'custom'
  bingEnabled: boolean
  customUrl?: string
  solidColor?: string
  gradientColors?: [string, string]
  blurAmount: number
  opacity: number
  changeInterval: number // 单位：小时
}

/**
 * 主题设置接口
 */
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto'
  autoSwitchTime?: {
    lightStart: string // HH:mm 格式
    darkStart: string
  }
}

/**
 * 同步设置接口
 */
export interface SyncSettings {
  enabled: boolean
  provider: 'webdav' | 'local'
  webdav?: {
    url: string
    username: string
    password: string
  }
  lastSync?: number
}

/**
 * 应用设置接口
 */
export interface AppSettings {
  language: string
  theme: ThemeSettings
  background: BackgroundSettings
  sync: SyncSettings
  searchEngine: string
  showWeather: boolean
  showTime: boolean
  timeFormat: '12h' | '24h'
  shortcuts: {
    search: string
    settings: string
  }
}

/**
 * 天气数据接口
 */
export interface WeatherData {
  location: string
  temperature: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  lastUpdated: number
}

/**
 * Bing 图像接口
 */
export interface BingImage {
  url: string
  title: string
  copyright: string
  date: string
  downloadUrl: string
}

/**
 * 存储数据接口
 */
export interface StorageData {
  settings: AppSettings
  quickLaunch: QuickLaunchItem[]
  customSearchEngines: SearchEngine[]
  bingImages: BingImage[]
  weather?: WeatherData
}

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark'

/**
 * 位置接口
 */
export interface Position {
  x: number
  y: number
}

/**
 * 拖拽项接口
 */
export interface DragItem {
  id: string
  type: string
}

// 重新导出同步类型
export * from './sync'