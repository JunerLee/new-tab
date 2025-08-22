import { WebDAVConfig, WebDAVResponse, SyncData, SyncResult } from '@/types/sync'

/**
 * WebDAV 客户端类，用于与 WebDAV 服务器通信
 */
export class WebDAVClient {
  private config: WebDAVConfig
  private baseUrl: string
  private auth: string

  constructor(config: WebDAVConfig) {
    this.config = config
    this.baseUrl = config.url.replace(/\/$/, '')
    this.auth = btoa(`${config.username}:${config.password}`)
  }

  private async request(
    method: string,
    path: string,
    body?: string,
    headers: Record<string, string> = {}
  ): Promise<WebDAVResponse> {
    const url = `${this.baseUrl}${path}`
    const requestHeaders = {
      'Authorization': `Basic ${this.auth}`,
      'Content-Type': 'application/json',
      ...headers
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body,
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      })

      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text/')) {
        data = await response.text()
      } else {
        data = await response.blob()
      }

      return {
        status: response.status,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (error) {
      console.error('WebDAV request failed:', error)
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Network error'
      }
    }
  }

  /**
   * 测试与 WebDAV 服务器的连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request('PROPFIND', '/', undefined, {
        'Depth': '0'
      })
      return response.status >= 200 && response.status < 300
    } catch {
      return false
    }
  }

  /**
   * 创建目录
   */
  async createDirectory(path: string): Promise<boolean> {
    try {
      const response = await this.request('MKCOL', path)
      return response.status === 201 || response.status === 405 // 405 意味着已经存在
    } catch {
      return false
    }
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      const response = await this.request('HEAD', path)
      return response.status === 200
    } catch {
      return false
    }
  }

  /**
   * 获取文件
   */
  async getFile(path: string): Promise<WebDAVResponse> {
    return this.request('GET', path)
  }

  /**
   * 上传文件
   */
  async putFile(path: string, content: string): Promise<WebDAVResponse> {
    // 确保目录存在
    const dirPath = path.substring(0, path.lastIndexOf('/'))
    if (dirPath) {
      await this.createDirectory(dirPath)
    }

    return this.request('PUT', path, content, {
      'Content-Type': 'application/json'
    })
  }

  /**
   * 删除文件
   */
  async deleteFile(path: string): Promise<WebDAVResponse> {
    return this.request('DELETE', path)
  }

  /**
   * 列出文件
   */
  async listFiles(path: string): Promise<string[]> {
    try {
      const response = await this.request('PROPFIND', path, undefined, {
        'Depth': '1'
      })

      if (response.status !== 207) {
        throw new Error(`Failed to list files: ${response.error}`)
      }

      // 解析 WebDAV XML 响应（简化）
      const xmlText = response.data as string
      const files: string[] = []
      
      // 从 XML 中提取 href 元素
      const hrefMatches = xmlText.match(/<d:href>([^<]+)<\/d:href>/g)
      if (hrefMatches) {
        for (const match of hrefMatches) {
          const href = match.replace(/<\/?d:href>/g, '')
          if (href !== path && href.startsWith(path)) {
            files.push(href)
          }
        }
      }

      return files
    } catch (error) {
      console.error('Failed to list files:', error)
      return []
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(path: string): Promise<{ lastModified?: number; size?: number } | null> {
    try {
      const response = await this.request('PROPFIND', path, undefined, {
        'Depth': '0'
      })

      if (response.status !== 207) {
        return null
      }

      const xmlText = response.data as string
      
      // 提取最后修改日期（简化 XML 解析）
      const lastModifiedMatch = xmlText.match(/<d:getlastmodified>([^<]+)<\/d:getlastmodified>/)
      const sizeMatch = xmlText.match(/<d:getcontentlength>([^<]+)<\/d:getcontentlength>/)

      return {
        lastModified: lastModifiedMatch ? new Date(lastModifiedMatch[1]).getTime() : undefined,
        size: sizeMatch ? parseInt(sizeMatch[1], 10) : undefined
      }
    } catch {
      return null
    }
  }
}

/**
 * WebDAV 同步提供程序类，用于与 WebDAV 服务器同步数据
 */
export class WebDAVSyncProvider {
  private client: WebDAVClient
  private syncPath: string

  constructor(config: WebDAVConfig) {
    this.client = new WebDAVClient(config)
    this.syncPath = config.path || '/newTab'
  }

  /**
   * 初始化 WebDAV 同步提供程序
   */
  async initialize(): Promise<boolean> {
    try {
      const connected = await this.client.testConnection()
      if (!connected) {
        throw new Error('Failed to connect to WebDAV server')
      }

      // 如果同步目录不存在，则创建它
      await this.client.createDirectory(this.syncPath)
      return true
    } catch (error) {
      console.error('WebDAV initialization failed:', error)
      return false
    }
  }

  /**
   * 上传同步数据
   */
  async uploadSyncData(data: SyncData): Promise<SyncResult> {
    try {
      const filename = `sync_${data.deviceId}_${Date.now()}.json`
      const filepath = `${this.syncPath}/${filename}`
      const content = JSON.stringify(data, null, 2)

      const response = await this.client.putFile(filepath, content)

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: 'Data uploaded successfully',
          syncedData: data
        }
      } else {
        throw new Error(response.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload sync data failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed'
      }
    }
  }

  /**
   * 下载同步数据
   */
  async downloadSyncData(deviceId?: string): Promise<SyncResult> {
    try {
      const files = await this.client.listFiles(this.syncPath)
      
      if (files.length === 0) {
        return {
          success: false,
          message: 'No sync data found'
        }
      }

      // 查找最新的同步文件
      let latestFile = ''
      let latestTime = 0

      for (const file of files) {
        if (file.endsWith('.json')) {
          const info = await this.client.getFileInfo(file)
          if (info?.lastModified && info.lastModified > latestTime) {
            // 如果指定了 deviceId，只考虑来自该设备的文件
            if (!deviceId || file.includes(deviceId)) {
              latestFile = file
              latestTime = info.lastModified
            }
          }
        }
      }

      if (!latestFile) {
        return {
          success: false,
          message: deviceId ? `No sync data found for device ${deviceId}` : 'No valid sync files found'
        }
      }

      const response = await this.client.getFile(latestFile)
      
      if (response.status === 200 && response.data) {
        const syncData = JSON.parse(response.data as string) as SyncData
        return {
          success: true,
          message: 'Data downloaded successfully',
          syncedData: syncData
        }
      } else {
        throw new Error(response.error || 'Download failed')
      }
    } catch (error) {
      console.error('Download sync data failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Download failed'
      }
    }
  }

  /**
   * 获取可用设备列表
   */
  async getAvailableDevices(): Promise<string[]> {
    try {
      const files = await this.client.listFiles(this.syncPath)
      const devices = new Set<string>()

      for (const file of files) {
        if (file.endsWith('.json')) {
          const match = file.match(/sync_([^_]+)_\d+\.json$/)
          if (match) {
            devices.add(match[1])
          }
        }
      }

      return Array.from(devices)
    } catch (error) {
      console.error('Failed to get available devices:', error)
      return []
    }
  }

  /**
   * 清理旧文件
   */
  async cleanupOldFiles(retentionDays: number = 30): Promise<void> {
    try {
      const files = await this.client.listFiles(this.syncPath)
      const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000)

      for (const file of files) {
        if (file.endsWith('.json')) {
          const info = await this.client.getFileInfo(file)
          if (info?.lastModified && info.lastModified < cutoffTime) {
            await this.client.deleteFile(file)
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old files:', error)
    }
  }
}