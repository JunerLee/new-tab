import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebDAVClient, WebDAVSyncProvider } from '../webdav'
import type { WebDAVConfig, SyncData } from '@/types/sync'

// Mock fetch
global.fetch = vi.fn()

describe('WebDAVClient', () => {
  let client: WebDAVClient
  let mockConfig: WebDAVConfig

  beforeEach(() => {
    mockConfig = {
      url: 'https://example.com/webdav',
      username: 'testuser',
      password: 'testpass',
      path: '/sync',
      timeout: 30000
    }
    client = new WebDAVClient(mockConfig)
    vi.resetAllMocks()
  })

  describe('constructor', () => {
    it('should create client with username/password auth', () => {
      expect(client).toBeDefined()
    })

    it('should create client with token auth', () => {
      const tokenConfig = {
        ...mockConfig,
        token: 'test-token',
        username: 'testuser',
        password: ''
      }
      const tokenClient = new WebDAVClient(tokenConfig)
      expect(tokenClient).toBeDefined()
    })
  })

  describe('testConnection', () => {
    it('should return true for successful OPTIONS request', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        json: vi.fn(),
        text: vi.fn(),
        arrayBuffer: vi.fn()
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.testConnection()
      expect(result).toBe(true)
    })

    it('should fallback to PROPFIND if OPTIONS fails', async () => {
      const optionsResponse = {
        ok: false,
        status: 405,
        headers: new Map()
      }
      
      const propfindResponse = {
        ok: true,
        status: 207,
        headers: new Map(),
        text: vi.fn().mockResolvedValue('<d:multistatus>test</d:multistatus>')
      }

      ;(global.fetch as any)
        .mockResolvedValueOnce(optionsResponse)
        .mockResolvedValueOnce(propfindResponse)

      const result = await client.testConnection()
      expect(result).toBe(true)
    })

    it('should return false for connection errors', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const result = await client.testConnection()
      expect(result).toBe(false)
    })
  })

  describe('createDirectory', () => {
    it('should return true for successful MKCOL', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        headers: new Map(),
        text: vi.fn()
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.createDirectory('/test')
      expect(result).toBe(true)
    })

    it('should return true if directory already exists', async () => {
      const mockResponse = {
        ok: false,
        status: 405,
        statusText: 'Method Not Allowed',
        headers: new Map()
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.createDirectory('/test')
      expect(result).toBe(true)
    })
  })

  describe('fileExists', () => {
    it('should return true for existing files', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map()
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.fileExists('/test.json')
      expect(result).toBe(true)
    })

    it('should return false for non-existing files', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        headers: new Map()
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.fileExists('/nonexistent.json')
      expect(result).toBe(false)
    })
  })

  describe('listFiles', () => {
    it('should parse WebDAV XML response correctly', async () => {
      const xmlResponse = `<?xml version="1.0"?>
        <d:multistatus xmlns:d="DAV:">
          <d:response>
            <d:href>/sync/file1.json</d:href>
            <d:propstat>
              <d:prop>
                <d:displayname>file1.json</d:displayname>
                <d:getcontentlength>1024</d:getcontentlength>
                <d:getlastmodified>Wed, 21 Oct 2015 07:28:00 GMT</d:getlastmodified>
                <d:resourcetype/>
              </d:prop>
            </d:propstat>
          </d:response>
        </d:multistatus>`

      const mockResponse = {
        ok: true,
        status: 207,
        headers: new Map([['content-type', 'application/xml']]),
        text: vi.fn().mockResolvedValue(xmlResponse)
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.listFiles('/sync')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('file1.json')
      expect(result[0].path).toBe('/sync/file1.json')
      expect(result[0].size).toBe(1024)
    })

    it('should handle empty directory', async () => {
      const xmlResponse = `<?xml version="1.0"?>
        <d:multistatus xmlns:d="DAV:">
          <d:response>
            <d:href>/sync/</d:href>
            <d:propstat>
              <d:prop>
                <d:resourcetype><d:collection/></d:resourcetype>
              </d:prop>
            </d:propstat>
          </d:response>
        </d:multistatus>`

      const mockResponse = {
        ok: true,
        status: 207,
        headers: new Map([['content-type', 'application/xml']]),
        text: vi.fn().mockResolvedValue(xmlResponse)
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.listFiles('/sync')
      expect(result).toHaveLength(0)
    })
  })

  describe('putFile', () => {
    it('should upload file successfully', async () => {
      // Mock directory creation
      const mkcolResponse = {
        ok: true,
        status: 201,
        headers: new Map()
      }
      
      // Mock file upload
      const putResponse = {
        ok: true,
        status: 201,
        headers: new Map(),
        text: vi.fn()
      }

      ;(global.fetch as any)
        .mockResolvedValueOnce(mkcolResponse)
        .mockResolvedValueOnce(putResponse)

      const response = await client.putFile('/sync/test.json', '{"test": true}')
      expect(response.status).toBe(201)
    })
  })

  describe('error handling', () => {
    it('should categorize authentication errors correctly', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Map()
      }
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.testConnection()
      expect(result).toBe(false)
    })

    it('should handle timeout errors', async () => {
      ;(global.fetch as any).mockImplementationOnce(() => {
        const error = new Error('Request timeout')
        error.name = 'AbortError'
        return Promise.reject(error)
      })

      const result = await client.testConnection()
      expect(result).toBe(false)
    })

    it('should retry on network errors', async () => {
      ;(global.fetch as any)
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map(),
          text: vi.fn()
        })

      const result = await client.testConnection()
      expect(result).toBe(true)
      expect(global.fetch).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })
})

