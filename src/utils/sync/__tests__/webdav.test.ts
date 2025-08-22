import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebDAVClient, WebDAVSyncProvider } from '../webdav'
import type { WebDAVConfig, SyncData } from '@/types/sync'

// Mock fetch
global.fetch = vi.fn()

// Helper to create proper mock response
const createMockResponse = (options: {
  ok?: boolean
  status: number
  headers?: [string, string][]
  text?: string
  json?: any
  statusText?: string
}) => ({
  ok: options.ok ?? (options.status >= 200 && options.status < 300),
  status: options.status,
  statusText: options.statusText || 'OK',
  headers: new Headers(options.headers || []),
  text: vi.fn().mockResolvedValue(options.text || ''),
  json: vi.fn().mockResolvedValue(options.json || {}),
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
})

describe('WebDAVClient', () => {
  let client: WebDAVClient
  let mockConfig: WebDAVConfig

  beforeEach(() => {
    mockConfig = {
      url: 'https://example.com/webdav',
      username: 'testuser',
      password: 'testpass',
      path: '/sync',
      timeout: 5000
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
      const mockResponse = createMockResponse({ status: 200 })
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.testConnection()
      expect(result).toBe(true)
    })

    it('should fallback to PROPFIND if OPTIONS fails', async () => {
      const optionsResponse = createMockResponse({ 
        status: 405, 
        statusText: 'Method Not Allowed' 
      })
      
      const propfindResponse = createMockResponse({
        status: 207,
        headers: [['content-type', 'application/xml']],
        text: '<d:multistatus>test</d:multistatus>'
      })

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

      const mockResponse = createMockResponse({
        status: 207,
        headers: [['content-type', 'application/xml']],
        text: xmlResponse
      })
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.listFiles('/sync')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('file1.json')
      expect(result[0].path).toBe('/sync/file1.json')
      expect(result[0].size).toBe(1024)
    })

    it('should handle directory with collection type', async () => {
      const xmlResponse = `<?xml version="1.0"?>
        <d:multistatus xmlns:d="DAV:">
          <d:response>
            <d:href>/sync/</d:href>
            <d:propstat>
              <d:prop>
                <d:displayname>sync</d:displayname>
                <d:resourcetype><d:collection/></d:resourcetype>
              </d:prop>
            </d:propstat>
          </d:response>
        </d:multistatus>`

      const mockResponse = createMockResponse({
        status: 207,
        headers: [['content-type', 'application/xml']],
        text: xmlResponse
      })
      
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.listFiles('/sync')
      // Should filter out the directory itself
      expect(result).toHaveLength(0)
    })
  })

  describe('createDirectory', () => {
    it('should return true for successful MKCOL', async () => {
      const mockResponse = createMockResponse({ status: 201 })
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.createDirectory('/test')
      expect(result).toBe(true)
    })

    it('should return true if directory already exists (405)', async () => {
      const mockResponse = createMockResponse({ 
        status: 405, 
        statusText: 'Method Not Allowed' 
      })
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.createDirectory('/test')
      expect(result).toBe(true)
    })
  })

  describe('fileExists', () => {
    it('should return true for existing files', async () => {
      const mockResponse = createMockResponse({ status: 200 })
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.fileExists('/test.json')
      expect(result).toBe(true)
    })

    it('should return false for non-existing files', async () => {
      const mockResponse = createMockResponse({ status: 404 })
      ;(global.fetch as any).mockResolvedValueOnce(mockResponse)

      const result = await client.fileExists('/nonexistent.json')
      expect(result).toBe(false)
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
      path: '/sync',
      timeout: 5000
    }
    provider = new WebDAVSyncProvider(mockConfig)
    vi.resetAllMocks()
  })

  describe('initialization', () => {
    it('should initialize successfully with existing directory', async () => {
      // Mock connection test (OPTIONS)
      const optionsResponse = createMockResponse({ status: 200 })
      // Mock directory check (HEAD)
      const headResponse = createMockResponse({ status: 200 })

      ;(global.fetch as any)
        .mockResolvedValueOnce(optionsResponse)
        .mockResolvedValueOnce(headResponse)

      const result = await provider.initialize()
      expect(result).toBe(true)
    })

    it('should create sync directory if not exists', async () => {
      // Mock connection test
      const optionsResponse = createMockResponse({ status: 200 })
      // Mock directory check (not found)
      const headResponse = createMockResponse({ status: 404 })
      // Mock directory creation
      const mkcolResponse = createMockResponse({ status: 201 })

      ;(global.fetch as any)
        .mockResolvedValueOnce(optionsResponse)
        .mockResolvedValueOnce(headResponse)
        .mockResolvedValueOnce(mkcolResponse)

      const result = await provider.initialize()
      expect(result).toBe(true)
    })

    it('should handle initialization failure', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Connection failed'))

      const result = await provider.initialize()
      expect(result).toBe(false)
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

      // Mock successful PUT response
      const putResponse = createMockResponse({ status: 201 })

      ;(global.fetch as any).mockResolvedValueOnce(putResponse)

      const result = await provider.uploadSyncData(mockSyncData)
      expect(result.success).toBe(true)
      expect(result.message).toBe('数据上传成功')
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
      expect(result.message).toContain('Upload failed')
    })
  })

  describe('downloadSyncData', () => {
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

      const listResponse = createMockResponse({
        status: 207,
        headers: [['content-type', 'application/xml']],
        text: xmlResponse
      })

      ;(global.fetch as any).mockResolvedValueOnce(listResponse)

      const result = await provider.downloadSyncData()
      expect(result.success).toBe(false)
      expect(result.message).toBe('未找到同步数据')
    })

    it('should download latest sync data', async () => {
      // Mock file listing
      const xmlResponse = `<?xml version="1.0"?>
        <d:multistatus xmlns:d="DAV:">
          <d:response>
            <d:href>/sync/sync_device1_123456789.json</d:href>
            <d:propstat>
              <d:prop>
                <d:displayname>sync_device1_123456789.json</d:displayname>
                <d:getcontentlength>1024</d:getcontentlength>
                <d:getlastmodified>Wed, 21 Oct 2023 07:28:00 GMT</d:getlastmodified>
                <d:resourcetype/>
              </d:prop>
            </d:propstat>
          </d:response>
        </d:multistatus>`

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

      const listResponse = createMockResponse({
        status: 207,
        headers: [['content-type', 'application/xml']],
        text: xmlResponse
      })

      const downloadResponse = createMockResponse({
        status: 200,
        headers: [['content-type', 'application/json']],
        text: JSON.stringify(mockSyncData)
      })

      ;(global.fetch as any)
        .mockResolvedValueOnce(listResponse)
        .mockResolvedValueOnce(downloadResponse)

      const result = await provider.downloadSyncData()
      expect(result.success).toBe(true)
      expect(result.message).toBe('数据下载成功')
      expect(result.syncedData).toEqual(mockSyncData)
    })
  })

  describe('getAvailableDevices', () => {
    it('should extract device IDs from file names', async () => {
      const xmlResponse = `<?xml version="1.0"?>
        <d:multistatus xmlns:d="DAV:">
          <d:response>
            <d:href>/sync/sync_device1_123.json</d:href>
            <d:propstat>
              <d:prop>
                <d:displayname>sync_device1_123.json</d:displayname>
                <d:resourcetype/>
              </d:prop>
            </d:propstat>
          </d:response>
          <d:response>
            <d:href>/sync/sync_device2_456.json</d:href>
            <d:propstat>
              <d:prop>
                <d:displayname>sync_device2_456.json</d:displayname>
                <d:resourcetype/>
              </d:prop>
            </d:propstat>
          </d:response>
          <d:response>
            <d:href>/sync/sync_device1_789.json</d:href>
            <d:propstat>
              <d:prop>
                <d:displayname>sync_device1_789.json</d:displayname>
                <d:resourcetype/>
              </d:prop>
            </d:propstat>
          </d:response>
        </d:multistatus>`

      const listResponse = createMockResponse({
        status: 207,
        headers: [['content-type', 'application/xml']],
        text: xmlResponse
      })

      ;(global.fetch as any).mockResolvedValueOnce(listResponse)

      const devices = await provider.getAvailableDevices()
      expect(devices).toEqual(['device1', 'device2'])
    })

    it('should handle empty device list', async () => {
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

      const listResponse = createMockResponse({
        status: 207,
        headers: [['content-type', 'application/xml']],
        text: xmlResponse
      })

      ;(global.fetch as any).mockResolvedValueOnce(listResponse)

      const devices = await provider.getAvailableDevices()
      expect(devices).toEqual([])
    })
  })
})