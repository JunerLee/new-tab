import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'

/**
 * 背景效果组件 - 负责应用透明度和模糊效果
 * 通过CSS变量动态控制背景图片的视觉效果
 */
export function BackgroundEffects() {
  const { settings } = useAppStore()

  useEffect(() => {
    // 获取根元素以设置CSS变量
    const root = document.documentElement

    // 应用背景透明度设置
    const opacity = settings.background.opacity / 100
    root.style.setProperty('--bg-opacity', opacity.toString())
    
    // 应用背景模糊设置
    const blur = settings.background.blurAmount
    root.style.setProperty('--bg-blur', `${blur}px`)
    
    // 为拟物化效果设置动态变量
    root.style.setProperty('--dynamic-opacity', opacity.toString())
    root.style.setProperty('--dynamic-blur', `${blur}px`)
    
    // 根据透明度调整界面元素的对比度
    const contrast = opacity < 0.5 ? 'high' : 'normal'
    root.style.setProperty('--ui-contrast', contrast)

    // 清理函数
    return () => {
      root.style.removeProperty('--bg-opacity')
      root.style.removeProperty('--bg-blur')
      root.style.removeProperty('--dynamic-opacity')
      root.style.removeProperty('--dynamic-blur')
      root.style.removeProperty('--ui-contrast')
    }
  }, [settings.background.opacity, settings.background.blurAmount])

  // 这个组件不渲染任何可见内容，只负责设置CSS变量
  return null
}