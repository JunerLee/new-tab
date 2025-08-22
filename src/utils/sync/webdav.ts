import { WebDAVConfig, WebDAVResponse, SyncData, SyncResult } from '@/types/sync'

/**
 * WebDAV错误类型枚举
 */
export enum WebDAVError {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  TIMEOUT = 'TIMEOUT',
  PARSE_ERROR = 'PARSE_ERROR',
  CONFLICT = 'CONFLICT'
}

/**
 * WebDAV错误信息接口
 */
interface WebDAVErrorInfo {
  type: WebDAVError
  message: string
  status?: number
  details?: any
}

/**
 * WebDAV文件信息接口
 */
interface WebDAVFileInfo {
  name: string
  path: string
  isDirectory: boolean
  lastModified?: number
  size?: number
  etag?: string
  contentType?: string
}

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
    
    // 支持token认证或用户名密码认证
    if (config.token) {
      this.auth = `Bearer ${config.token}`
    } else {
      this.auth = `Basic ${btoa(`${config.username}:${config.password}`)}`
    }
  }

  private async request(
    method: string,
    path: string,
    body?: string | null,
    headers: Record<string, string> = {},
    retries: number = 0
  ): Promise<WebDAVResponse> {
    const url = `${this.baseUrl}${path}`
    const requestHeaders: Record<string, string> = {
      'Authorization': this.auth,
      'User-Agent': 'NewTabExtension/1.0',
      'Accept-Encoding': 'gzip, deflate',
      ...headers
    }

    // 设置正确的Content-Type
    if (body && !headers['Content-Type']) {
      if (method === 'PUT' && path.endsWith('.json')) {
        requestHeaders['Content-Type'] = 'application/json; charset=utf-8'
      } else if (method === 'PROPFIND' || method === 'PROPPATCH') {
        requestHeaders['Content-Type'] = 'application/xml; charset=utf-8'
      }
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000)

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body || null,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      let data: any
      const contentType = response.headers.get('content-type') || ''
      
      if (contentType.includes('application/json')) {
        data = await response.json()
      } else if (contentType.includes('text/') || contentType.includes('application/xml')) {
        data = await response.text()
      } else {
        data = await response.arrayBuffer()
      }

      if (!response.ok) {
        const errorInfo = this.categorizeError(response.status, response.statusText)
        return {
          status: response.status,
          error: errorInfo.message,
          errorType: errorInfo.type
        }
      }

      return {
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries())
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          status: 0,
          error: '请求超时',
          errorType: WebDAVError.TIMEOUT
        }
      }

      // 网络错误重试机制
      if (retries < 3 && this.shouldRetry(error)) {
        await this.delay(1000 * (retries + 1))
        return this.request(method, path, body, headers, retries + 1)
      }

      console.error('WebDAV请求失败:', error)
      return {
        status: 0,
        error: error instanceof Error ? error.message : '网络连接错误',
        errorType: WebDAVError.NETWORK_ERROR
      }
    }
  }

  /**
   * 分类错误类型
   */
  private categorizeError(status: number, statusText: string): WebDAVErrorInfo {
    switch (status) {
      case 401:
        return { type: WebDAVError.AUTH_ERROR, message: '认证失败，请检查用户名和密码', status }
      case 403:
        return { type: WebDAVError.FORBIDDEN, message: '访问被拒绝，请检查权限设置', status }
      case 404:
        return { type: WebDAVError.NOT_FOUND, message: '文件或目录不存在', status }
      case 409:
        return { type: WebDAVError.CONFLICT, message: '操作冲突，可能目录已存在', status }
      case 423:
        return { type: WebDAVError.SERVER_ERROR, message: '资源被锁定', status }
      case 507:
        return { type: WebDAVError.SERVER_ERROR, message: '存储空间不足', status }
      default:
        if (status >= 500) {
          return { type: WebDAVError.SERVER_ERROR, message: `服务器错误: ${statusText}`, status }
        }
        return { type: WebDAVError.SERVER_ERROR, message: `HTTP ${status}: ${statusText}`, status }
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    return error.name === 'TypeError' || // 网络错误
           error.message?.includes('fetch') ||
           error.message?.includes('network')
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 测试与 WebDAV 服务器的连接
   */
  async testConnection(): Promise<boolean> {
    try {
      // 使用OPTIONS请求测试基本连接
      const optionsResponse = await this.request('OPTIONS', '/')
      
      if (optionsResponse.status === 200) {
        return true
      }
      
      // 如果OPTIONS不支持，尝试PROPFIND
      const response = await this.request('PROPFIND', '/', undefined, {
        'Depth': '0'
      })
      
      return response.status >= 200 && response.status < 300
    } catch (error) {
      console.error('连接测试失败:', error)
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
   * 解析WebDAV XML响应
   */
  private parseWebDAVResponse(xmlText: string): WebDAVFileInfo[] {
    const files: WebDAVFileInfo[] = []
    
    try {
      // 匹配response元素
      const responseMatches = xmlText.match(/<d:response[^>]*>([\s\S]*?)<\/d:response>/g)
      
      if (responseMatches) {
        for (const responseMatch of responseMatches) {
          const file = this.parseResponseElement(responseMatch)
          if (file) {
            files.push(file)
          }
        }
      }
    } catch (error) {
      console.error('解析WebDAV响应失败:', error)
    }
    
    return files
  }

  /**
   * 解析单个response元素
   */
  private parseResponseElement(responseXml: string): WebDAVFileInfo | null {
    try {
      // 提取href
      const hrefMatch = responseXml.match(/<d:href>([^<]+)<\/d:href>/)
      if (!hrefMatch) return null
      
      const href = decodeURIComponent(hrefMatch[1])
      const name = href.split('/').filter(Boolean).pop() || ''
      
      // 提取属性
      const isDirectory = responseXml.includes('<d:collection/>')
      
      // 提取最后修改时间
      const lastModifiedMatch = responseXml.match(/<d:getlastmodified>([^<]+)<\/d:getlastmodified>/)
      const lastModified = lastModifiedMatch ? new Date(lastModifiedMatch[1]).getTime() : undefined
      
      // 提取文件大小
      const sizeMatch = responseXml.match(/<d:getcontentlength>([^<]+)<\/d:getcontentlength>/)
      const size = sizeMatch ? parseInt(sizeMatch[1], 10) : undefined
      
      // 提取ETag
      const etagMatch = responseXml.match(/<d:getetag>([^<]+)<\/d:getetag>/)
      const etag = etagMatch ? etagMatch[1].replace(/"/g, '') : undefined
      
      // 提取Content-Type
      const contentTypeMatch = responseXml.match(/<d:getcontenttype>([^<]+)<\/d:getcontenttype>/)
      const contentType = contentTypeMatch ? contentTypeMatch[1] : undefined
      
      return {
        name,
        path: href,
        isDirectory,
        lastModified,
        size,
        etag,
        contentType
      }
    } catch (error) {
      console.error('解析response元素失败:', error)
      return null
    }
  }

  /**
   * 列出文件
   */
  async listFiles(path: string): Promise<WebDAVFileInfo[]> {
    try {
      const propfindBody = `<?xml version="1.0" encoding="utf-8" ?>
        <D:propfind xmlns:D="DAV:">
          <D:prop>
            <D:displayname/>
            <D:resourcetype/>
            <D:getcontentlength/>
            <D:getlastmodified/>
            <D:getetag/>
            <D:getcontenttype/>
          </D:prop>
        </D:propfind>`
      
      const response = await this.request('PROPFIND', path, propfindBody, {
        'Depth': '1',
        'Content-Type': 'application/xml; charset=utf-8'
      })

      if (response.status !== 207) {
        throw new Error(`列出文件失败: ${response.error}`)
      }

      const xmlText = response.data as string
      const files = this.parseWebDAVResponse(xmlText)
      
      // 过滤掉当前目录本身
      return files.filter(file => file.path !== path && file.path.startsWith(path))
    } catch (error) {
      console.error('列出文件失败:', error)
      return []
    }
  }

  /**
   * 获取文件列表（简化版本，只返回路径）
   */
  async listFilePaths(path: string): Promise<string[]> {
    const files = await this.listFiles(path)
    return files.map(file => file.path)
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(path: string): Promise<WebDAVFileInfo | null> {
    try {
      const propfindBody = `<?xml version="1.0" encoding="utf-8" ?>
        <D:propfind xmlns:D="DAV:">
          <D:prop>
            <D:displayname/>
            <D:resourcetype/>
            <D:getcontentlength/>
            <D:getlastmodified/>
            <D:getetag/>
            <D:getcontenttype/>
          </D:prop>
        </D:propfind>`
      
      const response = await this.request('PROPFIND', path, propfindBody, {
        'Depth': '0',
        'Content-Type': 'application/xml; charset=utf-8'
      })

      if (response.status !== 207) {
        return null
      }

      const xmlText = response.data as string
      const files = this.parseWebDAVResponse(xmlText)
      
      return files.length > 0 ? files[0] ?? null : null
    } catch (error) {
      console.error('获取文件信息失败:', error)
      return null
    }
  }

  /**
   * 验证文件完整性（通过ETag或大小）
   */
  async verifyFileIntegrity(path: string, expectedSize?: number, expectedEtag?: string): Promise<boolean> {
    try {
      const fileInfo = await this.getFileInfo(path)
      if (!fileInfo) return false
      
      if (expectedEtag && fileInfo.etag) {
        return fileInfo.etag === expectedEtag
      }
      
      if (expectedSize !== undefined && fileInfo.size !== undefined) {
        return fileInfo.size === expectedSize
      }
      
      return true
    } catch {
      return false
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
        if (file.path.endsWith('.json')) {
          if (file.lastModified && file.lastModified > latestTime) {
            // 如果指定了 deviceId，只考虑来自该设备的文件
            if (!deviceId || file.path.includes(deviceId)) {
              latestFile = file.path
              latestTime = file.lastModified
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
        if (file.path.endsWith('.json')) {
          const match = file.path.match(/sync_([^_]+)_\d+\.json$/)
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
        if (file.path.endsWith('.json')) {
          if (file.lastModified && file.lastModified < cutoffTime) {
            await this.client.deleteFile(file.path)
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old files:', error)
    }
  }
}