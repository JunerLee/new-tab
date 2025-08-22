/**
 * 季节性特效组件
 * 为特殊日期和时间段添加愉悦的背景效果
 */

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SeasonalEffectsProps {
  isVisible?: boolean
  className?: string
}

export function SeasonalEffects({ isVisible = true, className = "" }: SeasonalEffectsProps) {
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring')
  const [isSpecialDate, setIsSpecialDate] = useState(false)
  const [specialDateType, setSpecialDateType] = useState<'christmas' | 'newyear' | 'valentine' | 'halloween' | null>(null)

  // 检测当前季节和特殊日期
  useEffect(() => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()

    // 季节检测
    if (month >= 3 && month <= 5) setCurrentSeason('spring')
    else if (month >= 6 && month <= 8) setCurrentSeason('summer')
    else if (month >= 9 && month <= 11) setCurrentSeason('autumn')
    else setCurrentSeason('winter')

    // 特殊日期检测
    if (month === 12 && day === 25) {
      setIsSpecialDate(true)
      setSpecialDateType('christmas')
    } else if (month === 1 && day === 1) {
      setIsSpecialDate(true)
      setSpecialDateType('newyear')
    } else if (month === 2 && day === 14) {
      setIsSpecialDate(true)
      setSpecialDateType('valentine')
    } else if (month === 10 && day === 31) {
      setIsSpecialDate(true)
      setSpecialDateType('halloween')
    } else {
      setIsSpecialDate(false)
      setSpecialDateType(null)
    }
  }, [])

  // 特殊日期效果配置
  const specialEffects = useMemo(() => {
    if (!isSpecialDate || !specialDateType) return null

    const effects = {
      christmas: {
        particles: ['❄️', '🎄', '⭐', '🎁'],
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
        background: 'radial-gradient(circle at 30% 20%, rgba(255, 215, 0, 0.05) 0%, transparent 60%)'
      },
      newyear: {
        particles: ['🎊', '🎉', '✨', '🌟'],
        colors: ['#FFD700', '#FF69B4', '#00CED1', '#98FB98'],
        background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.08) 0%, transparent 70%)'
      },
      valentine: {
        particles: ['💖', '🌹', '💕', '💝'],
        colors: ['#FF69B4', '#FF1493', '#FFC0CB', '#FFB6C1'],
        background: 'radial-gradient(circle at 70% 30%, rgba(255, 105, 180, 0.06) 0%, transparent 60%)'
      },
      halloween: {
        particles: ['🎃', '👻', '🦇', '🕷️'],
        colors: ['#FF8C00', '#8B4513', '#2F4F4F', '#696969'],
        background: 'radial-gradient(circle at 80% 20%, rgba(255, 140, 0, 0.06) 0%, transparent 60%)'
      }
    }

    return effects[specialDateType]
  }, [isSpecialDate, specialDateType])

  // 时间感知动画强度
  const getTimeBasedIntensity = useMemo(() => {
    const hour = new Date().getHours()
    
    // 深夜和清晨更安静
    if (hour >= 22 || hour <= 6) return 0.3
    
    // 黄金时间更活跃
    if ((hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 20)) return 0.8
    
    // 白天正常
    return 0.6
  }, [])

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
      {/* 特殊日期背景效果 */}
      <AnimatePresence>
        {isSpecialDate && specialEffects && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: getTimeBasedIntensity }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: specialEffects.background,
              filter: 'blur(0.5px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* 浮动粒子效果 */}
      <AnimatePresence>
        {isSpecialDate && specialEffects && (
          <>
            {Array.from({ length: Math.floor(8 * getTimeBasedIntensity) }).map((_, i) => (
              <FloatingParticle
                key={`particle-${i}`}
                particle={specialEffects.particles[i % specialEffects.particles.length] || '❄️'}
                color={specialEffects.colors[i % specialEffects.colors.length] || '#ffffff'}
                delay={i * 0.5}
                intensity={getTimeBasedIntensity}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* 季节性微妙背景变化 */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: currentSeason === 'spring' 
            ? 'radial-gradient(circle at 20% 80%, rgba(144, 238, 144, 0.02) 0%, transparent 50%)'
            : currentSeason === 'summer'
            ? 'radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.02) 0%, transparent 50%)'
            : currentSeason === 'autumn'
            ? 'radial-gradient(circle at 60% 40%, rgba(255, 165, 0, 0.02) 0%, transparent 50%)'
            : 'radial-gradient(circle at 40% 60%, rgba(173, 216, 230, 0.02) 0%, transparent 50%)'
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />
    </div>
  )
}

// 浮动粒子组件
interface FloatingParticleProps {
  particle: string
  color: string
  delay: number
  intensity: number
}

function FloatingParticle({ particle, color, delay, intensity }: FloatingParticleProps) {
  const startX = Math.random() * window.innerWidth
  const startY = window.innerHeight + 50
  const endY = -50
  const drift = (Math.random() - 0.5) * 100

  return (
    <motion.div
      initial={{
        x: startX,
        y: startY,
        opacity: 0,
        scale: 0.5,
        rotate: 0
      }}
      animate={{
        x: startX + drift,
        y: endY,
        opacity: [0, intensity, intensity, 0],
        scale: [0.5, 1, 1, 0.5],
        rotate: 360
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        delay: delay,
        ease: 'easeOut',
        repeat: Infinity,
        repeatDelay: Math.random() * 10
      }}
      className="absolute text-lg select-none"
      style={{
        filter: `drop-shadow(0 0 4px ${color}40)`,
        fontSize: `${14 + Math.random() * 8}px`
      }}
    >
      {particle}
    </motion.div>
  )
}

// 导出季节性效果钩子
export function useSeasonalEffects() {
  const [effects, setEffects] = useState({
    isSpecialDate: false,
    season: 'spring' as 'spring' | 'summer' | 'autumn' | 'winter',
    specialType: null as string | null,
    intensity: 0.6
  })

  useEffect(() => {
    const updateEffects = () => {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()
      const hour = now.getHours()

      // 季节检测
      let season: 'spring' | 'summer' | 'autumn' | 'winter' = 'spring'
      if (month >= 3 && month <= 5) season = 'spring'
      else if (month >= 6 && month <= 8) season = 'summer'
      else if (month >= 9 && month <= 11) season = 'autumn'
      else season = 'winter'

      // 特殊日期检测
      let isSpecialDate = false
      let specialType = null
      
      if (month === 12 && day === 25) {
        isSpecialDate = true
        specialType = 'christmas'
      } else if (month === 1 && day === 1) {
        isSpecialDate = true
        specialType = 'newyear'
      } else if (month === 2 && day === 14) {
        isSpecialDate = true
        specialType = 'valentine'
      } else if (month === 10 && day === 31) {
        isSpecialDate = true
        specialType = 'halloween'
      }

      // 时间强度
      let intensity = 0.6
      if (hour >= 22 || hour <= 6) intensity = 0.3
      else if ((hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 20)) intensity = 0.8

      setEffects({ isSpecialDate, season, specialType, intensity })
    }

    updateEffects()
    const interval = setInterval(updateEffects, 60000) // 每分钟检查一次

    return () => clearInterval(interval)
  }, [])

  return effects
}