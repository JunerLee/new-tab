import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { DEFAULT_SEARCH_ENGINES } from '@/utils/constants'
import { createSearchUrl, cn } from '@/utils'

export function SearchBar() {
  const { t } = useTranslation()
  const { settings, searchFocused, setSearchFocused, customSearchEngines } = useAppStore()
  const [query, setQuery] = useState('')
  const [showEngines, setShowEngines] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const allEngines = [...DEFAULT_SEARCH_ENGINES, ...customSearchEngines]
  const currentEngine = allEngines.find(engine => engine.id === settings.searchEngine) || DEFAULT_SEARCH_ENGINES[0]

  useEffect(() => {
    if (searchFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [searchFocused])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      const searchUrl = createSearchUrl(currentEngine.id, query.trim())
      window.open(searchUrl, '_self')
    }
  }

  const handleEngineSelect = (engineId: string) => {
    useAppStore.getState().updateSettings({ searchEngine: engineId })
    setShowEngines(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSearch} className="relative">
        {/* Search Engine Selector */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEngines(!showEngines)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-2xl",
                "neumorphic-button",
                "text-claude-gray-700 dark:text-claude-gray-300"
              )}
            >
              <img 
                src={currentEngine.icon} 
                alt={currentEngine.name}
                className="w-4 h-4"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-sm font-medium">{currentEngine.name}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showEngines && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "absolute top-full left-0 mt-2 min-w-48",
                    "paper-card p-2 z-20"
                  )}
                >
                  {allEngines.map((engine) => (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => handleEngineSelect(engine.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                        "text-left transition-colors duration-200",
                        "hover:bg-claude-gray-100 dark:hover:bg-claude-gray-700",
                        engine.id === settings.searchEngine && "bg-claude-gray-100 dark:bg-claude-gray-700"
                      )}
                    >
                      <img 
                        src={engine.icon} 
                        alt={engine.name}
                        className="w-4 h-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <span className="text-sm font-medium">{engine.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder={currentEngine.placeholder || t('search.placeholder')}
            className={cn(
              "w-full h-16 pl-40 pr-16 rounded-2xl", /* 调整内边距适应新按钮尺寸 */
              "search-input text-lg"
            )}
          />
          
          <button
            type="submit"
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2",
              "w-10 h-10 rounded-2xl flex items-center justify-center",
              "neumorphic-button",
              "text-claude-gray-600 dark:text-claude-gray-400"
            )}
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Search Suggestions (Future enhancement) */}
      <AnimatePresence>
        {searchFocused && query && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 paper-card p-3"
          >
            <div className="text-sm text-claude-gray-500 dark:text-claude-gray-400">
              Press Enter to search for "{query}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}