import { useEffect, useCallback, useState } from 'react'

interface AccessibilityPreferences {
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  prefersDarkMode: boolean
  prefersReducedTransparency: boolean
  fontSize: 'small' | 'medium' | 'large' | 'x-large'
}

interface AccessibilityActions {
  setReducedMotion: (enabled: boolean) => void
  setHighContrast: (enabled: boolean) => void
  setFontSize: (size: AccessibilityPreferences['fontSize']) => void
  announceToScreenReader: (message: string) => void
  focusManagement: {
    trapFocus: (container: HTMLElement) => () => void
    restoreFocus: (element: HTMLElement | null) => void
    getFocusableElements: (container: HTMLElement) => HTMLElement[]
  }
}

// Screen reader announcement utility
let announcer: HTMLElement | null = null

const createAnnouncer = (): HTMLElement => {
  if (!announcer) {
    announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.style.position = 'absolute'
    announcer.style.left = '-10000px'
    announcer.style.width = '1px'
    announcer.style.height = '1px'
    announcer.style.overflow = 'hidden'
    document.body.appendChild(announcer)
  }
  return announcer
}

// Focus management utilities
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelectors))
}

const trapFocus = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container)
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown)

  // Focus the first element
  firstElement?.focus()

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown)
  }
}

export const useAccessibility = (): AccessibilityPreferences & AccessibilityActions => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
    prefersReducedTransparency: false,
    fontSize: 'medium',
  })

  // Detect system preferences
  useEffect(() => {
    const updatePreferences = () => {
      setPreferences(prev => ({
        ...prev,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        prefersReducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
      }))
    }

    // Initial check
    updatePreferences()

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
      window.matchMedia('(prefers-reduced-transparency: reduce)'),
    ]

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updatePreferences)
    })

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updatePreferences)
      })
    }
  }, [])

  // Apply CSS custom properties based on preferences
  useEffect(() => {
    const root = document.documentElement

    // Reduced motion
    root.style.setProperty(
      '--motion-scale',
      preferences.prefersReducedMotion ? '0' : '1'
    )

    // High contrast
    if (preferences.prefersHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'x-large': '20px',
    }
    root.style.setProperty('--base-font-size', fontSizeMap[preferences.fontSize])

    // Reduced transparency
    root.style.setProperty(
      '--transparency-scale',
      preferences.prefersReducedTransparency ? '1' : '0.8'
    )
  }, [preferences])

  // Actions
  const setReducedMotion = useCallback((enabled: boolean) => {
    setPreferences(prev => ({ ...prev, prefersReducedMotion: enabled }))
  }, [])

  const setHighContrast = useCallback((enabled: boolean) => {
    setPreferences(prev => ({ ...prev, prefersHighContrast: enabled }))
  }, [])

  const setFontSize = useCallback((size: AccessibilityPreferences['fontSize']) => {
    setPreferences(prev => ({ ...prev, fontSize: size }))
  }, [])

  const announceToScreenReader = useCallback((message: string) => {
    const announcer = createAnnouncer()
    announcer.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = ''
    }, 1000)
  }, [])

  const restoreFocus = useCallback((element: HTMLElement | null) => {
    if (element && typeof element.focus === 'function') {
      element.focus()
    }
  }, [])

  const focusManagement = {
    trapFocus,
    restoreFocus,
    getFocusableElements,
  }

  return {
    ...preferences,
    setReducedMotion,
    setHighContrast,
    setFontSize,
    announceToScreenReader,
    focusManagement,
  }
}

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  container: React.RefObject<HTMLElement>,
  options: {
    enabled?: boolean
    wrap?: boolean
    orientation?: 'horizontal' | 'vertical' | 'both'
  } = {}
) => {
  const { enabled = true, wrap = true, orientation = 'both' } = options

  useEffect(() => {
    if (!enabled || !container.current) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = getFocusableElements(container.current!)
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)

      if (currentIndex === -1) return

      let nextIndex = currentIndex

      switch (event.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault()
            nextIndex = currentIndex + 1
          }
          break
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault()
            nextIndex = currentIndex - 1
          }
          break
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault()
            nextIndex = currentIndex + 1
          }
          break
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault()
            nextIndex = currentIndex - 1
          }
          break
        case 'Home':
          event.preventDefault()
          nextIndex = 0
          break
        case 'End':
          event.preventDefault()
          nextIndex = focusableElements.length - 1
          break
        default:
          return
      }

      // Handle wrapping
      if (wrap) {
        if (nextIndex >= focusableElements.length) {
          nextIndex = 0
        } else if (nextIndex < 0) {
          nextIndex = focusableElements.length - 1
        }
      } else {
        nextIndex = Math.max(0, Math.min(nextIndex, focusableElements.length - 1))
      }

      focusableElements[nextIndex]?.focus()
    }

    container.current.addEventListener('keydown', handleKeyDown)

    return () => {
      container.current?.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, wrap, orientation, container])
}

// Hook for skip links
export const useSkipLinks = (skipTargets: Array<{ id: string; label: string }>) => {
  useEffect(() => {
    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.className = 'skip-links'
    skipLinksContainer.innerHTML = skipTargets
      .map(
        ({ id, label }) => `
          <a href="#${id}" class="skip-link">
            Skip to ${label}
          </a>
        `
      )
      .join('')

    document.body.insertBefore(skipLinksContainer, document.body.firstChild)

    return () => {
      skipLinksContainer.remove()
    }
  }, [skipTargets])
}

// Custom hook for managing ARIA live regions
export const useLiveRegion = (
  initialMessage = '',
  politeness: 'polite' | 'assertive' = 'polite'
) => {
  const [message, setMessage] = useState(initialMessage)

  useEffect(() => {
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', politeness)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-10000px'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'
    document.body.appendChild(liveRegion)

    liveRegion.textContent = message

    return () => {
      liveRegion.remove()
    }
  }, [message, politeness])

  return setMessage
}