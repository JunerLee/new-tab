import { useEffect, Suspense } from 'react'
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
import { cn } from './utils'
import { logError } from './utils/errorHandling'
import { delightfulAnimations } from './utils/delightfulAnimations'

function App() {
  const { i18n } = useTranslation()
  const { settings, setSettingsOpen } = useAppStore()
  
  // Initialize hooks
  useTheme()
  useGlobalShortcuts()
  useSeasonalEffects()

  // Sync language setting with i18n
  useEffect(() => {
    i18n.changeLanguage(settings.language)
  }, [settings.language, i18n])

  // Initialize theme on component mount
  useEffect(() => {
    document.documentElement.classList.add('dark:bg-claude-dark')
  }, [])

  // 延迟触发图标动画，确保页面已加载
  useEffect(() => {
    setTimeout(() => {
      delightfulAnimations.animateIconEntry(document.body, 0)
    }, 1000)
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
        <SeasonalEffects isVisible={true} />
        
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
        
      </div>
    </ErrorBoundary>
  )
}

export default App