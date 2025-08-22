/**
 * 同步功能使用示例
 * 
 * 这个文件演示了如何使用同步系统的各种功能
 */

import { WebDAVSyncProvider, LocalSyncProvider, SyncManager } from './index'
import { WebDAVConfig, SyncSettings } from '@/types/sync'
import { AppSettings, QuickLaunchItem, SearchEngine } from '@/types'

// 示例数据
const exampleSettings: AppSettings = {
  language: 'zh',
  theme: { mode: 'auto' },
  background: { type: 'bing', bingEnabled: true, blurAmount: 0, opacity: 100, changeInterval: 24 },
  sync: { enabled: true, provider: 'webdav' },
  searchEngine: 'google',
  showWeather: true,
  showTime: true,
  timeFormat: '24h',
  shortcuts: { search: 'ctrl+k', settings: 'ctrl+,' }
}

const exampleQuickLaunch: QuickLaunchItem[] = [
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    favicon: 'https://github.com/favicon.ico',
    category: 'development',
    order: 0,
    isCustom: false
  }
]

const exampleSearchEngines: SearchEngine[] = [
  {
    id: 'custom1',
    name: 'My Custom Search',
    url: 'https://example.com/search?q=',
    icon: 'https://example.com/favicon.ico',
    placeholder: 'Search custom...'
  }
]

/**
 * WebDAV同步示例
 */
async function webdavSyncExample() {
  console.log('=== WebDAV同步示例 ===')
  
  // 1. 配置WebDAV
  const webdavConfig: WebDAVConfig = {
    url: 'https://your-nextcloud.com/remote.php/dav/files/username',
    username: 'your_username',
    password: 'your_password',
    path: '/newTab'
  }

  // 2. 创建WebDAV提供者
  const webdavProvider = new WebDAVSyncProvider(webdavConfig)

  try {
    // 3. 初始化连接
    const initialized = await webdavProvider.initialize()
    if (!initialized) {
      console.error('WebDAV初始化失败')
      return
    }
    console.log('✅ WebDAV连接成功')

    // 4. 准备同步数据
    const syncData = {
      version: '1.0.0',
      timestamp: Date.now(),
      deviceId: 'device_example_123',
      settings: exampleSettings,
      quickLaunch: exampleQuickLaunch,
      customSearchEngines: exampleSearchEngines,
      metadata: {
        lastModified: Date.now(),
        deviceName: 'Example Device',
        appVersion: '1.0.0',
        conflictResolution: 'latest' as const
      }
    }

    // 5. 上传数据
    const uploadResult = await webdavProvider.uploadSyncData(syncData)
    if (uploadResult.success) {
      console.log('✅ 数据上传成功')
    } else {
      console.error('❌ 数据上传失败:', uploadResult.message)
    }

    // 6. 下载数据
    const downloadResult = await webdavProvider.downloadSyncData()
    if (downloadResult.success) {
      console.log('✅ 数据下载成功')
      console.log('下载的数据:', downloadResult.syncedData)
    } else {
      console.error('❌ 数据下载失败:', downloadResult.message)
    }

    // 7. 获取可用设备
    const devices = await webdavProvider.getAvailableDevices()
    console.log('可用设备:', devices)

  } catch (error) {
    console.error('WebDAV同步过程中出错:', error)
  }
}

/**
 * 本地同步示例
 */
function localSyncExample() {
  console.log('=== 本地同步示例 ===')

  try {
    // 1. 导出数据
    const exportedData = LocalSyncProvider.exportData(
      exampleSettings,
      exampleQuickLaunch,
      exampleSearchEngines
    )
    console.log('✅ 数据导出成功')
    console.log('导出数据长度:', exportedData.length)

    // 2. 导入数据
    const importResult = LocalSyncProvider.importData(exportedData)
    if (importResult.success) {
      console.log('✅ 数据导入成功')
      console.log('导入的数据:', importResult.syncedData)
    } else {
      console.error('❌ 数据导入失败:', importResult.message)
    }

    // 3. 获取同步统计
    const stats = LocalSyncProvider.getSyncStats()
    console.log('同步统计:', stats)

    // 4. 获取同步历史
    const history = LocalSyncProvider.getSyncHistory()
    console.log('同步历史记录数:', history.length)

  } catch (error) {
    console.error('本地同步过程中出错:', error)
  }
}

/**
 * 同步管理器示例
 */
async function syncManagerExample() {
  console.log('=== 同步管理器示例 ===')

  // 1. 配置同步设置
  const syncSettings: SyncSettings = {
    enabled: true,
    autoSync: true,
    syncInterval: 60, // 60分钟
    providers: [
      {
        name: 'My WebDAV',
        type: 'webdav',
        config: {
          url: 'https://your-server.com/dav',
          username: 'user',
          password: 'pass',
          path: '/newTab'
        },
        enabled: true
      }
    ],
    activeProvider: 'My WebDAV',
    conflictResolution: 'latest',
    retryAttempts: 3,
    retryDelay: 30
  }

  // 2. 创建同步管理器
  const syncManager = new SyncManager(syncSettings)

  // 3. 监听同步事件
  syncManager.addEventListener((event) => {
    console.log(`同步事件: ${event.type}`, event.data)
  })

  try {
    // 4. 测试连接
    const connected = await syncManager.testConnection()
    console.log('连接状态:', connected ? '✅ 连接成功' : '❌ 连接失败')

    if (connected) {
      // 5. 执行同步
      const syncResult = await syncManager.sync(
        exampleSettings,
        exampleQuickLaunch,
        exampleSearchEngines
      )

      if (syncResult.success) {
        console.log('✅ 同步完成')
        if (syncResult.conflicts && syncResult.conflicts.length > 0) {
          console.log('检测到冲突:', syncResult.conflicts.length)
        }
      } else {
        console.error('❌ 同步失败:', syncResult.message)
      }
    }

  } catch (error) {
    console.error('同步管理器操作失败:', error)
  } finally {
    // 6. 清理资源
    syncManager.destroy()
  }
}

/**
 * 错误处理示例
 */
async function errorHandlingExample() {
  console.log('=== 错误处理示例 ===')

  // 1. 无效的WebDAV配置
  const invalidConfig: WebDAVConfig = {
    url: 'invalid-url',
    username: '',
    password: '',
    path: '/invalid'
  }

  const provider = new WebDAVSyncProvider(invalidConfig)
  
  try {
    const initialized = await provider.initialize()
    console.log('初始化结果:', initialized)
  } catch (error) {
    console.log('✅ 正确捕获了错误:', error)
  }

  // 2. 无效的导入数据
  try {
    const result = LocalSyncProvider.importData('invalid json')
    console.log('导入结果:', result)
  } catch (error) {
    console.log('✅ 正确处理了无效数据')
  }
}

/**
 * 运行所有示例
 */
export async function runSyncExamples() {
  console.log('🚀 开始运行同步功能示例...\n')
  
  // 注意：WebDAV示例需要真实的服务器配置才能运行
  // 这里只运行本地示例
  
  localSyncExample()
  console.log('\n')
  
  await errorHandlingExample()
  console.log('\n')
  
  // 取消注释以下行来测试WebDAV和同步管理器
  // await webdavSyncExample()
  // await syncManagerExample()
  
  console.log('✅ 所有示例运行完成')
}

// 导出示例函数
export {
  webdavSyncExample,
  localSyncExample,
  syncManagerExample,
  errorHandlingExample
}