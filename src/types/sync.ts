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
  path?: string
  timeout?: number
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