describe('WebDAVSyncProvider', () => {
  let provider: WebDAVSyncProvider
  let mockConfig: WebDAVConfig

  beforeEach(() => {
    mockConfig = {
      url: 'https://example.com/webdav',
      username: 'testuser',
      password: 'testpass',
      path: '/sync'
    }
    provider = new WebDAVSyncProvider(mockConfig)
    vi.resetAllMocks()
  })

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      // Mock connection test
      const optionsResponse = {
        ok: true,
        status: 200,
        headers: new Map()
      }
      
      // Mock directory check
      const headResponse = {
        ok: true,
        status: 200,
        headers: new Map()
      }

      ;(global.fetch as any)
        .mockResolvedValueOnce(optionsResponse)
        .mockResolvedValueOnce(headResponse)

      const result = await provider.initialize()
      expect(result).toBe(true)
    })

    it('should create sync directory if not exists', async () => {
      // Mock connection test
      const optionsResponse = {
        ok: true,
        status: 200,
        headers: new Map()
      }
      
      // Mock directory check (not found)
      const headResponse = {
        ok: false,
        status: 404,
        headers: new Map()
      }
      
      // Mock directory creation
      const mkcolResponse = {
        ok: true,
        status: 201,
        headers: new Map()
      }

      ;(global.fetch as any)
        .mockResolvedValueOnce(optionsResponse)
        .mockResolvedValueOnce(headResponse)
        .mockResolvedValueOnce(mkcolResponse)

      const result = await provider.initialize()
      expect(result).toBe(true)
    })
  })

  describe('uploadSyncData', () => {
    it('should upload sync data successfully', async () => {
      const mockSyncData: SyncData = {
        version: '1.0.0',
        timestamp: Date.now(),
        deviceId: 'test-device',
        settings: { theme: 'dark' },
        quickLaunch: [],
        customSearchEngines: [],
        metadata: {
          lastModified: Date.now(),
          deviceName: 'Test Device',
          appVersion: '1.0.0',
          conflictResolution: 'latest'
        }
      }

      // Mock initialization calls
      const optionsResponse = {
        ok: true,
        status: 200,
        headers: new Map()
      }
      
      const headResponse = {
        ok: true,
        status: 200,
        headers: new Map()
      }
      
      // Mock file upload
      const putResponse = {
        ok: true,
        status: 201,
        headers: new Map(),
        text: vi.fn()
      }
      
      // Mock file verification
      const verifyResponse = {
        ok: true,
        status: 207,
        headers: new Map([['content-type', 'application/xml']]),
        text: vi.fn().mockResolvedValue('<d:multistatus><d:response><d:href>/sync/test.json</d:href></d:response></d:multistatus>')
      }

      ;(global.fetch as any)
        .mockResolvedValueOnce(optionsResponse)
        .mockResolvedValueOnce(headResponse)
        .mockResolvedValueOnce(putResponse)
        .mockResolvedValueOnce(verifyResponse)

      const result = await provider.uploadSyncData(mockSyncData)
      expect(result.success).toBe(true)
      expect(result.message).toBe('数据上传成功')
      expect(result.syncedData).toEqual(mockSyncData)
    })

    it('should handle upload errors gracefully', async () => {
      const mockSyncData: SyncData = {
        version: '1.0.0',
        timestamp: Date.now(),
        deviceId: 'test-device',
        settings: { theme: 'dark' },
        quickLaunch: [],
        customSearchEngines: [],
        metadata: {
          lastModified: Date.now(),
          deviceName: 'Test Device',
          appVersion: '1.0.0',
          conflictResolution: 'latest'
        }
      }

      ;(global.fetch as any).mockRejectedValue(new Error('Upload failed'))

      const result = await provider.uploadSyncData(mockSyncData)
      expect(result.success).toBe(false)
      expect(result.message).toBe('Upload failed')
    })
  })

  describe('downloadSyncData', () => {
    it('should download latest sync data', async () => {
      // Mock file listing
      const xmlResponse = `<?xml version="1.0"?>
        <d:multistatus xmlns:d="DAV:">
          <d:response>
            <d:href>/sync/sync_device1_123456789.json</d:href>
            <d:propstat>
              <d:prop>
                <d:getcontentlength>1024</d:getcontentlength>
                <d:getlastmodified>Wed, 21 Oct 2023 07:28:00 GMT</d:getlastmodified>
                <d:resourcetype/>
              </d:prop>
            </d:propstat>
          </d:response>
        </d:multistatus>`

      const listResponse = {
        ok: true,
        status: 207,
        headers: new Map([['content-type', 'application/xml']]),
        text: vi.fn().mockResolvedValue(xmlResponse)
      }
      
      const mockSyncData = {
        version: '1.0.0',
        timestamp: 123456789,
        deviceId: 'device1',
        settings: { theme: 'dark' },
        quickLaunch: [],
        customSearchEngines: [],
        metadata: {
          lastModified: 123456789,
          deviceName: 'Device 1',
          appVersion: '1.0.0',
          conflictResolution: 'latest' as const
        }
      }
      
      const downloadResponse = {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: vi.fn().mockResolvedValue(mockSyncData)
      }

      ;(global.fetch as any)
        .mockResolvedValueOnce(listResponse)
        .mockResolvedValueOnce(downloadResponse)

      const result = await provider.downloadSyncData()
      expect(result.success).toBe(true)
      expect(result.message).toBe('数据下载成功')
      expect(result.syncedData).toEqual(mockSyncData)
    })

    it('should handle empty sync directory', async () => {
      const xmlResponse = `<?xml version="1.0"?>
        <d:multistatus xmlns:d="DAV:">
          <d:response>
            <d:href>/sync/</d:href>
            <d:propstat>
              <d:prop>
                <d:resourcetype><d:collection/></d:resourcetype>
              </d:prop>
            </d:propstat>
          </d:response>
        </d:multistatus>`

      const listResponse = {
        ok: true,
        status: 207,
        headers: new Map([['content-type', 'application/xml']]),
        text: vi.fn().mockResolvedValue(xmlResponse)
      }

      ;(global.fetch as any).mockResolvedValueOnce(listResponse)

      const result = await provider.downloadSyncData()
      expect(result.success).toBe(false)
      expect(result.message).toBe('未找到同步数据')
    })
  })

  describe('getAvailableDevices', () => {
    it('should extract device IDs from file names', async () => {
      const xmlResponse = `<?xml version="1.0"?>
        <d:multistatus xmlns:d="DAV:">
          <d:response>
            <d:href>/sync/sync_device1_123.json</d:href>
            <d:propstat><d:prop><d:resourcetype/></d:prop></d:propstat>
          </d:response>
          <d:response>
            <d:href>/sync/sync_device2_456.json</d:href>
            <d:propstat><d:prop><d:resourcetype/></d:prop></d:propstat>
          </d:response>
          <d:response>
            <d:href>/sync/sync_device1_789.json</d:href>
            <d:propstat><d:prop><d:resourcetype/></d:prop></d:propstat>
          </d:response>
        </d:multistatus>`

      const listResponse = {
        ok: true,
        status: 207,
        headers: new Map([['content-type', 'application/xml']]),
        text: vi.fn().mockResolvedValue(xmlResponse)
      }

      ;(global.fetch as any).mockResolvedValueOnce(listResponse)

      const devices = await provider.getAvailableDevices()
      expect(devices).toEqual(['device1', 'device2'])
    })
  })
})