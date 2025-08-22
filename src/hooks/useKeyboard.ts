import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  action: () => void
}

export function useKeyboard(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matches = 
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!event.ctrlKey === !!shortcut.ctrl &&
          !!event.altKey === !!shortcut.alt &&
          !!event.shiftKey === !!shortcut.shift &&
          !!event.metaKey === !!shortcut.meta

        if (matches) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export function useGlobalShortcuts() {
  const { setSettingsOpen, setSearchFocused } = useAppStore()

  useKeyboard([
    {
      key: 'k',
      ctrl: true,
      action: () => setSearchFocused(true)
    },
    {
      key: ',',
      ctrl: true,
      action: () => setSettingsOpen(true)
    },
    {
      key: 'Escape',
      action: () => {
        setSettingsOpen(false)
        setSearchFocused(false)
      }
    }
  ])
}