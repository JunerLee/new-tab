import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, Sun, CloudRain, Snowflake, Wind } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { formatTime, formatDate } from '@/utils'

export function TimeWeather() {
  const { t } = useTranslation()
  const { settings, weather } = useAppStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 6) return t('time.goodNight')
    if (hour < 12) return t('time.goodMorning')
    if (hour < 18) return t('time.goodAfternoon')
    if (hour < 22) return t('time.goodEvening')
    return t('time.goodNight')
  }

  const getWeatherIcon = (condition: string) => {
    const iconProps = { className: "w-5 h-5" }
    
    if (condition.toLowerCase().includes('rain')) return <CloudRain {...iconProps} />
    if (condition.toLowerCase().includes('snow')) return <Snowflake {...iconProps} />
    if (condition.toLowerCase().includes('cloud')) return <Cloud {...iconProps} />
    if (condition.toLowerCase().includes('wind')) return <Wind {...iconProps} />
    return <Sun {...iconProps} />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="text-center mb-8"
    >
      {/* Greeting */}
      <motion.h1
        key={getGreeting()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl md:text-3xl font-light text-claude-gray-800 dark:text-claude-gray-200 mb-2"
      >
        {getGreeting()}
      </motion.h1>

      {/* Time */}
      {settings.showTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="text-5xl md:text-6xl font-light text-claude-gray-900 dark:text-claude-gray-100 mb-2 font-mono">
            {formatTime(currentTime, settings.timeFormat, settings.language === 'zh' ? 'zh-CN' : 'en-US')}
          </div>
          <div className="text-sm text-claude-gray-600 dark:text-claude-gray-400">
            {formatDate(currentTime, settings.language === 'zh' ? 'zh-CN' : 'en-US')}
          </div>
        </motion.div>
      )}

      {/* Weather */}
      {settings.showWeather && weather && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-3 px-4 py-2 glass-effect rounded-full"
        >
          <div className="text-claude-gray-600 dark:text-claude-gray-400">
            {getWeatherIcon(weather.condition)}
          </div>
          
          <div className="text-sm">
            <span className="font-medium text-claude-gray-800 dark:text-claude-gray-200">
              {weather.temperature}°C
            </span>
            <span className="text-claude-gray-600 dark:text-claude-gray-400 ml-2">
              {weather.location}
            </span>
          </div>
          
          <div className="text-xs text-claude-gray-500 dark:text-claude-gray-500">
            <div>{t('weather.humidity')}: {weather.humidity}%</div>
            <div>{t('weather.windSpeed')}: {weather.windSpeed} km/h</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}