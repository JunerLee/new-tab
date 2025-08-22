import { 
  SyncData, 
  SyncState, 
  SyncResult, 
  SyncConflict, 
  SyncSettings, 
  SyncEvent, 
  SyncEventType,
  DeviceInfo,
  WebDAVConfig
} from '@/types/sync'
import { AppSettings, QuickLaunchItem, SearchEngine } from '@/types'
import { WebDAVSyncProvider } from './webdav'
import { LocalSyncProvider } from './localSync'

type SyncEventListener = (event: SyncEvent) => void

export class SyncManager {
  private state: SyncState = { status: 'idle' }
  private settings: SyncSettings
  private eventListeners: SyncEventListener[] = []
  private webdavProvider?: WebDAVSyncProvider
  private syncInterval?: number
  private retryTimeout?: number

  constructor(settings: SyncSettings) {
    this.settings = settings
    this.initializeProviders()
  }

  /**
   * 更新同步设置
   */
  updateSettings(newSettings: Partial<SyncSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.initializeProviders()
    
    // 如果启用，重新启动自动同步
    if (this.settings.autoSync) {
      this.startAutoSync()
    } else {
      this.stopAutoSync()
    }
  }

  /**
   * 根据设置初始化同步提供程序
   */
  private initializeProviders(): void {
    // 如果配置了 WebDAV，初始化 WebDAV 提供程序
    const webdavProvider = this.settings.providers.find(p => p.type === 'webdav' && p.enabled)
    if (webdavProvider) {
      this.webdavProvider = new WebDAVSyncProvider(webdavProvider.config as WebDAVConfig)
    }
  }

