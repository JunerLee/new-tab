import { useState, useCallback, useRef } from 'react'
import { QuickLaunchItem } from '@/types'

// 惊喜功能：创建轻量级音频反馈系统
class DelightfulAudio {
  private context: AudioContext | null = null
  private isEnabled = true

  constructor() {
    try {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (e) {
      this.isEnabled = false
    }
  }

  // iOS风格长按进入编辑模式音效
  playEditModeEnter() {
    if (!this.isEnabled || !this.context) return
    
    try {
      const oscillator = this.context.createOscillator()
      const gainNode = this.context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.context.destination)
      
      // 制作类似iOS的双音调反馈
      oscillator.frequency.setValueAtTime(800, this.context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.1)
      
      gainNode.gain.setValueAtTime(0, this.context.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.08, this.context.currentTime + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.15)
      
      oscillator.start(this.context.currentTime)
      oscillator.stop(this.context.currentTime + 0.15)
    } catch (e) {
      // 静默失败
    }
  }

  // 成功操作的愉悦音效
  playSuccess() {
    if (!this.isEnabled || !this.context) return
    
    try {
      const frequencies = [523, 659, 784] // C, E, G 和弦
      frequencies.forEach((freq, index) => {
        const oscillator = this.context!.createOscillator()
        const gainNode = this.context!.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.context!.destination)
        
        oscillator.frequency.setValueAtTime(freq, this.context!.currentTime)
        gainNode.gain.setValueAtTime(0, this.context!.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.03, this.context!.currentTime + index * 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.context!.currentTime + 0.3)
        
        oscillator.start(this.context!.currentTime + index * 0.05)
        oscillator.stop(this.context!.currentTime + 0.3)
      })
    } catch (e) {
      // 静默失败
    }
  }

  // 轻柔的点击反馈
  playTapFeedback() {
    if (!this.isEnabled || !this.context) return
    
    try {
      const oscillator = this.context.createOscillator()
      const gainNode = this.context.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(this.context.destination)
      
      oscillator.frequency.setValueAtTime(1200, this.context.currentTime)
      gainNode.gain.setValueAtTime(0, this.context.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.05, this.context.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.08)
      
      oscillator.start(this.context.currentTime)
      oscillator.stop(this.context.currentTime + 0.08)
    } catch (e) {
      // 静默失败
    }
  }
}

// 触觉反馈系统
class HapticFeedback {
  // iOS风格的丰富触觉模式
  static editModeEnter() {
    if ('vibrate' in navigator) {
      // 双重脉冲表示进入特殊模式
      navigator.vibrate([80, 40, 120])
    }
  }

  static success() {
    if ('vibrate' in navigator) {
      // 成功的三重轻拍
      navigator.vibrate([30, 20, 30, 20, 50])
    }
  }

  static lightTap() {
    if ('vibrate' in navigator) {
      navigator.vibrate(25)
    }
  }

  static mediumTap() {
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
  }
}

// 创建全局实例
const delightfulAudio = new DelightfulAudio()

interface UseQuickLaunchEditReturn {
  isEditMode: boolean
  editingItemId: string | null
  longPressTimer: React.MutableRefObject<NodeJS.Timeout | null>
  isDragging: boolean
  draggedItem: QuickLaunchItem | null
  dragOverIndex: number | null
  
  // 交互方法
  handleItemPress: (item: QuickLaunchItem, event: React.MouseEvent | React.TouchEvent) => void
  handleItemRelease: () => void
  handleItemClick: (item: QuickLaunchItem) => void
  enterEditMode: () => void
  exitEditMode: () => void
  
  // 拖拽方法
  handleDragStart: (item: QuickLaunchItem, event: React.DragEvent) => void
  handleDragOver: (index: number, event: React.DragEvent) => void
  handleDragEnd: () => void
  handleDrop: (targetIndex: number, event: React.DragEvent) => void
}

