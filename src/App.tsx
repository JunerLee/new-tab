import { useEffect, Suspense, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './locales/i18n'
import { useAppStore } from './stores/useAppStore'
import { useTheme } from './hooks/useTheme'
import { useGlobalShortcuts } from './hooks/useKeyboard'
import { BackgroundImage } from './components/Background/BackgroundImage'
import { BackgroundEffects } from './components/Background/BackgroundEffects'
import { TimeWeather } from './components/TimeWeather'
import { SearchBar } from './components/SearchEngine/SearchBar'
import { QuickLaunchGrid } from './components/QuickLaunch/QuickLaunchGrid'
import { SettingsModal } from './components/Settings/SettingsModal'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SuspenseFallback } from './components/LoadingSpinner'
import { SeasonalEffects, useSeasonalEffects } from './components/DelightfulEffects/SeasonalEffects'
import { AchievementSystem, defaultAchievements, unlockAchievement, updateAchievementProgress, type Achievement } from './components/DelightfulEffects/AchievementSystem'
import { cn } from './utils'
import { logError } from './utils/errorHandling'
import { delightfulAnimations } from './utils/delightfulAnimations'

function App() {
  const { i18n } = useTranslation()
  const { settings, setSettingsOpen, quickLaunch } = useAppStore()
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements)
  const [firstVisit, setFirstVisit] = useState(true)
  
  // Initialize hooks
  useTheme()
  useGlobalShortcuts()
  const seasonalEffects = useSeasonalEffects()

  // Sync language setting with i18n
  useEffect(() => {
    i18n.changeLanguage(settings.language)
  }, [settings.language, i18n])

  // Initialize theme on component mount
  useEffect(() => {
    document.documentElement.classList.add('dark:bg-claude-dark')
  }, [])

  // 首次访问成就
  useEffect(() => {
    if (firstVisit) {
      setAchievements(prev => unlockAchievement(prev, 'first-launch'))
      setFirstVisit(false)
      
      // 延迟触发，确保页面已加载
      setTimeout(() => {
        delightfulAnimations.animateIconEntry(document.body, 0)
      }, 1000)
    }
  }, [firstVisit])

  // 监控快速启动项数量变化
  useEffect(() => {
    const customItemsCount = quickLaunch.filter(item => item.isCustom).length
    
    if (customItemsCount >= 1) {
      setAchievements(prev => unlockAchievement(prev, 'first-custom-item'))
    }
    
    if (customItemsCount >= 20) {
      setAchievements(prev => unlockAchievement(prev, 'power-user'))
    }
  }, [quickLaunch])

  // 成就回调
  const handleAchievementUnlock = useCallback((achievement: Achievement) => {
    console.log('Achievement unlocked:', achievement.title)
    
    // 根据稀有度播放不同的庆祝效果
    if (achievement.rarity === 'legendary') {
      // 传奇成就 - 全屏庆祝
      delightfulAnimations.triggerCelebration()
      if (seasonalEffects.isSpecialDate) {
        delightfulAnimations.createSeasonalEffect(seasonalEffects.season)
      }
    } else if (achievement.rarity === 'epic') {
      // 史诗成就 - 较大庆祝
      delightfulAnimations.triggerCelebration({ x: window.innerWidth - 150, y: 100 })
    }
  }, [seasonalEffects])

  // 公开成就更新方法
  const updateAchievements = useCallback((achievementId: string, increment: number = 1) => {
    setAchievements(prev => updateAchievementProgress(prev, achievementId, increment))
  }, [])

  const handleSettingsClick = () => {
    setSettingsOpen(true)
  }

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    logError(error, 'App component error')
    console.error('App error:', { error, errorInfo })
  }

  return (
    <ErrorBoundary onError={handleError} showDetails={process.env.NODE_ENV === 'development'}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <BackgroundEffects />
        <ErrorBoundary>
          <Suspense fallback={<SuspenseFallback text="Loading background..." />}>
            <BackgroundImage />
          </Suspense>
        </ErrorBoundary>
        
        {/* 季节性效果 */}
        <SeasonalEffects isVisible={settings.animations !== false} />
        
        {/* Settings button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          onClick={handleSettingsClick}
          className={cn(
            "fixed top-6 right-6 z-30",
            "w-16 h-16 rounded-3xl",
            "neumorphic-button-premium neumorphic-glow",
            "flex items-center justify-center",
            "text-claude-gray-600 dark:text-claude-gray-400",
            "hover:text-claude-gray-800 dark:hover:text-claude-gray-200",
            "transition-colors duration-300"
          )}
        >
          <Settings className="w-6 h-6" />
        </motion.button>

        {/* Main content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header area */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
            <div className="w-full max-w-4xl mx-auto">
              {/* Time and weather */}
              <ErrorBoundary>
                <Suspense fallback={<SuspenseFallback text="Loading time and weather..." />}>
                  <TimeWeather />
                </Suspense>
              </ErrorBoundary>
              
              {/* Search bar */}
              <div className="mb-16">
                <ErrorBoundary>
                  <Suspense fallback={<SuspenseFallback text="Loading search..." />}>
                    <SearchBar />
                  </Suspense>
                </ErrorBoundary>
              </div>
              
              {/* Quick launch */}
              <ErrorBoundary>
                <Suspense fallback={<SuspenseFallback text="Loading quick launch..." />}>
                  <QuickLaunchGrid />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          {/* Footer完全移除，实现更沉浸的体验 */}
        </div>

        {/* Settings modal */}
        <ErrorBoundary>
          <Suspense fallback={<SuspenseFallback text="Loading settings..." />}>
            <SettingsModal />
          </Suspense>
        </ErrorBoundary>
        
        {/* 成就系统 */}
        <AchievementSystem 
          achievements={achievements}
          onAchievementUnlock={handleAchievementUnlock}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App