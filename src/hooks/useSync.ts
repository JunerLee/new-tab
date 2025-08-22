import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  SyncState, 
  SyncSettings, 
  SyncResult, 
  SyncEvent, 
  SyncHistory,
  WebDAVConfig
} from '@/types/sync'
import { SyncManager } from '@/utils/sync/syncManager'
import { LocalSyncProvider } from '@/utils/sync/localSync'
import { useAppStore } from '@/stores/useAppStore'

const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  enabled: false,
  autoSync: false,
  syncInterval: 60, // 1 小时
  providers: [],
  conflictResolution: 'latest',
  retryAttempts: 3,
  retryDelay: 30
}

export function useSync() {
  const [syncState, setSyncState] = useState<SyncState>({ status: 'idle' })
  const [syncSettings, setSyncSettings] = useState<SyncSettings>(DEFAULT_SYNC_SETTINGS)
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([])
  const [isConnecting, setIsConnecting] = useState(false)
  
  const syncManagerRef = useRef<SyncManager | null>(null)
  
  const { 
    settings, 
    quickLaunch, 
    customSearchEngines,
    updateSettings,
    exportData,
    importData
  } = useAppStore()

  // 初始化同步管理器
  useEffect(() => {
    // 从存储中加载同步设置
    const stored = localStorage.getItem('newTab_syncSettings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSyncSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to load sync settings:', error)
      }
    }

    // 加载同步历史
    setSyncHistory(LocalSyncProvider.getSyncHistory())
  }, [])

  // 当设置改变时创建/更新同步管理器
  useEffect(() => {
    if (syncSettings.enabled) {
      if (syncManagerRef.current) {
        syncManagerRef.current.destroy()
      }
      
      syncManagerRef.current = new SyncManager(syncSettings)
      
      // 监听同步事件
      const handleSyncEvent = (event: SyncEvent) => {
        switch (event.type) {
          case 'sync-start':
            setSyncState(prev => ({ ...prev, status: 'syncing' }))
            break
          case 'sync-progress':
            setSyncState(prev => ({ ...prev, progress: event.data?.progress }))
            break
          case 'sync-success':
            setSyncState(prev => ({ 
              ...prev, 
              status: 'success', 
              lastSync: event.timestamp,
              lastError: undefined
            }))
            // 刷新同步历史
            setSyncHistory(LocalSyncProvider.getSyncHistory())
            break
          case 'sync-error':
            setSyncState(prev => ({ 
              ...prev, 
              status: 'error', 
              lastError: event.error 
            }))
            break
          case 'conflict-detected':
            setSyncState(prev => ({ 
              ...prev, 
              conflictData: event.data?.conflicts 
            }))
            break
        }
      }

      syncManagerRef.current.addEventListener(handleSyncEvent)
      
      // 如果启用，启动自动同步
      if (syncSettings.autoSync) {
        syncManagerRef.current.startAutoSync()
      }
    } else {
      // 禁用同步时清理
      if (syncManagerRef.current) {
        syncManagerRef.current.destroy()
        syncManagerRef.current = null
      }
      setSyncState({ status: 'idle' })
    }

    return () => {
      if (syncManagerRef.current) {
        syncManagerRef.current.destroy()
        syncManagerRef.current = null
      }
    }
  }, [syncSettings])

  // 将同步设置保存到存储
  useEffect(() => {
    localStorage.setItem('newTab_syncSettings', JSON.stringify(syncSettings))
  }, [syncSettings])

  /**
   * 更新同步设置
   */
  const updateSyncSettings = useCallback((newSettings: Partial<SyncSettings>) => {
    setSyncSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  /**
   * 执行手动同步
   */
  const performSync = useCallback(async (): Promise<SyncResult> => {
    if (!syncManagerRef.current) {
      return {
        success: false,
        message: 'Sync manager not initialized'
      }
    }

    return syncManagerRef.current.sync(settings, quickLaunch, customSearchEngines)
  }, [settings, quickLaunch, customSearchEngines])

  /**
   * 测试到 WebDAV 服务器的连接
   */
  const testWebDAVConnection = useCallback(async (config: WebDAVConfig): Promise<boolean> => {
    setIsConnecting(true)
    try {
      // 创建临时同步管理器来测试连接
      const testSettings: SyncSettings = {
        ...DEFAULT_SYNC_SETTINGS,
        providers: [{
          name: 'test',
          type: 'webdav',
          config,
          enabled: true
        }],
        activeProvider: 'test'
      }
      
      const testManager = new SyncManager(testSettings)
      const result = await testManager.testConnection()
      testManager.destroy()
      
      return result
    } catch (error) {
      console.error('WebDAV connection test failed:', error)
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [])

  /**
   * 添加 WebDAV 提供程序
   */
  const addWebDAVProvider = useCallback((name: string, config: WebDAVConfig) => {
    const newProvider = {
      name,
      type: 'webdav' as const,
      config,
      enabled: true
    }

    setSyncSettings(prev => ({
      ...prev,
      providers: [...prev.providers.filter(p => p.name !== name), newProvider],
      activeProvider: name,
      enabled: true
    }))
  }, [])

  /**
   * 移除同步提供程序
   */
  const removeProvider = useCallback((name: string) => {
    setSyncSettings(prev => ({
      ...prev,
      providers: prev.providers.filter(p => p.name !== name),
      activeProvider: prev.activeProvider === name ? undefined : prev.activeProvider
    }))
  }, [])

  /**
   * 将数据导出到文件
   */
  const exportToFile = useCallback((filename?: string) => {
    const data = LocalSyncProvider.exportData(settings, quickLaunch, customSearchEngines)
    LocalSyncProvider.downloadAsFile(data, filename)
    
    // 更新同步历史
    setSyncHistory(LocalSyncProvider.getSyncHistory())
  }, [settings, quickLaunch, customSearchEngines])

  /**
   * 从文件导入数据
   */
  const importFromFile = useCallback(async (): Promise<SyncResult> => {
    try {
      const fileContent = await LocalSyncProvider.readFileFromInput()
      const result = LocalSyncProvider.importData(fileContent)
      
      if (result.success && result.syncedData) {
        // 使用导入数据更新应用存储
        updateSettings(result.syncedData.settings)
        importData(JSON.stringify({
          settings: result.syncedData.settings,
          quickLaunch: result.syncedData.quickLaunch,
          customSearchEngines: result.syncedData.customSearchEngines
        }))
      }
      
      // 更新同步历史
      setSyncHistory(LocalSyncProvider.getSyncHistory())
      
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed'
      return {
        success: false,
        message: errorMessage
      }
    }
  }, [updateSettings, importData])

  /**
   * 清除同步历史
   */
  const clearHistory = useCallback(() => {
    LocalSyncProvider.clearSyncHistory()
    setSyncHistory([])
  }, [])

  /**
   * 获取同步统计信息
   */
  const getSyncStats = useCallback(() => {
    return LocalSyncProvider.getSyncStats()
  }, [])

  /**
   * 启用/禁用同步
   */
  const toggleSync = useCallback((enabled: boolean) => {
    setSyncSettings(prev => ({ ...prev, enabled }))
  }, [])

  /**
   * 启用/禁用自动同步
   */
  const toggleAutoSync = useCallback((autoSync: boolean) => {
    setSyncSettings(prev => ({ ...prev, autoSync }))
  }, [])

  /**
   * 设置活跃提供程序
   */
  const setActiveProvider = useCallback((providerName: string) => {
    setSyncSettings(prev => ({ ...prev, activeProvider: providerName }))
  }, [])

  /**
   * 获取可用设备（用于 WebDAV）
   */
  const getAvailableDevices = useCallback(async () => {
    if (!syncManagerRef.current) {
      return []
    }
    return syncManagerRef.current.getAvailableDevices()
  }, [])

  /**
   * 创建带时间戳的备份
   */
  const createBackup = useCallback(() => {
    LocalSyncProvider.createTimestampedBackup(settings, quickLaunch, customSearchEngines)
    setSyncHistory(LocalSyncProvider.getSyncHistory())
  }, [settings, quickLaunch, customSearchEngines])

  return {
    // 状态
    syncState,
    syncSettings,
    syncHistory,
    isConnecting,
    
    // 操作
    updateSyncSettings,
    performSync,
    testWebDAVConnection,
    addWebDAVProvider,
    removeProvider,
    exportToFile,
    importFromFile,
    clearHistory,
    getSyncStats,
    toggleSync,
    toggleAutoSync,
    setActiveProvider,
    getAvailableDevices,
    createBackup,
    
    // 计算属性
    isEnabled: syncSettings.enabled,
    isAutoSyncEnabled: syncSettings.autoSync,
    activeProvider: syncSettings.activeProvider,
    hasProviders: syncSettings.providers.length > 0,
    isSyncing: syncState.status === 'syncing'
  }
}