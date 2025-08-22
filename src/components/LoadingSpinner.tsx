import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse'
  text?: string
  fullScreen?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

const SpinnerVariant: React.FC<{ size: string; className?: string }> = ({
  size,
  className,
}) => (
  <Loader2 className={cn(size, 'animate-spin', className)} />
)

const DotsVariant: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex space-x-1', className)}>
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-2 h-2 bg-current rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
)

const PulseVariant: React.FC<{ size: string; className?: string }> = ({
  size,
  className,
}) => (
  <motion.div
    className={cn(size, 'bg-current rounded-full', className)}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
    }}
  />
)

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className,
}) => {
  const sizeClass = sizeClasses[size]
  
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant className={className} />
      case 'pulse':
        return <PulseVariant size={sizeClass} className={className} />
      default:
        return <SpinnerVariant size={sizeClass} className={className} />
    }
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="text-gray-600 dark:text-gray-400">
        {renderVariant()}
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 dark:text-gray-400 text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        {content}
      </motion.div>
    )
  }

  return content
}

// Loading skeleton components
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  lines?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 animate-pulse'
  
  const variantClasses = {
    text: 'h-4 rounded',
    rectangular: 'rounded',
    circular: 'rounded-full',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variantClasses[variant],
              i === lines - 1 && 'w-3/4', // Last line is shorter
              className
            )}
            style={style}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  )
}

// Suspense fallback components
export const SuspenseFallback: React.FC<{
  text?: string
  variant?: LoadingSpinnerProps['variant']
}> = ({ text = 'Loading...', variant = 'spinner' }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner variant={variant} text={text} />
  </div>
)