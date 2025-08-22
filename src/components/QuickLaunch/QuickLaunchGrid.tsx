import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { QuickLaunchItem } from '@/types'
import { getDomainFromUrl, getFaviconUrl, cn } from '@/utils'

interface QuickLaunchItemProps {
  item: QuickLaunchItem
  onEdit: (item: QuickLaunchItem) => void
  onDelete: (id: string) => void
}

function QuickLaunchItemComponent({ item, onEdit, onDelete }: QuickLaunchItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  const faviconUrl = item.favicon || getFaviconUrl(getDomainFromUrl(item.url))

  const handleClick = () => {
    window.open(item.url, '_blank')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div
        onClick={handleClick}
        className={cn(
          "quick-launch-item relative overflow-hidden",
          "cursor-pointer"
        )}
      >
        {/* Icon */}
        <div className="icon-wrapper">
          {!imageError ? (
            <img
              src={faviconUrl}
              alt={item.name}
              className="w-6 h-6"
              onError={() => setImageError(true)}
            />
          ) : (
            <ExternalLink className="w-5 h-5 text-claude-gray-500" />
          )}
        </div>

        {/* Hover Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center gap-1"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(item)
                }}
                className="p-1 rounded bg-white/90 dark:bg-black/90 text-claude-gray-700 dark:text-claude-gray-300 hover:bg-white dark:hover:bg-black transition-colors"
              >
                <Edit className="w-3 h-3" />
              </button>
              {item.isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id)
                  }}
                  className="p-1 rounded bg-red-500/90 text-white hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Label */}
      <div className="mt-2 text-center">
        <div className="text-xs font-medium text-claude-gray-700 dark:text-claude-gray-300 truncate px-1">
          {item.name}
        </div>
      </div>
    </motion.div>
  )
}

interface AddItemButtonProps {
  onClick: () => void
}

function AddItemButton({ onClick }: AddItemButtonProps) {
  const { t } = useTranslation()

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "quick-launch-item",
        "border-2 border-dashed border-claude-gray-300 dark:border-claude-gray-600",
        "bg-transparent hover:border-claude-gray-400 dark:hover:border-claude-gray-500",
        "cursor-pointer group"
      )}
    >
      <Plus className="w-6 h-6 text-claude-gray-400 dark:text-claude-gray-500 group-hover:text-claude-gray-600 dark:group-hover:text-claude-gray-400 transition-colors" />
      
      <div className="mt-2 text-center">
        <div className="text-xs font-medium text-claude-gray-500 dark:text-claude-gray-400 group-hover:text-claude-gray-600 dark:group-hover:text-claude-gray-300 transition-colors">
          {t('quickLaunch.addNew')}
        </div>
      </div>
    </motion.div>
  )
}

export function QuickLaunchGrid() {
  const { t } = useTranslation()
  const { quickLaunch, removeQuickLaunchItem } = useAppStore()
  const [editingItem, setEditingItem] = useState<QuickLaunchItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const sortedItems = [...quickLaunch].sort((a, b) => a.order - b.order)

  const handleEdit = (item: QuickLaunchItem) => {
    setEditingItem(item)
  }

  const handleDelete = (id: string) => {
    removeQuickLaunchItem(id)
  }

  const handleAddNew = () => {
    setShowAddForm(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-claude-gray-800 dark:text-claude-gray-200 mb-2">
          {t('quickLaunch.title')}
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-claude-gray-300 to-transparent dark:from-claude-gray-600 mx-auto" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item) => (
            <QuickLaunchItemComponent
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          
          <AddItemButton onClick={handleAddNew} />
        </AnimatePresence>
      </div>

      {/* Modals would go here */}
      {/* TODO: Add EditItemModal and AddItemModal components */}
    </motion.div>
  )
}