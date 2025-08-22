/**
 * 令人愉悦的效果组件导出
 * 统一管理所有动画和特效组件
 */

// 季节性效果
export { SeasonalEffects, useSeasonalEffects } from './SeasonalEffects'

// 成就系统已移除

// 重新导出动画工具
export { 
  delightfulAnimations,
  celebrateSuccess,
  createRipple,
  shakeOnError 
} from '../../utils/delightfulAnimations'

// 组合式hooks
export function useDelightfulEffects() {
  // const seasonalEffects = useSeasonalEffects()
  
  return {
    // seasonalEffects,
    // 可以在这里添加更多组合逻辑
  }
}

// 效果配置类型
export interface DelightfulEffectsConfig {
  enableSeasonalEffects: boolean
  // enableAchievements: boolean // 已移除
  enableSoundEffects: boolean
  enableHapticFeedback: boolean
  animationIntensity: 'low' | 'medium' | 'high'
  respectReducedMotion: boolean
}

// 默认配置
export const defaultDelightfulConfig: DelightfulEffectsConfig = {
  enableSeasonalEffects: true,
  // enableAchievements: true, // 已移除
  enableSoundEffects: true,
  enableHapticFeedback: true,
  animationIntensity: 'medium',
  respectReducedMotion: true
}