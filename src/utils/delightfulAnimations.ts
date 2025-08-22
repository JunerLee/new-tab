/**
 * 令人愉悦的动画效果工具库
 * iOS风格的微交互和惊喜时刻
 */

export interface DelightfulAnimationConfig {
  duration?: number
  easing?: string
  delay?: number
  intensity?: 'subtle' | 'medium' | 'intense'
}

export class DelightfulAnimations {
  private static instance: DelightfulAnimations
  private preferredMotion: boolean = true

  constructor() {
    // 检查用户的动画偏好设置
    this.preferredMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  static getInstance(): DelightfulAnimations {
    if (!DelightfulAnimations.instance) {
      DelightfulAnimations.instance = new DelightfulAnimations()
    }
    return DelightfulAnimations.instance
  }

  /**
   * 创建彩蛋庆祝动画 - 彩虹粒子爆炸效果
   */
  triggerCelebration(origin?: { x: number; y: number }): void {
    if (!this.preferredMotion) return

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8E8', '#F7DC6F']
    const particles = 20
    const container = document.body

    // 如果没有提供原点，使用屏幕中心
    const centerX = origin?.x || window.innerWidth / 2
    const centerY = origin?.y || window.innerHeight / 2

    for (let i = 0; i < particles; i++) {
      const particle = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]
      const angle = (360 / particles) * i
      const velocity = 2 + Math.random() * 3
      const size = 4 + Math.random() * 6

      particle.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        left: ${centerX}px;
        top: ${centerY}px;
        box-shadow: 0 0 6px ${color}40;
        animation: particleExplode${i} 2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
      `

      // 为每个粒子创建独特的动画
      const keyframes = `
        @keyframes particleExplode${i} {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(${Math.cos(angle * Math.PI / 180) * (100 + Math.random() * 100)}px, 
                                 ${Math.sin(angle * Math.PI / 180) * (100 + Math.random() * 100) + 50}px) 
                       scale(0) rotate(720deg);
            opacity: 0;
          }
        }
      `

      const style = document.createElement('style')
      style.textContent = keyframes
      document.head.appendChild(style)

      container.appendChild(particle)

      // 清理粒子和样式
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style)
        }
      }, 2100)
    }

    // 添加中央爆炸效果
    this.createCentralBurst(centerX, centerY)
  }

  /**
   * 创建中央爆炸效果
   */
  private createCentralBurst(x: number, y: number): void {
    const burst = document.createElement('div')
    burst.style.cssText = `
      position: fixed;
      left: ${x - 25}px;
      top: ${y - 25}px;
      width: 50px;
      height: 50px;
      border: 3px solid #FFD700;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      animation: burstExpand 0.6s ease-out forwards;
    `

    const burstKeyframes = `
      @keyframes burstExpand {
        0% {
          transform: scale(0);
          opacity: 1;
          border-width: 3px;
        }
        100% {
          transform: scale(4);
          opacity: 0;
          border-width: 0;
        }
      }
    `

    const style = document.createElement('style')
    style.textContent = burstKeyframes
    document.head.appendChild(style)

    document.body.appendChild(burst)

    setTimeout(() => {
      if (burst.parentNode) {
        burst.parentNode.removeChild(burst)
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }, 600)
  }

  /**
   * 成功反馈涟漪效果
   */
  createSuccessRipple(element: HTMLElement, color: string = '#10b981'): void {
    if (!this.preferredMotion) return

    const rect = element.getBoundingClientRect()
    const ripple = document.createElement('div')

    ripple.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      width: 0;
      height: 0;
      border: 2px solid ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      animation: successRipple 0.6s ease-out forwards;
      transform: translate(-50%, -50%);
    `

    document.body.appendChild(ripple)

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple)
      }
    }, 600)
  }

  /**
   * 长按进度指示器
   */
  createLongPressIndicator(element: HTMLElement, duration: number = 600): () => void {
    if (!this.preferredMotion) {
      return () => {} // 返回空的清理函数
    }

    const indicator = document.createElement('div')
    const rect = element.getBoundingClientRect()

    indicator.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      width: 0;
      height: 0;
      border: 3px solid rgba(59, 130, 246, 0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      animation: longPressGrow ${duration}ms linear forwards;
    `

    const keyframes = `
      @keyframes longPressGrow {
        0% {
          width: 0;
          height: 0;
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        100% {
          width: ${Math.max(rect.width, rect.height) + 20}px;
          height: ${Math.max(rect.width, rect.height) + 20}px;
          opacity: 0.8;
        }
      }
    `

    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)

    document.body.appendChild(indicator)

    // 返回清理函数
    return () => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator)
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }

  /**
   * 拖拽影子效果
   */
  createDragShadow(element: HTMLElement): HTMLElement {
    if (!this.preferredMotion) {
      return element.cloneNode(true) as HTMLElement
    }

    const shadow = element.cloneNode(true) as HTMLElement
    shadow.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.8;
      transform: rotate(3deg) scale(1.02);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
      transition: none;
      animation: dragLift 0.2s ease-out;
    `

    const keyframes = `
      @keyframes dragLift {
        0% {
          transform: rotate(0deg) scale(1);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        100% {
          transform: rotate(3deg) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1);
        }
      }
    `

    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)

    return shadow
  }

  /**
   * 图标弹入动画
   */
  animateIconEntry(element: HTMLElement, delay: number = 0): void {
    if (!this.preferredMotion) {
      element.style.opacity = '1'
      element.style.transform = 'scale(1)'
      return
    }

    element.style.cssText += `
      animation: iconBounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${delay}ms both;
    `

    // 确保关键帧已定义
    if (!document.getElementById('iconBounceInKeyframes')) {
      const keyframes = `
        @keyframes iconBounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(20px) rotateX(-15deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(-5px) rotateX(5deg);
          }
          70% {
            transform: scale(0.95) translateY(2px) rotateX(-2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0deg);
          }
        }
      `

      const style = document.createElement('style')
      style.id = 'iconBounceInKeyframes'
      style.textContent = keyframes
      document.head.appendChild(style)
    }
  }

  /**
   * 季节性特效
   */
  createSeasonalEffect(season: 'spring' | 'summer' | 'autumn' | 'winter'): void {
    if (!this.preferredMotion) return

    const effects = {
      spring: () => this.createFlowerPetals(),
      summer: () => this.createSunbeams(),
      autumn: () => this.createFallingLeaves(),
      winter: () => this.createSnowflakes()
    }

    effects[season]?.()
  }

  private createFlowerPetals(): void {
    const petals = ['🌸', '🌺', '🌼', '🌻']
    this.createFallingElements(petals, 8, 4000, { 
      sway: true,
      rotation: true,
      fadeOut: true
    })
  }

  private createSunbeams(): void {
    const container = document.body
    const sunbeam = document.createElement('div')
    
    sunbeam.style.cssText = `
      position: fixed;
      top: -10%;
      left: -10%;
      width: 120%;
      height: 120%;
      pointer-events: none;
      z-index: -1;
      background: radial-gradient(circle at 30% 20%, 
        rgba(255, 215, 0, 0.1) 0%,
        rgba(255, 165, 0, 0.05) 30%,
        transparent 60%);
      animation: sunbeamRotate 20s linear infinite;
    `

    const keyframes = `
      @keyframes sunbeamRotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `

    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)

    container.appendChild(sunbeam)

    setTimeout(() => {
      if (sunbeam.parentNode) sunbeam.parentNode.removeChild(sunbeam)
      if (style.parentNode) style.parentNode.removeChild(style)
    }, 10000)
  }

  private createFallingLeaves(): void {
    const leaves = ['🍂', '🍁', '🌿', '🍃']
    this.createFallingElements(leaves, 6, 6000, {
      sway: true,
      rotation: true,
      fadeOut: false
    })
  }

  private createSnowflakes(): void {
    const snowflakes = ['❄️', '❅', '✻', '✺']
    this.createFallingElements(snowflakes, 10, 8000, {
      sway: true,
      rotation: false,
      fadeOut: true
    })
  }

  private createFallingElements(
    elements: string[], 
    count: number, 
    duration: number,
    options: { sway: boolean; rotation: boolean; fadeOut: boolean }
  ): void {
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div')
      const emoji = elements[Math.floor(Math.random() * elements.length)]
      const startX = Math.random() * window.innerWidth
      const swayAmount = options.sway ? 30 + Math.random() * 40 : 0
      const rotationAmount = options.rotation ? 360 + Math.random() * 360 : 0

      element.textContent = emoji
      element.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: -50px;
        font-size: ${16 + Math.random() * 12}px;
        pointer-events: none;
        z-index: 1000;
        user-select: none;
        animation: fall${i} ${duration + Math.random() * 2000}ms linear infinite;
      `

      const fallKeyframes = `
        @keyframes fall${i} {
          0% {
            transform: translateY(-50px) translateX(0) rotate(0deg);
            opacity: ${options.fadeOut ? '0' : '1'};
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 50px)) 
                       translateX(${Math.sin(i) * swayAmount}px) 
                       rotate(${rotationAmount}deg);
            opacity: ${options.fadeOut ? '0' : '1'};
          }
        }
      `

      const style = document.createElement('style')
      style.textContent = fallKeyframes
      document.head.appendChild(style)

      document.body.appendChild(element)

      // 清理元素
      setTimeout(() => {
        if (element.parentNode) element.parentNode.removeChild(element)
        if (style.parentNode) style.parentNode.removeChild(style)
      }, duration + 2000)
    }
  }

  /**
   * 错误摇晃动画
   */
  shakeElement(element: HTMLElement, intensity: 'light' | 'medium' | 'strong' = 'medium'): void {
    if (!this.preferredMotion) return

    const intensityMap = {
      light: 2,
      medium: 4,
      strong: 8
    }

    const shakeDistance = intensityMap[intensity]
    element.style.animation = `errorShake${intensity} 0.5s ease-in-out`

    // 确保关键帧存在
    if (!document.getElementById(`shake-${intensity}-keyframes`)) {
      const keyframes = `
        @keyframes errorShake${intensity} {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-${shakeDistance}px); }
          20%, 40%, 60%, 80% { transform: translateX(${shakeDistance}px); }
        }
      `

      const style = document.createElement('style')
      style.id = `shake-${intensity}-keyframes`
      style.textContent = keyframes
      document.head.appendChild(style)
    }

    // 清理动画
    setTimeout(() => {
      element.style.animation = ''
    }, 500)
  }

  /**
   * 动态调整动画强度基于时间
   */
  getTimeBasedIntensity(): 'subtle' | 'medium' | 'intense' {
    const hour = new Date().getHours()
    
    // 早晨和黄昏时光更柔和
    if ((hour >= 5 && hour <= 8) || (hour >= 17 && hour <= 20)) {
      return 'subtle'
    }
    
    // 深夜更安静
    if (hour >= 22 || hour <= 5) {
      return 'subtle'
    }
    
    // 白天更活跃
    return hour >= 9 && hour <= 16 ? 'intense' : 'medium'
  }

  /**
   * 清理所有动画效果
   */
  cleanup(): void {
    // 移除所有临时动画元素
    const animatedElements = document.querySelectorAll('[style*="animation"]')
    animatedElements.forEach(el => {
      if (el.parentNode && !el.closest('.quick-launch-item')) {
        el.parentNode.removeChild(el)
      }
    })

    // 清理动态添加的样式
    const dynamicStyles = document.querySelectorAll('style[id*="keyframes"], style:not([data-emotion])')
    dynamicStyles.forEach(style => {
      if (style.textContent?.includes('@keyframes') && !style.id.includes('permanent')) {
        style.parentNode?.removeChild(style)
      }
    })
  }
}

// 导出单例实例
export const delightfulAnimations = DelightfulAnimations.getInstance()

// 导出便捷函数
export const celebrateSuccess = (origin?: { x: number; y: number }) => 
  delightfulAnimations.triggerCelebration(origin)

export const createRipple = (element: HTMLElement, color?: string) => 
  delightfulAnimations.createSuccessRipple(element, color)

export const shakeOnError = (element: HTMLElement, intensity?: 'light' | 'medium' | 'strong') =>
  delightfulAnimations.shakeElement(element, intensity)