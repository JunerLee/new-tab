/**
 * 成就系统组件
 * 为用户操作提供令人愉悦的成就反馈
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { celebrateSuccess } from '@/utils/delightfulAnimations'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

interface AchievementToastProps {
  achievement: Achievement
  onClose: () => void
}

function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600'
  }

  const rarityGlow = {
    common: 'drop-shadow(0 0 8px rgba(156, 163, 175, 0.3))',
    rare: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.4))',
    epic: 'drop-shadow(0 0 16px rgba(147, 51, 234, 0.5))',
    legendary: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.6))'
  }

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0.8, 
        x: 300,
        rotate: 15
      }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        x: 0,
        rotate: 0
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.9, 
        x: 300,
        rotate: -15,
        transition: { duration: 0.3 }
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <motion.div
        className={`
          relative p-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2
          bg-gradient-to-br ${rarityColors[achievement.rarity]}
          border-white/20 text-white overflow-hidden
        `}
        style={{
          filter: rarityGlow[achievement.rarity]
        }}
        animate={{
          boxShadow: [
            `0 8px 32px rgba(0,0,0,0.3)`,
            `0 12px 40px rgba(0,0,0,0.4)`,
            `0 8px 32px rgba(0,0,0,0.3)`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* 背景光效 */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 内容 */}
        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <motion.div
              className="text-3xl flex-shrink-0"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut"
              }}
            >
              {achievement.icon}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-bold text-lg leading-tight">
                  成就解锁！
                </h3>
                <h4 className="font-semibold text-base mt-1 text-white/90">
                  {achievement.title}
                </h4>
                <p className="text-sm text-white/80 mt-1 leading-snug">
                  {achievement.description}
                </p>
              </motion.div>
            </div>
            
            <motion.button
              onClick={onClose}
              className="text-white/60 hover:text-white/90 text-lg leading-none"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          </div>
          
          {/* 稀有度指示器 */}
          <motion.div
            className="mt-3 flex items-center gap-1"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {Array.from({ length: achievement.rarity === 'legendary' ? 5 : achievement.rarity === 'epic' ? 4 : achievement.rarity === 'rare' ? 3 : 2 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                ⭐
              </motion.div>
            ))}
            <span className="ml-2 text-xs uppercase tracking-wide font-semibold">
              {achievement.rarity}
            </span>
          </motion.div>
        </div>
        
        {/* 粒子效果 */}
        {achievement.rarity === 'legendary' && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                initial={{
                  x: "50%",
                  y: "50%",
                  scale: 0
                }}
                animate={{
                  x: `${20 + Math.random() * 60}%`,
                  y: `${20 + Math.random() * 60}%`,
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

interface AchievementSystemProps {
  achievements: Achievement[]
  onAchievementUnlock?: (achievement: Achievement) => void
}

export function AchievementSystem({ achievements, onAchievementUnlock }: AchievementSystemProps) {
  const [activeToasts, setActiveToasts] = useState<Achievement[]>([])

  // 检测新解锁的成就
  useEffect(() => {
    achievements.forEach(achievement => {
      if (achievement.unlocked && achievement.unlockedAt && 
          Date.now() - achievement.unlockedAt.getTime() < 1000) {
        
        // 避免重复显示
        if (!activeToasts.find(toast => toast.id === achievement.id)) {
          setActiveToasts(prev => [...prev, achievement])
          
          // 播放庆祝效果
          setTimeout(() => {
            celebrateSuccess({ x: window.innerWidth - 150, y: 100 })
          }, 200)
          
          onAchievementUnlock?.(achievement)
        }
      }
    })
  }, [achievements, activeToasts, onAchievementUnlock])

  const removeToast = useCallback((achievementId: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== achievementId))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {activeToasts.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            style={{
              transform: `translateY(${index * 120}px)`
            }}
            className="pointer-events-auto"
          >
            <AchievementToast
              achievement={achievement}
              onClose={() => removeToast(achievement.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// 预定义的成就
export const defaultAchievements: Achievement[] = [
  {
    id: 'first-launch',
    title: '初来乍到',
    description: '首次打开新标签页',
    icon: '🚀',
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'first-custom-item',
    title: '个性定制',
    description: '添加第一个自定义快速启动项',
    icon: '⭐',
    rarity: 'common',
    unlocked: false
  },
  {
    id: 'edit-master',
    title: '编辑大师',
    description: '进入编辑模式10次',
    icon: '✏️',
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'organization-expert',
    title: '整理专家',
    description: '重新排列快速启动项50次',
    icon: '📐',
    rarity: 'rare',
    unlocked: false,
    progress: 0,
    maxProgress: 50
  },
  {
    id: 'power-user',
    title: '高级用户',
    description: '拥有20个自定义快速启动项',
    icon: '💎',
    rarity: 'epic',
    unlocked: false,
    progress: 0,
    maxProgress: 20
  },
  {
    id: 'combo-master',
    title: '连击高手',
    description: '连续快速点击触发5次特效',
    icon: '🔥',
    rarity: 'epic',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'daily-visitor',
    title: '每日访客',
    description: '连续7天使用新标签页',
    icon: '📅',
    rarity: 'epic',
    unlocked: false,
    progress: 0,
    maxProgress: 7
  },
  {
    id: 'legend',
    title: '传奇用户',
    description: '使用新标签页超过100天',
    icon: '👑',
    rarity: 'legendary',
    unlocked: false,
    progress: 0,
    maxProgress: 100
  }
]

// 成就进度更新函数
export function updateAchievementProgress(
  achievements: Achievement[], 
  achievementId: string, 
  increment: number = 1
): Achievement[] {
  return achievements.map(achievement => {
    if (achievement.id === achievementId && !achievement.unlocked) {
      const newProgress = (achievement.progress || 0) + increment
      const shouldUnlock = achievement.maxProgress && newProgress >= achievement.maxProgress

      return {
        ...achievement,
        progress: newProgress,
        unlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? new Date() : achievement.unlockedAt
      }
    }
    return achievement
  })
}

// 成就解锁函数
export function unlockAchievement(achievements: Achievement[], achievementId: string): Achievement[] {
  return achievements.map(achievement => {
    if (achievement.id === achievementId && !achievement.unlocked) {
      return {
        ...achievement,
        unlocked: true,
        unlockedAt: new Date()
      }
    }
    return achievement
  })
}