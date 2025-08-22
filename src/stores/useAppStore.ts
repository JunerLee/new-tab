import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings, QuickLaunchItem, SearchEngine, BingImage, WeatherData, Theme } from '@/types'
import { DEFAULT_SETTINGS, DEFAULT_QUICK_LAUNCH, DEFAULT_SEARCH_ENGINES, STORAGE_KEYS } from '@/utils/constants'

interface AppState {
  // 设置
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void
  
  // 主题
  theme: Theme
  setTheme: (theme: Theme) => void
  
  // 快速启动
  quickLaunch: QuickLaunchItem[]
  addQuickLaunchItem: (item: Omit<QuickLaunchItem, 'id' | 'order'>) => void
  updateQuickLaunchItem: (id: string, updates: Partial<QuickLaunchItem>) => void
  removeQuickLaunchItem: (id: string) => void
  reorderQuickLaunch: (items: QuickLaunchItem[]) => void
  
  // 搜索引擎
  searchEngines: SearchEngine[]
  customSearchEngines: SearchEngine[]
  addCustomSearchEngine: (engine: Omit<SearchEngine, 'id'>) => void
  updateCustomSearchEngine: (id: string, updates: Partial<SearchEngine>) => void
  removeCustomSearchEngine: (id: string) => void
  
  // 背景
  bingImages: BingImage[]
  currentBingImage: BingImage | null
  setBingImages: (images: BingImage[]) => void
  setCurrentBingImage: (image: BingImage) => void
  
  // 天气
  weather: WeatherData | null
  setWeather: (weather: WeatherData) => void
  
  // UI 状态
  isSettingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  searchFocused: boolean
  setSearchFocused: (focused: boolean) => void
  
  // 操作方法
  resetToDefaults: () => void
  exportData: () => string
  importData: (data: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      settings: DEFAULT_SETTINGS,
      theme: 'light',
      quickLaunch: DEFAULT_QUICK_LAUNCH,
      searchEngines: DEFAULT_SEARCH_ENGINES,
      customSearchEngines: [],
      bingImages: [],
      currentBingImage: null,
      weather: null,
      isSettingsOpen: false,
      searchFocused: false,

      // 设置操作
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      // 主题操作
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.toggle('dark', theme === 'dark')
      },

      // 快速启动操作
      addQuickLaunchItem: (item) => {
        set((state) => {
          const newItem: QuickLaunchItem = {
            ...item,
            id: `custom_${Date.now()}`,
            order: state.quickLaunch.length,
            isCustom: true
          }
          return {
            quickLaunch: [...state.quickLaunch, newItem]
          }
        })
      },

      updateQuickLaunchItem: (id, updates) => {
        set((state) => ({
          quickLaunch: state.quickLaunch.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        }))
      },

      removeQuickLaunchItem: (id) => {
        set((state) => ({
          quickLaunch: state.quickLaunch.filter((item) => item.id !== id)
        }))
      },

      reorderQuickLaunch: (items) => {
        set({ quickLaunch: items.map((item, index) => ({ ...item, order: index })) })
      },

      // 搜索引擎操作
      addCustomSearchEngine: (engine) => {
        set((state) => {
          const newEngine: SearchEngine = {
            ...engine,
            id: `custom_${Date.now()}`
          }
          return {
            customSearchEngines: [...state.customSearchEngines, newEngine]
          }
        })
      },

      updateCustomSearchEngine: (id, updates) => {
        set((state) => ({
          customSearchEngines: state.customSearchEngines.map((engine) =>
            engine.id === id ? { ...engine, ...updates } : engine
          )
        }))
      },

      removeCustomSearchEngine: (id) => {
        set((state) => ({
          customSearchEngines: state.customSearchEngines.filter((engine) => engine.id !== id)
        }))
      },

      // 背景操作
      setBingImages: (images) => {
        set({ bingImages: images })
      },

      setCurrentBingImage: (image) => {
        set({ currentBingImage: image })
      },

      // 天气操作
      setWeather: (weather) => {
        set({ weather })
      },

      // UI 操作
      setSettingsOpen: (open) => {
        set({ isSettingsOpen: open })
      },

      setSearchFocused: (focused) => {
        set({ searchFocused: focused })
      },

      // 工具操作
      resetToDefaults: () => {
        set({
          settings: DEFAULT_SETTINGS,
          quickLaunch: DEFAULT_QUICK_LAUNCH,
          customSearchEngines: [],
          bingImages: [],
          currentBingImage: null,
          weather: null
        })
      },

      exportData: () => {
        const { settings, quickLaunch, customSearchEngines } = get()
        return JSON.stringify({
          settings,
          quickLaunch,
          customSearchEngines,
          exportDate: new Date().toISOString()
        }, null, 2)
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data)
          set({
            settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
            quickLaunch: parsed.quickLaunch || DEFAULT_QUICK_LAUNCH,
            customSearchEngines: parsed.customSearchEngines || []
          })
        } catch (error) {
          console.error('Failed to import data:', error)
          throw new Error('Invalid data format')
        }
      }
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      partialize: (state) => ({
        settings: state.settings,
        quickLaunch: state.quickLaunch,
        customSearchEngines: state.customSearchEngines,
        theme: state.theme
      })
    }
  )
)