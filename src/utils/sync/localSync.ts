import { SyncData, LocalSyncData, SyncResult, SyncHistory } from '@/types/sync'
import { AppSettings, QuickLaunchItem, SearchEngine } from '@/types'

/**
 * 本地同步提供程序类，用于本地数据的导入导出和管理
 */
export class LocalSyncProvider {
  private static readonly STORAGE_KEY = 'newTab_syncHistory'
  private static readonly VERSION = '1.0.0'

  /**
   * 将应用数据导出为 JSON 格式
   */
  static exportData(
    settings: AppSettings,
    quickLaunch: QuickLaunchItem[],
    customSearchEngines: SearchEngine[],
    deviceId: string = this.generateDeviceId()
  ): string {
    const syncData: SyncData = {
      version: this.VERSION,
      timestamp: Date.now(),
      deviceId,
      settings,
      quickLaunch,
      customSearchEngines,
      metadata: {
        lastModified: Date.now(),
        deviceName: this.getDeviceName(),
        appVersion: this.VERSION,
        conflictResolution: 'latest'
      }
    }

    const exportData: LocalSyncData = {
      exportDate: new Date().toISOString(),
      version: this.VERSION,
      data: syncData
    }

    // 保存到同步历史
    this.saveSyncHistory({
      id: `export_${Date.now()}`,
      timestamp: Date.now(),
      provider: 'local',
      action: 'export',
      success: true,
      details: 'Data exported to JSON file',
      dataSize: JSON.stringify(exportData).length
    })

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * 从 JSON 字符串导入应用数据
   */
  static importData(jsonString: string): SyncResult {
    try {
      const importedData = JSON.parse(jsonString) as LocalSyncData

      // 验证数据结构
      if (!this.validateImportData(importedData)) {
        throw new Error('Invalid data format')
      }

      // 版本兼容性检查
      const isCompatible = this.checkVersionCompatibility(importedData.version)
      if (!isCompatible) {
        console.warn(`Version mismatch: current ${this.VERSION}, imported ${importedData.version}`)
      }

      // 保存到同步历史
      this.saveSyncHistory({
        id: `import_${Date.now()}`,
        timestamp: Date.now(),
        provider: 'local',
        action: 'import',
        success: true,
        details: `Data imported from version ${importedData.version}`,
        dataSize: jsonString.length
      })

      return {
        success: true,
        message: 'Data imported successfully',
        syncedData: importedData.data
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed'
      
      // 将失败的导入保存到历史
      this.saveSyncHistory({
        id: `import_${Date.now()}`,
        timestamp: Date.now(),
        provider: 'local',
        action: 'import',
        success: false,
        details: `Import failed: ${errorMessage}`
      })

      return {
        success: false,
        message: errorMessage
      }
    }
  }

  /**
   * 将文件作为 JSON 下载
   */
  static downloadAsFile(data: string, filename?: string): void {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `newTab_backup_${new Date().toISOString().split('T')[0]}.json`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理 URL 对象
    URL.revokeObjectURL(url)
  }

  /**
   * 从输入元素读取文件
   */
  static readFileFromInput(): Promise<string> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (!file) {
          reject(new Error('No file selected'))
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          resolve(content)
        }
        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }
        reader.readAsText(file)
      }

      input.onclick = () => {
        // 重置输入值以允许再次选择相同文件
        input.value = ''
      }

      input.click()
    })
  }

  /**
   * 验证导入数据结构
   */
  private static validateImportData(data: any): data is LocalSyncData {
    if (!data || typeof data !== 'object') {
      return false
    }

    // 检查必需字段
    if (!data.data || !data.version || !data.exportDate) {
      return false
    }

    const syncData = data.data
    if (!syncData.settings || !Array.isArray(syncData.quickLaunch)) {
      return false
    }

    // 验证设置结构
    const settings = syncData.settings
    if (!settings.language || !settings.theme || !settings.background) {
      return false
    }

    // 验证快速启动项
    for (const item of syncData.quickLaunch) {
      if (!item.id || !item.name || !item.url || typeof item.order !== 'number') {
        return false
      }
    }

    return true
  }

  /**
   * 检查版本兼容性
   */
  private static checkVersionCompatibility(importVersion: string): boolean {
    const [currentMajor] = this.VERSION.split('.').map(Number)
    const [importMajor] = importVersion.split('.').map(Number)
    
    // 相同主版本号兼容
    return currentMajor === importMajor
  }

  /**
   * 生成唯一设备 ID
   */
  private static generateDeviceId(): string {
    // 尝试从存储中获取现有设备 ID
    let deviceId = localStorage.getItem('newTab_deviceId')
    
    if (!deviceId) {
      // 生成新设备 ID
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('newTab_deviceId', deviceId)
    }
    
    return deviceId
  }

  /**
   * 获取设备名称
   */
  private static getDeviceName(): string {
    // 尝试从用户代理确定设备名称
    const userAgent = navigator.userAgent
    
    if (userAgent.includes('Chrome')) {
      return 'Chrome Browser'
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox Browser'
    } else if (userAgent.includes('Safari')) {
      return 'Safari Browser'
    } else if (userAgent.includes('Edge')) {
      return 'Edge Browser'
    }
    
    return 'Unknown Browser'
  }

  /**
   * 保存同步历史条目
   */
  private static saveSyncHistory(entry: SyncHistory): void {
    try {
      const existing = this.getSyncHistory()
      const updated = [entry, ...existing].slice(0, 50) // 保留最后 50 个条目
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save sync history:', error)
    }
  }

  /**
   * 获取同步历史
   */
  static getSyncHistory(): SyncHistory[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get sync history:', error)
      return []
    }
  }

  /**
   * 清除同步历史
   */
  static clearSyncHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * 获取同步统计信息
   */
  static getSyncStats(): {
    totalSyncs: number
    successRate: number
    lastSync?: number
    totalDataSize: number
  } {
    const history = this.getSyncHistory()
    
    if (history.length === 0) {
      return {
        totalSyncs: 0,
        successRate: 0,
        totalDataSize: 0
      }
    }

    const totalSyncs = history.length
    const successfulSyncs = history.filter(h => h.success).length
    const successRate = (successfulSyncs / totalSyncs) * 100
    const lastSync = Math.max(...history.map(h => h.timestamp))
    const totalDataSize = history.reduce((sum, h) => sum + (h.dataSize || 0), 0)

    return {
      totalSyncs,
      successRate,
      lastSync,
      totalDataSize
    }
  }

  /**
   * 创建带时间戳的备份
   */
  static createTimestampedBackup(
    settings: AppSettings,
    quickLaunch: QuickLaunchItem[],
    customSearchEngines: SearchEngine[]
  ): void {
    const data = this.exportData(settings, quickLaunch, customSearchEngines)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `newTab_backup_${timestamp}.json`
    this.downloadAsFile(data, filename)
  }

  /**
   * 从旧格式迁移数据
   */
  static migrateFromOldFormat(oldData: any): SyncData | null {
    try {
      // 在这里处理不同的旧格式
      if (oldData.settings && oldData.quickLaunch) {
        return {
          version: this.VERSION,
          timestamp: Date.now(),
          deviceId: this.generateDeviceId(),
          settings: oldData.settings,
          quickLaunch: oldData.quickLaunch,
          customSearchEngines: oldData.customSearchEngines || [],
          metadata: {
            lastModified: Date.now(),
            deviceName: this.getDeviceName(),
            appVersion: this.VERSION,
            conflictResolution: 'latest'
          }
        }
      }
      return null
    } catch (error) {
      console.error('Migration failed:', error)
      return null
    }
  }
}