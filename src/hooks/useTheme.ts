import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { getTimeBasedTheme } from '@/utils'

export function useTheme() {
  const { theme, setTheme, settings } = useAppStore()

  useEffect(() => {
    const updateTheme = () => {
      if (settings.theme.mode === 'auto') {
        const autoTheme = getTimeBasedTheme()
        setTheme(autoTheme)
      } else {
        setTheme(settings.theme.mode)
      }
    }

    // Update theme immediately
    updateTheme()

    // Set up interval to check for auto theme changes
    if (settings.theme.mode === 'auto') {
      const interval = setInterval(updateTheme, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [settings.theme.mode, setTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return { theme }
}