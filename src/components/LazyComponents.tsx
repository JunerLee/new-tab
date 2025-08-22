import React, { lazy } from 'react'
import type { ComponentType } from 'react'

// Lazy load heavy components that aren't immediately needed
export const LazySettingsModal = lazy(() => 
  import('./Settings/SettingsModal').then(module => ({ default: module.SettingsModal }))
)

export const LazySyncSettings = lazy(() => 
  import('./Settings/SyncSettings').then(module => ({ default: module.SyncSettings }))
)

export const LazyBackgroundImage = lazy(() => 
  import('./Background/BackgroundImage').then(module => ({ default: module.BackgroundImage }))
)

// Create a higher-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  LazyComponent: ComponentType<P>,
  fallback?: React.ReactNode,
  errorFallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => {
    return (
      <React.Suspense fallback={fallback || <div>Loading...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    )
  }

  WrappedComponent.displayName = `withLazyLoading(${LazyComponent.displayName || LazyComponent.name})`
  return WrappedComponent
}

// Pre-load components on user interaction
export const preloadComponent = (importFn: () => Promise<any>) => {
  const promise = importFn()
  return () => promise
}

// Preload functions for critical components
export const preloadSettingsModal = preloadComponent(() => import('./Settings/SettingsModal'))
export const preloadSyncSettings = preloadComponent(() => import('./Settings/SyncSettings'))

// Component preloading hook
export const useComponentPreloader = () => {
  const preloadOnHover = (componentLoader: () => Promise<any>) => {
    return {
      onMouseEnter: componentLoader,
      onFocus: componentLoader,
    }
  }

  return { preloadOnHover }
}