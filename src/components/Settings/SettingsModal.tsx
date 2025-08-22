import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Palette, Settings, Cloud, Download, Upload, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/utils'
import { SyncSettings } from './SyncSettings'

const getTabs = (t: any) => [
  { id: 'appearance', icon: Palette, label: t('settings.appearance.title') },
  { id: 'general', icon: Settings, label: t('settings.general.title') },
  { id: 'sync', icon: Cloud, label: t('settings.sync.title') },
  { id: 'backup', icon: Download, label: t('settings.backup.title') }
] as const

type TabId = 'appearance' | 'general' | 'sync' | 'backup'

export function SettingsModal() {
  const { t } = useTranslation()
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings, resetToDefaults, exportData, importData } = useAppStore()
  const [activeTab, setActiveTab] = useState<TabId>('appearance')
  
  const TABS = getTabs(t)

  const handleClose = () => {
    setSettingsOpen(false)
  }

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `new-tab-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        importData(data)
      } catch (error) {
        console.error('Failed to import settings:', error)
      }
    }
    reader.readAsText(file)
  }

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-claude-gray-700 dark:text-claude-gray-300 mb-3">
          {t('settings.appearance.theme')}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'auto'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => updateSettings({ theme: { ...settings.theme, mode } })}
              className={cn(
                "neumorphic-button-premium p-4 text-center",
                settings.theme.mode === mode
                  ? "shadow-inset-sm dark:shadow-inset-sm-dark bg-claude-gray-200/50 dark:bg-claude-gray-700/50"
                  : "hover:shadow-neumorphic dark:hover:shadow-neumorphic-dark"
              )}
            >
              <div className="text-sm font-medium text-claude-gray-800 dark:text-claude-gray-200">
                {t(`settings.appearance.${mode}`)}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-claude-gray-700 dark:text-claude-gray-300 mb-3">
          {t('settings.appearance.background')}
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.background.bingEnabled}
              onChange={(e) => updateSettings({
                background: { ...settings.background, bingEnabled: e.target.checked }
              })}
              className="neumorphic-checkbox"
            />
            <span className="ml-2 text-sm text-claude-gray-700 dark:text-claude-gray-300">
              {t('settings.appearance.backgroundTypes.bing')}
            </span>
          </label>

          <div>
            <label className="block text-sm text-claude-gray-600 dark:text-claude-gray-400 mb-2">
              Blur Amount: {settings.background.blurAmount}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={settings.background.blurAmount}
              onChange={(e) => updateSettings({
                background: { ...settings.background, blurAmount: Number(e.target.value) }
              })}
              className="w-full neumorphic-slider-premium"
            />
          </div>

          <div>
            <label className="block text-sm text-claude-gray-600 dark:text-claude-gray-400 mb-2">
              Opacity: {settings.background.opacity}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.background.opacity}
              onChange={(e) => updateSettings({
                background: { ...settings.background, opacity: Number(e.target.value) }
              })}
              className="w-full neumorphic-slider-premium"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-claude-gray-700 dark:text-claude-gray-300 mb-3">
          {t('settings.general.language')}
        </label>
        <select
          value={settings.language}
          onChange={(e) => updateSettings({ language: e.target.value })}
          className="w-full neumorphic-input-premium text-claude-gray-800 dark:text-claude-gray-200"
        >
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showTime}
            onChange={(e) => updateSettings({ showTime: e.target.checked })}
            className="neumorphic-checkbox"
          />
          <span className="ml-2 text-sm text-claude-gray-700 dark:text-claude-gray-300">
            {t('settings.general.showTime')}
          </span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.showWeather}
            onChange={(e) => updateSettings({ showWeather: e.target.checked })}
            className="neumorphic-checkbox"
          />
          <span className="ml-2 text-sm text-claude-gray-700 dark:text-claude-gray-300">
            {t('settings.general.showWeather')}
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-claude-gray-700 dark:text-claude-gray-300 mb-3">
          {t('settings.general.timeFormat')}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(['12h', '24h'] as const).map((format) => (
            <button
              key={format}
              onClick={() => updateSettings({ timeFormat: format })}
              className={cn(
                "neumorphic-button-premium p-4 text-center",
                settings.timeFormat === format
                  ? "shadow-inset-sm dark:shadow-inset-sm-dark bg-claude-gray-200/50 dark:bg-claude-gray-700/50"
                  : "hover:shadow-neumorphic dark:hover:shadow-neumorphic-dark"
              )}
            >
              <div className="text-sm font-medium text-claude-gray-800 dark:text-claude-gray-200">
                {format}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSyncTab = () => (
    <SyncSettings />
  )

  const renderBackupTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={handleExport}
          className="neumorphic-button-premium flex items-center justify-center gap-2 p-4 text-claude-gray-700 dark:text-claude-gray-300"
        >
          <Download className="w-4 h-4" />
          {t('settings.backup.export')}
        </button>

        <label className="neumorphic-button-premium flex items-center justify-center gap-2 p-4 text-claude-gray-700 dark:text-claude-gray-300 cursor-pointer">
          <Upload className="w-4 h-4" />
          {t('settings.backup.import')}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <button
          onClick={resetToDefaults}
          className="neumorphic-button-premium flex items-center justify-center gap-2 p-4 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20"
        >
          <RotateCcw className="w-4 h-4" />
          {t('settings.backup.reset')}
        </button>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance': return renderAppearanceTab()
      case 'general': return renderGeneralTab()
      case 'sync': return renderSyncTab()
      case 'backup': return renderBackupTab()
      default: return null
    }
  }

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="modal-surface w-full max-w-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-claude-gray-200 dark:border-claude-gray-700">
              <h2 className="text-xl font-semibold text-claude-gray-800 dark:text-claude-gray-200">
                {t('settings.title')}
              </h2>
              <button
                onClick={handleClose}
                className="neumorphic-button-sm p-2 text-claude-gray-600 dark:text-claude-gray-400 hover:text-claude-gray-800 dark:hover:text-claude-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="w-48 p-4 border-r border-claude-gray-200 dark:border-claude-gray-700">
                <nav className="space-y-1">
                  {TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          activeTab === tab.id
                            ? "bg-claude-gray-100 dark:bg-claude-gray-700 text-claude-gray-900 dark:text-claude-gray-100"
                            : "text-claude-gray-600 dark:text-claude-gray-400 hover:text-claude-gray-900 dark:hover:text-claude-gray-100 hover:bg-claude-gray-50 dark:hover:bg-claude-gray-800"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {renderTabContent()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}