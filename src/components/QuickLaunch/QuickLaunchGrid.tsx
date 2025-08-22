import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, ExternalLink, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { QuickLaunchItem } from '@/types'
import { getDomainFromUrl, getFaviconUrl, cn, isValidUrl } from '@/utils'

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
  const { quickLaunch, removeQuickLaunchItem, addQuickLaunchItem, updateQuickLaunchItem } = useAppStore()
  const [editingItem, setEditingItem] = useState<QuickLaunchItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', url: '', category: 'productivity' })
  const [formErrors, setFormErrors] = useState({ name: '', url: '' })

  const sortedItems = [...quickLaunch].sort((a, b) => a.order - b.order)

  const handleEdit = (item: QuickLaunchItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      url: item.url,
      category: item.category || 'productivity'
    })
    setFormErrors({ name: '', url: '' })
  }

  const handleDelete = (id: string) => {
    removeQuickLaunchItem(id)
  }

  const handleAddNew = () => {
    setShowAddForm(true)
    setFormData({ name: '', url: '', category: 'productivity' })
    setFormErrors({ name: '', url: '' })
  }

  const handleCloseModal = () => {
    setEditingItem(null)
    setShowAddForm(false)
    setFormData({ name: '', url: '', category: 'productivity' })
    setFormErrors({ name: '', url: '' })
  }

  const validateForm = () => {
    const errors = { name: '', url: '' }
    let isValid = true

    if (!formData.name.trim()) {
      errors.name = t('common.name') + ' is required'
      isValid = false
    }

    if (!formData.url.trim()) {
      errors.url = t('common.url') + ' is required'
      isValid = false
    } else if (!isValidUrl(formData.url)) {
      errors.url = 'Invalid URL format'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    if (editingItem) {
      updateQuickLaunchItem(editingItem.id, {
        name: formData.name.trim(),
        url: formData.url.trim(),
        category: formData.category as any,
        favicon: getFaviconUrl(getDomainFromUrl(formData.url.trim()))
      })
    } else {
      addQuickLaunchItem({
        name: formData.name.trim(),
        url: formData.url.trim(),
        category: formData.category as any,
        favicon: getFaviconUrl(getDomainFromUrl(formData.url.trim())),
        isCustom: true
      })
    }

    handleCloseModal()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-claude-gray-800 dark:text-claude-gray-200 mb-2">
          {t('quickLaunch.title')}
        </h2>
        <div className="w-16 h-0.5 bg-gradient-to-r from-claude-gray-300 to-transparent dark:from-claude-gray-600 mx-auto" />
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-6">
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

      <AnimatePresence>
        {(editingItem || showAddForm) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="paper-card w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-claude-gray-200 dark:border-claude-gray-700">
                <h3 className="text-lg font-semibold text-claude-gray-800 dark:text-claude-gray-200">
                  {editingItem ? t('quickLaunch.edit') : t('quickLaunch.addNew')}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg hover:bg-claude-gray-100 dark:hover:bg-claude-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-claude-gray-700 dark:text-claude-gray-300 mb-2">
                    {t('common.name')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg",
                      "bg-white dark:bg-claude-gray-800",
                      "border-claude-gray-300 dark:border-claude-gray-600",
                      "focus:ring-2 focus:ring-claude-gray-400 focus:border-transparent",
                      formErrors.name && "border-red-500"
                    )}
                    placeholder="Website name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-claude-gray-700 dark:text-claude-gray-300 mb-2">
                    {t('common.url')}
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className={cn(
                      "w-full px-3 py-2 border rounded-lg",
                      "bg-white dark:bg-claude-gray-800",
                      "border-claude-gray-300 dark:border-claude-gray-600",
                      "focus:ring-2 focus:ring-claude-gray-400 focus:border-transparent",
                      formErrors.url && "border-red-500"
                    )}
                    placeholder="https://example.com"
                  />
                  {formErrors.url && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.url}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-claude-gray-700 dark:text-claude-gray-300 mb-2">
                    {t('common.category')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-claude-gray-300 dark:border-claude-gray-600 rounded-lg bg-white dark:bg-claude-gray-800 focus:ring-2 focus:ring-claude-gray-400 focus:border-transparent"
                  >
                    <option value="development">{t('quickLaunch.categories.development')}</option>
                    <option value="social">{t('quickLaunch.categories.social')}</option>
                    <option value="entertainment">{t('quickLaunch.categories.entertainment')}</option>
                    <option value="productivity">{t('quickLaunch.categories.productivity')}</option>
                    <option value="news">{t('quickLaunch.categories.news')}</option>
                    <option value="shopping">{t('quickLaunch.categories.shopping')}</option>
                    <option value="education">{t('quickLaunch.categories.education')}</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 pt-0">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-claude-gray-700 dark:text-claude-gray-300 hover:text-claude-gray-900 dark:hover:text-claude-gray-100 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  className="neumorphic-button px-4 py-2 text-sm font-medium text-claude-gray-800 dark:text-claude-gray-200"
                >
                  {editingItem ? t('common.save') : t('common.add')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}