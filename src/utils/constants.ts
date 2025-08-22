import { SearchEngine, QuickLaunchItem, AppSettings } from '@/types'

export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google',
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    icon: 'https://www.google.com/favicon.ico',
    placeholder: '搜索 Google...'
  },
  {
    id: 'bing',
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    icon: 'https://www.bing.com/favicon.ico',
    placeholder: '搜索必应...'
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    icon: 'https://duckduckgo.com/favicon.ico',
    placeholder: '搜索 DuckDuckGo...'
  },
  {
    id: 'baidu',
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    icon: 'https://www.baidu.com/favicon.ico',
    placeholder: '百度一下...'
  }
]

export const DEFAULT_QUICK_LAUNCH: QuickLaunchItem[] = [
  {
    id: 'bilibili',
    name: 'Bilibili',
    url: 'https://www.bilibili.com',
    favicon: 'https://www.bilibili.com/favicon.ico',
    category: 'entertainment',
    order: 0,
    isCustom: false
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    favicon: 'https://github.com/favicon.ico',
    category: 'development',
    order: 1,
    isCustom: false
  },
  {
    id: 'weibo',
    name: '微博',
    url: 'https://weibo.com',
    favicon: 'https://weibo.com/favicon.ico',
    category: 'social',
    order: 2,
    isCustom: false
  },
  {
    id: 'zhihu',
    name: '知乎',
    url: 'https://www.zhihu.com',
    favicon: 'https://www.zhihu.com/favicon.ico',
    category: 'social',
    order: 3,
    isCustom: false
  },
  {
    id: 'juejin',
    name: '掘金',
    url: 'https://juejin.cn',
    favicon: 'https://juejin.cn/favicon.ico',
    category: 'development',
    order: 4,
    isCustom: false
  },
  {
    id: 'taobao',
    name: '淘宝',
    url: 'https://www.taobao.com',
    favicon: 'https://www.taobao.com/favicon.ico',
    category: 'shopping',
    order: 5,
    isCustom: false
  },
  {
    id: 'jd',
    name: '京东',
    url: 'https://www.jd.com',
    favicon: 'https://www.jd.com/favicon.ico',
    category: 'shopping',
    order: 6,
    isCustom: false
  },
  {
    id: 'netease-music',
    name: '网易云音乐',
    url: 'https://music.163.com',
    favicon: 'https://music.163.com/favicon.ico',
    category: 'entertainment',
    order: 7,
    isCustom: false
  }
]

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'zh', // 默认使用中文
  theme: {
    mode: 'auto',
    autoSwitchTime: {
      lightStart: '06:00',
      darkStart: '18:00'
    }
  },
  background: {
    type: 'bing',
    bingEnabled: false, // 默认不开启bing背景
    blurAmount: 0,
    opacity: 100,
    changeInterval: 24
  },
  sync: {
    enabled: false,
    provider: 'local'
  },
  searchEngine: 'baidu', // 默认使用百度搜索
  showWeather: true,
  showTime: true,
  timeFormat: '24h', // 使用24小时制
  shortcuts: {
    search: 'ctrl+k',
    settings: 'ctrl+,'
  }
}

export const BING_API_BASE = 'https://www.bing.com/HPImageArchive.aspx'
export const WEATHER_API_KEY = '' // User needs to provide their own API key
export const FAVICON_API = 'https://www.google.com/s2/favicons?domain='

export const STORAGE_KEYS = {
  SETTINGS: 'newTab_settings',
  QUICK_LAUNCH: 'newTab_quickLaunch',
  CUSTOM_SEARCH_ENGINES: 'newTab_customSearchEngines',
  BING_IMAGES: 'newTab_bingImages',
  WEATHER: 'newTab_weather'
} as const

export const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'Grid3X3' },
  { id: 'development', name: 'Development', icon: 'Code' },
  { id: 'social', name: 'Social', icon: 'Users' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Play' },
  { id: 'productivity', name: 'Productivity', icon: 'Briefcase' },
  { id: 'news', name: 'News', icon: 'Newspaper' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingCart' },
  { id: 'education', name: 'Education', icon: 'BookOpen' }
] as const