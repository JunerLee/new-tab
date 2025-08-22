export interface SyncData {
  version: string
  timestamp: number
  deviceId: string
  settings: any
  quickLaunch: any[]
  customSearchEngines: any[]
  metadata: SyncMetadata
}

export interface SyncMetadata {
  lastModified: number
  deviceName: string
  appVersion: string
  conflictResolution: 'latest' | 'merge' | 'manual'
}

export interface WebDAVConfig {
  url: string
  username: string
  password: string
  token?: string // 支持token认证
  path?: string
  timeout?: number
  compressionEnabled?: boolean // 是否启用压缩
  retryAttempts?: number // 重试次数
  retryDelay?: number // 重试延迟（毫秒）
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'success' | 'error'
  lastSync?: number
  lastError?: string
  progress?: number
  conflictData?: SyncConflict[]
}

export interface SyncConflict {
  path: string
  localData: any
  remoteData: any
  resolution?: 'local' | 'remote' | 'merge'
}

export interface SyncProvider {
  name: string
  type: 'webdav' | 'local' | 'cloud'
  config: WebDAVConfig | Record<string, any>
  enabled: boolean
}

export interface SyncResult {
  success: boolean
  message: string
  conflicts?: SyncConflict[]
  syncedData?: SyncData
}

export interface WebDAVResponse {
  status: number
  data?: any
  error?: string
  errorType?: string // 错误类型
  headers?: Record<string, string> // 响应头
  responseTime?: number // 响应时间
}

export interface LocalSyncData {
  exportDate: string
  version: string
  data: SyncData
}

export interface SyncSettings {
  enabled: boolean
  autoSync: boolean
  syncInterval: number // in minutes
  providers: SyncProvider[]
  activeProvider?: string
  conflictResolution: 'latest' | 'merge' | 'manual'
  retryAttempts: number
  retryDelay: number // in seconds
}

export interface DeviceInfo {
  id: string
  name: string
  platform: string
  lastSeen: number
  version: string
}

export interface SyncLog {
  timestamp: number
  action: 'sync' | 'conflict' | 'error'
  provider: string
  message: string
  details?: any
}

export type SyncEventType = 
  | 'sync-start'
  | 'sync-progress'
  | 'sync-success'
  | 'sync-error'
  | 'conflict-detected'
  | 'conflict-resolved'

export interface SyncEvent {
  type: SyncEventType
  timestamp: number
  data?: any
  error?: string
}

export interface SyncHistory {
  id: string
  timestamp: number
  provider: string
  action: 'export' | 'import' | 'sync'
  success: boolean
  details: string
  dataSize?: number
  conflicts?: number
}