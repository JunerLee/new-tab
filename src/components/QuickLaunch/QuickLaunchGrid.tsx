import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, ExternalLink, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { QuickLaunchItem } from '@/types'
import { getDomainFromUrl, getFaviconUrl, cn, isValidUrl } from '@/utils'
import { useQuickLaunchEdit } from '@/hooks/useQuickLaunchEdit'

interface QuickLaunchItemProps {
  item: QuickLaunchItem
  index: number
  isEditMode: boolean
  isEditing: boolean
  isDragging: boolean
  isDragOver: boolean
  onEdit: (item: QuickLaunchItem) => void
  onDelete: (id: string) => void
  onPress: (item: QuickLaunchItem, event: React.MouseEvent | React.TouchEvent) => void
  onRelease: () => void
  onClick: (item: QuickLaunchItem) => void
  onDragStart: (item: QuickLaunchItem, event: React.DragEvent) => void
  onDragOver: (index: number, event: React.DragEvent) => void
  onDragEnd: () => void
  onDrop: (index: number, event: React.DragEvent) => void
}

function QuickLaunchItemComponent({ 
  item, 
  index,
  isEditMode, 
  isEditing,
  isDragging,
  isDragOver,
  onEdit, 
  onDelete,
  onPress,
  onRelease,
  onClick,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop
}: QuickLaunchItemProps) {
  const [imageError, setImageError] = useState(false)

  const faviconUrl = item.favicon || getFaviconUrl(getDomainFromUrl(item.url))

  // 超还原iOS风格晃动动画 - 精确模仿iOS 14+的图标编辑抖动
  const wiggleAnimation = useMemo(() => {
    // 使用图标ID和索引作为随机种子，确保每个图标有独特且一致的抖动
    const seed1 = (item.id.charCodeAt(0) + index * 13) % 17
    const seed2 = (item.id.length * 7 + index * 19) % 23
    const seed3 = (index * 31) % 11
    
    // iOS风格的抖动参数
    const baseFrequency = 1.8 + (seed1 / 17) * 0.8 // 1.8-2.6秒，iOS的典型频率
    const xAmplitude = 1.2 + (seed2 / 23) * 1.0 // 1.2-2.2px 水平抖动
    const yAmplitude = 0.8 + (seed3 / 11) * 0.8 // 0.8-1.6px 垂直抖动
    const rotateAmplitude = 1.0 + (seed1 / 17) * 1.2 // 1.0-2.2度 旋转
    const scaleAmplitude = 0.002 + (seed2 / 23) * 0.003 // 微小的缩放抖动
    
    // 相位偏移，让每个图标错开抖动时机
    const phaseOffset = (seed3 / 11) * Math.PI * 2
    
    return {
      x: [
        0,
        xAmplitude * Math.sin(phaseOffset),
        -xAmplitude * Math.cos(phaseOffset + 0.5),
        xAmplitude * 0.7 * Math.sin(phaseOffset + 1),
        0
      ],
      y: [
        0,
        -yAmplitude * Math.cos(phaseOffset + 0.3),
        yAmplitude * Math.sin(phaseOffset + 0.8),
        -yAmplitude * 0.6 * Math.cos(phaseOffset + 1.3),
        0
      ],
      rotate: [
        0,
        rotateAmplitude * Math.sin(phaseOffset + 0.2),
        -rotateAmplitude * 0.8 * Math.cos(phaseOffset + 0.7),
        rotateAmplitude * 0.6 * Math.sin(phaseOffset + 1.2),
        0
      ],
      scale: [
        1,
        1 + scaleAmplitude,
        1 - scaleAmplitude * 0.5,
        1 + scaleAmplitude * 0.7,
        1
      ],
      transition: {
        duration: baseFrequency,
        repeat: Infinity,
        repeatType: "loop" as const,
        ease: [0.25, 0.46, 0.45, 0.94], // iOS的经典缓动曲线
        times: [0, 0.25, 0.5, 0.75, 1], // 控制关键帧时间
        willChange: "transform"
      }
    }
  }, [index, item.id])

  const handleMouseDown = (e: React.MouseEvent) => {
    // 在编辑模式下，允许拖拽事件通过，但阻止冒泡
    if (isEditMode) {
      e.stopPropagation()
    }
    onPress(item, e)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // 防止触摸事件引起页面滚动
    if (isEditMode) {
      e.preventDefault()
    }
    onPress(item, e)
  }

  const handleMouseUp = (_e: React.MouseEvent) => {
    // 在编辑模式下，不立即打开链接
    if (!isEditMode) {
      onClick(item)
    }
    onRelease()
  }

  const handleTouchEnd = (_e: React.TouchEvent) => {
    // 在编辑模式下，不立即打开链接
    if (!isEditMode) {
      onClick(item)
    }
    onRelease()
  }

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(item, e)
  }

  const handleDragOver = (e: React.DragEvent) => {
    onDragOver(index, e)
  }

  const handleDrop = (e: React.DragEvent) => {
    onDrop(index, e)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: isEditing ? 1.02 : isDragOver ? 1.08 : isDragging ? 0.95 : 1,
        ...((isEditMode && !isDragging) ? wiggleAnimation : {})
      }}
      // 性能优化配置
      style={{ willChange: isEditMode ? 'transform' : 'auto' }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={!isEditMode ? { scale: 1.05 } : {}}
      className={cn(
        "relative group select-none",
        isDragOver && "z-10",
        isDragging && "opacity-30 z-20"
      )}
    >
      <div
        draggable={isEditMode}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={onDragEnd}
        onDrop={handleDrop}
        className={cn(
          "quick-launch-item relative overflow-hidden transition-all duration-300",
          "cursor-pointer touch-manipulation",
          isEditMode && "shadow-float dark:shadow-float-dark",
          isEditing && "ring-2 ring-blue-400 ring-opacity-50",
          isDragOver && "ring-2 ring-green-400 ring-opacity-70 scale-110"
        )}
        style={{
          transformOrigin: 'center center',
          transform: isEditing ? 'scale(1.02)' : undefined,
          // 性能优化：使用GPU图层
          willChange: isEditMode ? 'transform, opacity' : 'auto',
          // 硬件加速
          backfaceVisibility: 'hidden' as const,
          WebkitBackfaceVisibility: 'hidden',
          perspective: 1000
        }}
      >
        <div className="icon-wrapper transition-transform duration-200">
          {!imageError ? (
            <img
              src={faviconUrl}
              alt={item.name}
              className="w-6 h-6 pointer-events-none"
              onError={() => setImageError(true)}
              draggable={false}
            />
          ) : (
            <ExternalLink className="w-5 h-5 text-claude-gray-500 pointer-events-none" />
          )}
        </div>

        {/* 编辑模式控制按钮 */}
        <AnimatePresence>
          {isEditMode && (
            <>
              {/* 删除按钮 - 左上角 */}
              {item.isCustom && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ delay: 0.1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id)
                  }}
                  className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-20 transition-colors"
                >
                  ×
                </motion.button>
              )}
              
              {/* 编辑按钮 - 右上角 */}
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.15 }}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(item)
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg z-20 transition-colors"
              >
                <Edit className="w-3 h-3" />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 text-center">
        <div className={cn(
          "text-xs font-medium truncate px-1 transition-colors duration-200",
          "text-claude-gray-700 dark:text-claude-gray-300",
          isEditMode && "text-claude-gray-600 dark:text-claude-gray-400"
        )}>
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
  const { quickLaunch, removeQuickLaunchItem, addQuickLaunchItem, updateQuickLaunchItem, reorderQuickLaunch } = useAppStore()
  const [editingItem, setEditingItem] = useState<QuickLaunchItem | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', url: '', category: 'productivity' })
  const [formErrors, setFormErrors] = useState({ name: '', url: '' })
  
  const {
    isEditMode,
    editingItemId,
    longPressTimer,
    isDragging,
    draggedItem,
    dragOverIndex,
    handleItemPress,
    handleItemRelease,
    handleItemClick,
    exitEditMode,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  } = useQuickLaunchEdit()
  
  // 时间感知动画 - 根据时间调整动画风格
  const currentHour = new Date().getHours()
  const isDayTime = currentHour >= 6 && currentHour < 18
  
  

  const sortedItems = [...quickLaunch].sort((a, b) => a.order - b.order)

  // 点击外部区域退出编辑模式
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isEditMode && !target.closest('.quick-launch-item') && !target.closest('.modal-surface')) {
        exitEditMode()
      }
    }

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isEditMode) {
        exitEditMode()
      }
    }

    if (isEditMode) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscKey)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [isEditMode, exitEditMode, longPressTimer])

  const handleEdit = (item: QuickLaunchItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      url: item.url,
      category: item.category || 'productivity'
    })
    setFormErrors({ name: '', url: '' })
  }

  const handleReorder = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return
    
    const newItems = [...sortedItems]
    const [movedItem] = newItems.splice(sourceIndex, 1)
    newItems.splice(targetIndex, 0, movedItem)
    
    // 重新分配order值
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))
    
    reorderQuickLaunch(reorderedItems)
  }

  const handleItemDrop = (targetIndex: number, event: React.DragEvent) => {
    event.preventDefault()
    
    if (!draggedItem) return
    
    const sourceIndex = sortedItems.findIndex(item => item.id === draggedItem.id)
    if (sourceIndex !== -1) {
      handleReorder(sourceIndex, targetIndex)
    }
    
    handleDrop(targetIndex, event)
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

      {/* 编辑模式提示 */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              <span>📱</span>
              <span>{t('quickLaunch.editMode')}</span>
              <button
                onClick={exitEditMode}
                className="ml-2 px-2 py-1 bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700 rounded text-xs transition-colors"
              >
                {t('common.done')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-6 sm:gap-7 md:gap-8">
        <AnimatePresence mode="popLayout">
          {sortedItems.map((item, index) => (
            <QuickLaunchItemComponent
              key={item.id}
              item={item}
              index={index}
              isEditMode={isEditMode}
              isEditing={editingItemId === item.id}
              isDragging={isDragging && draggedItem?.id === item.id}
              isDragOver={dragOverIndex === index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPress={handleItemPress}
              onRelease={handleItemRelease}
              onClick={handleItemClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleItemDrop}
            />
          ))}
          
          {!isEditMode && <AddItemButton onClick={handleAddNew} />}
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
              className="modal-surface w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-claude-gray-200 dark:border-claude-gray-700">
                <h3 className="text-lg font-semibold text-claude-gray-800 dark:text-claude-gray-200">
                  {editingItem ? t('quickLaunch.edit') : t('quickLaunch.addNew')}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="neumorphic-button-sm p-2 text-claude-gray-600 dark:text-claude-gray-400"
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
                      "neumorphic-input-premium text-claude-gray-800 dark:text-claude-gray-200",
                      formErrors.name && "!shadow-inset !border-red-500 !bg-red-50/20 dark:!bg-red-900/20"
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
                      "neumorphic-input-premium text-claude-gray-800 dark:text-claude-gray-200",
                      formErrors.url && "!shadow-inset !border-red-500 !bg-red-50/20 dark:!bg-red-900/20"
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
                    className="neumorphic-input-premium text-claude-gray-800 dark:text-claude-gray-200"
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
                  className="neumorphic-button-premium px-4 py-2 text-sm font-medium text-claude-gray-800 dark:text-claude-gray-200"
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