export function useQuickLaunchEdit(): UseQuickLaunchEditReturn {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<QuickLaunchItem | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const pressStartTime = useRef<number>(0)
  
  const LONG_PRESS_DURATION = 600 // 600ms 长按触发时间
  
  // 追踪连续交互以触发惊喜
  const consecutiveInteractions = useRef(0)
  const lastInteractionTime = useRef(0)
  
  // 惊喜阈值：连续5次快速交互触发彩蛋
  const SURPRISE_THRESHOLD = 5
  const INTERACTION_WINDOW = 2000 // 2秒内的交互视为连续

  const handleItemPress = useCallback((item: QuickLaunchItem, event: React.MouseEvent | React.TouchEvent) => {
    // 防止默认行为和事件冒泡
    event.preventDefault()
    event.stopPropagation()
    
    pressStartTime.current = Date.now()
    setEditingItemId(item.id)
    
    // 轻柔的触觉反馈表示识别到按压
    HapticFeedback.lightTap()
    
    // 追踪连续交互以触发惊喜
    const now = Date.now()
    if (now - lastInteractionTime.current < INTERACTION_WINDOW) {
      consecutiveInteractions.current++
    } else {
      consecutiveInteractions.current = 1
    }
    lastInteractionTime.current = now
    
    // 清除之前的定时器
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    
    // 设置长按定时器
    longPressTimer.current = setTimeout(() => {
      enterEditMode()
      
      // iOS风格触觉和音频反馈
      HapticFeedback.editModeEnter()
      delightfulAudio.playEditModeEnter()
      
      // 惊喜功能：连续交互触发特殊效果
      if (consecutiveInteractions.current >= SURPRISE_THRESHOLD) {
        triggerSurpriseAnimation()
        consecutiveInteractions.current = 0
      }
    }, LONG_PRESS_DURATION)
  }, [])

  const handleItemRelease = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setEditingItemId(null)
  }, [])

  const handleItemClick = useCallback((item: QuickLaunchItem) => {
    const pressDuration = Date.now() - pressStartTime.current
    
    // 如果不是编辑模式且没有长按，则打开链接
    if (!isEditMode && pressDuration < LONG_PRESS_DURATION) {
      // 成功打开链接的愉悦反馈
      HapticFeedback.success()
      delightfulAudio.playTapFeedback()
      
      window.open(item.url, '_blank')
    }
  }, [isEditMode])

  const enterEditMode = useCallback(() => {
    setIsEditMode(true)
  }, [])

  const exitEditMode = useCallback(() => {
    setIsEditMode(false)
    setEditingItemId(null)
    setIsDragging(false)
    setDraggedItem(null)
    setDragOverIndex(null)
  }, [])

  const handleDragStart = useCallback((item: QuickLaunchItem, event: React.DragEvent) => {
    if (!isEditMode) return
    
    setIsDragging(true)
    setDraggedItem(item)
    
    // 设置拖拽数据
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
    
    // 设置自定义拖拽图像（可选）
    const dragImage = event.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.transform = 'rotate(5deg)'
    dragImage.style.opacity = '0.8'
    event.dataTransfer.setDragImage(dragImage, 40, 40)
  }, [isEditMode])

  const handleDragOver = useCallback((index: number, event: React.DragEvent) => {
    if (!isDragging) return
    
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }, [isDragging])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    setDraggedItem(null)
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback((targetIndex: number, event: React.DragEvent) => {
    event.preventDefault()
    
    if (!draggedItem) return
    
    // 成功拖拽的愉悦反馈
    HapticFeedback.success()
    delightfulAudio.playSuccess()
    
    // 这个方法会在QuickLaunchGrid中调用reorderQuickLaunch
    // 所以这里只是清理状态
    setIsDragging(false)
    setDraggedItem(null)
    setDragOverIndex(null)
  }, [draggedItem])

  // 惊喜动画触发器
  const triggerSurpriseAnimation = useCallback(() => {
    // 创建彩蛋动画元素
    const createConfetti = () => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
      const confettiCount = 15
      
      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div')
        confetti.style.cssText = `
          position: fixed;
          width: 8px;
          height: 8px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          left: ${Math.random() * window.innerWidth}px;
          top: -10px;
          animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        `
        
        document.body.appendChild(confetti)
        
        setTimeout(() => {
          if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti)
          }
        }, 5000)
      }
    }
    
    // 添加CSS动画
    if (!document.getElementById('confetti-animation')) {
      const style = document.createElement('style')
      style.id = 'confetti-animation'
      style.textContent = `
        @keyframes confettiFall {
          to {
            transform: translateY(calc(100vh + 10px)) rotate(720deg);
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
    }
    
    createConfetti()
    
    // 播放庆祝音效
    delightfulAudio.playSuccess()
    HapticFeedback.success()
  }, [])

  return {
    isEditMode,
    editingItemId,
    longPressTimer,
    isDragging,
    draggedItem,
    dragOverIndex,
    consecutiveInteractions: consecutiveInteractions.current,
    
    handleItemPress,
    handleItemRelease,
    handleItemClick,
    enterEditMode,
    exitEditMode,
    triggerSurpriseAnimation,
    
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  }
}