  /**
   * 获取当前同步状态
   */
  getState(): SyncState {
    return { ...this.state }
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: SyncEventListener): void {
    this.eventListeners.push(listener)
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: SyncEventListener): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  /**
   * 发出同步事件
   */
  private emitEvent(type: SyncEventType, data?: any, error?: string): void {
    const event: SyncEvent = {
      type,
      timestamp: Date.now(),
      data,
      error
    }

    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Event listener error:', error)
      }
    })
  }

  /**
   * 更新同步状态
   */
  private updateState(updates: Partial<SyncState>): void {
    this.state = { ...this.state, ...updates }
  }

  /**
   * 执行完整的同步操作
   */
  async sync(
    settings: AppSettings,
    quickLaunch: QuickLaunchItem[],
    customSearchEngines: SearchEngine[]
  ): Promise<SyncResult> {
    if (!this.settings.enabled) {
      return {
        success: false,
        message: 'Sync is disabled'
      }
    }

    if (this.state.status === 'syncing') {
      return {
        success: false,
        message: 'Sync already in progress'
      }
    }

    this.updateState({ status: 'syncing', progress: 0, lastError: undefined })
    this.emitEvent('sync-start')

    try {
      const deviceId = this.getDeviceId()
      const localData: SyncData = {
        version: '1.0.0',
        timestamp: Date.now(),
        deviceId,
        settings,
        quickLaunch,
        customSearchEngines,
        metadata: {
          lastModified: Date.now(),
          deviceName: this.getDeviceName(),
          appVersion: '1.0.0',
          conflictResolution: this.settings.conflictResolution
        }
      }

      this.updateState({ progress: 25 })
      this.emitEvent('sync-progress', { progress: 25 })

      // 首先尝试下载远程数据
      const downloadResult = await this.downloadData()
      this.updateState({ progress: 50 })
      this.emitEvent('sync-progress', { progress: 50 })

      let finalData = localData
      let conflicts: SyncConflict[] = []

      if (downloadResult.success && downloadResult.syncedData) {
        // 检查冲突
        conflicts = this.detectConflicts(localData, downloadResult.syncedData)
        
        if (conflicts.length > 0) {
          this.emitEvent('conflict-detected', { conflicts })
          
          // 根据策略解决冲突
          finalData = this.resolveConflicts(localData, downloadResult.syncedData, conflicts)
          this.emitEvent('conflict-resolved', { resolvedData: finalData })
        } else {
          // 使用更新的数据
          finalData = localData.timestamp > downloadResult.syncedData.timestamp 
            ? localData 
            : downloadResult.syncedData
        }
      }

      this.updateState({ progress: 75 })
      this.emitEvent('sync-progress', { progress: 75 })

      // 上传最终数据
      const uploadResult = await this.uploadData(finalData)
      
      if (uploadResult.success) {
        this.updateState({ 
          status: 'success', 
          lastSync: Date.now(), 
          progress: 100,
          conflictData: conflicts.length > 0 ? conflicts : undefined
        })
        this.emitEvent('sync-success', { syncedData: finalData, conflicts })
        
        return {
          success: true,
          message: 'Sync completed successfully',
          conflicts: conflicts.length > 0 ? conflicts : undefined,
          syncedData: finalData
        }
      } else {
        throw new Error(uploadResult.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed'
      this.updateState({ 
        status: 'error', 
        lastError: errorMessage,
        progress: undefined
      })
      this.emitEvent('sync-error', undefined, errorMessage)

      // 如果配置了，重试
      if (this.settings.retryAttempts > 0) {
        this.scheduleRetry()
      }

      return {
        success: false,
        message: errorMessage
      }
    }
  }

  /**
   * 将数据上传到活跃的提供程序
   */
  private async uploadData(data: SyncData): Promise<SyncResult> {
    const activeProvider = this.settings.providers.find(p => 
      p.name === this.settings.activeProvider && p.enabled
    )

    if (!activeProvider) {
      throw new Error('No active sync provider configured')
    }

    switch (activeProvider.type) {
      case 'webdav':
        if (!this.webdavProvider) {
          throw new Error('WebDAV provider not initialized')
        }
        const initialized = await this.webdavProvider.initialize()
        if (!initialized) {
          throw new Error('Failed to initialize WebDAV provider')
        }
        return this.webdavProvider.uploadSyncData(data)

      case 'local':
        // 对于本地提供程序，只返回成功，因为它的处理方式不同
        return {
          success: true,
          message: 'Local sync completed',
          syncedData: data
        }

      default:
        throw new Error(`Unsupported provider type: ${activeProvider.type}`)
    }
  }

  /**
   * 从活跃的提供程序下载数据
   */
  private async downloadData(): Promise<SyncResult> {
    const activeProvider = this.settings.providers.find(p => 
      p.name === this.settings.activeProvider && p.enabled
    )

    if (!activeProvider) {
      return {
        success: false,
        message: 'No active sync provider configured'
      }
    }

    switch (activeProvider.type) {
      case 'webdav':
        if (!this.webdavProvider) {
          return {
            success: false,
            message: 'WebDAV provider not initialized'
          }
        }
        return this.webdavProvider.downloadSyncData()

      case 'local':
        // 本地提供程序不支持下载
        return {
          success: false,
          message: 'Local provider does not support download'
        }

      default:
        return {
          success: false,
          message: `Unsupported provider type: ${activeProvider.type}`
        }
    }
  }

  /**
   * 检测本地和远程数据之间的冲突
   */
  private detectConflicts(localData: SyncData, remoteData: SyncData): SyncConflict[] {
    const conflicts: SyncConflict[] = []

    // 检查是否都在最近修改过（在彼此 1 分钟内）
    const timeDiff = Math.abs(localData.timestamp - remoteData.timestamp)
    if (timeDiff < 60000) { // 1 分钟
      // 比较设置
      if (JSON.stringify(localData.settings) !== JSON.stringify(remoteData.settings)) {
        conflicts.push({
          path: 'settings',
          localData: localData.settings,
          remoteData: remoteData.settings
        })
      }

      // 比较快速启动项
      if (JSON.stringify(localData.quickLaunch) !== JSON.stringify(remoteData.quickLaunch)) {
        conflicts.push({
          path: 'quickLaunch',
          localData: localData.quickLaunch,
          remoteData: remoteData.quickLaunch
        })
      }

      // 比较自定义搜索引擎
      if (JSON.stringify(localData.customSearchEngines) !== JSON.stringify(remoteData.customSearchEngines)) {
        conflicts.push({
          path: 'customSearchEngines',
          localData: localData.customSearchEngines,
          remoteData: remoteData.customSearchEngines
        })
      }
    }

    return conflicts
  }

  /**
   * 根据策略解决冲突
   */
  private resolveConflicts(localData: SyncData, remoteData: SyncData, conflicts: SyncConflict[]): SyncData {
    let resolvedData = { ...localData }

    switch (this.settings.conflictResolution) {
      case 'latest':
        // 使用具有最新时间戳的数据
        resolvedData = localData.timestamp > remoteData.timestamp ? localData : remoteData
        break

      case 'merge':
        // 在可能的情况下合并数据
        resolvedData = this.mergeData(localData, remoteData)
        break

      case 'manual':
        // 对于手动解决，使用本地数据并标记冲突供用户审查
        // 冲突将呈现给用户手动解决
        break
    }

    return resolvedData
  }

  /**
   * 合并本地和远程数据
   */
  private mergeData(localData: SyncData, remoteData: SyncData): SyncData {
    // 使用最新的时间戳
    const useLocal = localData.timestamp > remoteData.timestamp

    // 按 ID 合并快速启动项
    const mergedQuickLaunch = this.mergeQuickLaunchItems(
      localData.quickLaunch,
      remoteData.quickLaunch
    )

    // 按 ID 合并自定义搜索引擎
    const mergedSearchEngines = this.mergeSearchEngines(
      localData.customSearchEngines,
      remoteData.customSearchEngines
    )

    return {
      version: '1.0.0',
      timestamp: Math.max(localData.timestamp, remoteData.timestamp),
      deviceId: localData.deviceId,
      settings: useLocal ? localData.settings : remoteData.settings,
      quickLaunch: mergedQuickLaunch,
      customSearchEngines: mergedSearchEngines,
      metadata: useLocal ? localData.metadata : remoteData.metadata
    }
  }

  /**
   * 合并快速启动项
   */
  private mergeQuickLaunchItems(local: QuickLaunchItem[], remote: QuickLaunchItem[]): QuickLaunchItem[] {
    const merged = new Map<string, QuickLaunchItem>()

    // 首先添加所有远程项目
    remote.forEach(item => merged.set(item.id, item))

    // 使用本地项目添加/更新
    local.forEach(item => {
      const existing = merged.get(item.id)
      if (!existing || item.order > existing.order) {
        merged.set(item.id, item)
      }
    })

    return Array.from(merged.values()).sort((a, b) => a.order - b.order)
  }

  /**
   * 合并搜索引擎
   */
  private mergeSearchEngines(local: SearchEngine[], remote: SearchEngine[]): SearchEngine[] {
    const merged = new Map<string, SearchEngine>()

    // 添加来自两个源的所有项目
    remote.forEach(engine => merged.set(engine.id, engine))
    local.forEach(engine => merged.set(engine.id, engine))

    return Array.from(merged.values())
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (!this.settings.autoSync || this.syncInterval) {
      return
    }

    const intervalMs = this.settings.syncInterval * 60 * 1000 // 转换为毫秒
    this.syncInterval = window.setInterval(() => {
      // 自动同步需要访问当前应用数据
      // 这应该从具有对 store 访问权限的组件中调用
      this.emitEvent('sync-start')
    }, intervalMs)
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = undefined
    }
  }

  /**
   * 在失败后安排重试
   */
  private scheduleRetry(): void {
    if (this.retryTimeout) {
      return
    }

    const delay = this.settings.retryDelay * 1000
    this.retryTimeout = window.setTimeout(() => {
      this.retryTimeout = undefined
      this.emitEvent('sync-start')
    }, delay)
  }

  /**
   * 从 WebDAV 获取可用设备
   */
  async getAvailableDevices(): Promise<DeviceInfo[]> {
    if (!this.webdavProvider) {
      return []
    }

    try {
      const deviceIds = await this.webdavProvider.getAvailableDevices()
      return deviceIds.map(id => ({
        id,
        name: `Device ${id}`,
        platform: 'unknown',
        lastSeen: Date.now(),
        version: '1.0.0'
      }))
    } catch (error) {
      console.error('Failed to get available devices:', error)
      return []
    }
  }

  /**
   * 测试与活跃提供程序的连接
   */
  async testConnection(): Promise<boolean> {
    const activeProvider = this.settings.providers.find(p => 
      p.name === this.settings.activeProvider && p.enabled
    )

    if (!activeProvider) {
      return false
    }

    if (activeProvider.type === 'webdav' && this.webdavProvider) {
      return this.webdavProvider.initialize()
    }

    return activeProvider.type === 'local'
  }

  /**
   * 获取设备 ID
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('newTab_deviceId')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('newTab_deviceId', deviceId)
    }
    return deviceId
  }

  /**
   * 获取设备名称
   */
  private getDeviceName(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome Browser'
    if (userAgent.includes('Firefox')) return 'Firefox Browser'
    if (userAgent.includes('Safari')) return 'Safari Browser'
    if (userAgent.includes('Edge')) return 'Edge Browser'
    return 'Unknown Browser'
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopAutoSync()
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
    this.eventListeners = []
  }
}