import React, { useState, useEffect } from 'react'
import { 
  Cloud, 
  Download, 
  Upload, 
  Settings, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  History,
  Trash2,
  Plus,
  Edit3,
  Save,
  X,
  HardDrive,
  Server,
  Clock,
  Shield
} from 'lucide-react'
import { useSync } from '@/hooks/useSync'
import { WebDAVConfig } from '@/types/sync'

/**
 * Sync settings component for managing data synchronization features
 */
export function SyncSettings() {
  const {
    syncState,
    syncSettings,
    syncHistory,
    isConnecting,
    isEnabled,
    isAutoSyncEnabled,
    activeProvider,
    hasProviders,
    isSyncing,
    toggleSync,
    toggleAutoSync,
    addWebDAVProvider,
    removeProvider,
    performSync,
    testWebDAVConnection,
    exportToFile,
    importFromFile,
    clearHistory,
    getSyncStats,
    updateSyncSettings,
    setActiveProvider,
    createBackup
  } = useSync()

  const [showWebDAVForm, setShowWebDAVForm] = useState(false)
  const [webdavConfig, setWebDAVConfig] = useState<WebDAVConfig>({
    url: '',
    username: '',
    password: '',
    path: '/newTab'
  })
  const [webdavName, setWebDAVName] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [connectionError, setConnectionError] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)

  const syncStats = getSyncStats()

  // Reset form when modal closes
  useEffect(() => {
    if (!showWebDAVForm) {
      setWebDAVConfig({
        url: '',
        username: '',
        password: '',
        path: '/newTab'
      })
      setWebDAVName('')
      setConnectionStatus('idle')
      setConnectionError('')
    }
  }, [showWebDAVForm])

  /**
   * Test WebDAV connection
   */
  const handleTestConnection = async () => {
    if (!webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
      setConnectionError('Please fill in all required fields')
      setConnectionStatus('error')
      return
    }

    setConnectionStatus('testing')
    setConnectionError('')

    try {
      const success = await testWebDAVConnection(webdavConfig)
      if (success) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
        setConnectionError('Connection failed. Please check your credentials and URL.')
      }
    } catch (error) {
      setConnectionStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'Connection failed')
    }
  }

  /**
   * Add WebDAV provider
   */
  const handleAddWebDAV = () => {
    if (!webdavName || !webdavConfig.url || !webdavConfig.username || !webdavConfig.password) {
      setConnectionError('Please fill in all required fields')
      return
    }

    if (connectionStatus !== 'success') {
      setConnectionError('Please test connection first')
      return
    }

    addWebDAVProvider(webdavName, webdavConfig)
    setShowWebDAVForm(false)
  }

  /**
   * Handle data import
   */
  const handleImport = async () => {
    try {
      const result = await importFromFile()
      setImportResult(result)
      setTimeout(() => setImportResult(null), 5000)
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Import failed'
      })
      setTimeout(() => setImportResult(null), 5000)
    }
  }

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  /**
   * Format file size
   */
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Get status icon
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Cloud className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Cloud className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold">Sync Settings</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keep your data synchronized across devices
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(syncState.status)}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {syncState.status === 'syncing' && syncState.progress && `${syncState.progress}%`}
            {syncState.status === 'success' && 'Synced'}
            {syncState.status === 'error' && 'Error'}
            {syncState.status === 'idle' && 'Ready'}
          </span>
        </div>
      </div>

      {/* Sync status cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{syncStats.totalSyncs}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Syncs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">{syncStats.successRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {syncStats.lastSync ? formatTimestamp(syncStats.lastSync).split(' ')[0] : 'Never'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last Sync</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {formatFileSize(syncStats.totalDataSize)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Data Size</div>
          </div>
        </div>
      </div>

      {/* Main switch */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-3">
          {isEnabled ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h4 className="font-medium">Enable Sync</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Synchronize your data across devices
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => toggleSync(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Sync options */}
      {isEnabled && (
        <div className="space-y-4">
          {/* Auto sync */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Auto Sync</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically sync every {syncSettings.syncInterval} minutes
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoSyncEnabled}
                onChange={(e) => toggleAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Sync interval */}
          {isAutoSyncEnabled && (
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <label className="block text-sm font-medium mb-2">Sync Interval (minutes)</label>
              <input
                type="number"
                min="5"
                max="1440"
                value={syncSettings.syncInterval}
                onChange={(e) => updateSyncSettings({ syncInterval: parseInt(e.target.value) || 60 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
          )}

          {/* Conflict resolution */}
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <label className="block text-sm font-medium mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Conflict Resolution
            </label>
            <select
              value={syncSettings.conflictResolution}
              onChange={(e) => updateSyncSettings({ 
                conflictResolution: e.target.value as 'latest' | 'merge' | 'manual' 
              })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="latest">Use Latest (Recommended)</option>
              <option value="merge">Smart Merge</option>
              <option value="manual">Manual Resolution</option>
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              How to handle conflicts when the same data is modified on multiple devices
            </p>
          </div>
        </div>
      )}

      {/* Sync providers */}
      {isEnabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Sync Providers</h4>
            <button
              onClick={() => setShowWebDAVForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add WebDAV</span>
            </button>
          </div>

          {/* Provider list */}
          <div className="space-y-2">
            {syncSettings.providers.map((provider) => (
              <div
                key={provider.name}
                className={`p-4 border rounded-lg ${
                  activeProvider === provider.name
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {provider.type === 'webdav' ? (
                      <Server className="w-5 h-5 text-blue-500" />
                    ) : (
                      <HardDrive className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <h5 className="font-medium">{provider.name}</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {provider.type === 'webdav' ? 'WebDAV Server' : 'Local Storage'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveProvider(provider.name)}
                      disabled={activeProvider === provider.name}
                      className={`px-3 py-1 rounded text-sm ${
                        activeProvider === provider.name
                          ? 'bg-blue-500 text-white cursor-not-allowed'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {activeProvider === provider.name ? 'Active' : 'Use'}
                    </button>
                    <button
                      onClick={() => removeProvider(provider.name)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {syncSettings.providers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No sync providers configured</p>
                <p className="text-sm">Add a WebDAV provider to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => performSync()}
          disabled={!hasProviders || isSyncing}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>

        <button
          onClick={exportToFile}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Download className="w-5 h-5" />
          <span>Export</span>
        </button>

        <button
          onClick={handleImport}
          className="flex items-center justify-center space-x-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Upload className="w-5 h-5" />
          <span>Import</span>
        </button>
      </div>

      {/* Import results */}
      {importResult && (
        <div className={`p-4 rounded-lg ${
          importResult.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {importResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={importResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
              {importResult.message}
            </span>
          </div>
        </div>
      )}

      {/* Sync history */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5" />
            <h4 className="font-medium">Sync History</h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              {showHistory ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={clearHistory}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Clear
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="max-h-64 overflow-y-auto">
            {syncHistory.length > 0 ? (
              syncHistory.map((entry) => (
                <div key={entry.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {entry.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)} - {entry.provider}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{entry.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</p>
                      {entry.dataSize && (
                        <p className="text-xs text-gray-400">{formatFileSize(entry.dataSize)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No sync history available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WebDAV configuration modal */}
      {showWebDAVForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add WebDAV Provider</h3>
              <button
                onClick={() => setShowWebDAVForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Provider Name</label>
                <input
                  type="text"
                  value={webdavName}
                  onChange={(e) => setWebDAVName(e.target.value)}
                  placeholder="My WebDAV Server"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">WebDAV URL</label>
                <input
                  type="url"
                  value={webdavConfig.url}
                  onChange={(e) => setWebDAVConfig(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://your-server.com/remote.php/dav/files/username"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={webdavConfig.username}
                  onChange={(e) => setWebDAVConfig(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={webdavConfig.password}
                  onChange={(e) => setWebDAVConfig(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Path (optional)</label>
                <input
                  type="text"
                  value={webdavConfig.path}
                  onChange={(e) => setWebDAVConfig(prev => ({ ...prev, path: e.target.value }))}
                  placeholder="/newTab"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                />
              </div>

              {connectionError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700 dark:text-red-300">{connectionError}</span>
                  </div>
                </div>
              )}

              {connectionStatus === 'success' && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300">Connection successful!</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleTestConnection}
                  disabled={connectionStatus === 'testing'}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {connectionStatus === 'testing' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wifi className="w-4 h-4" />
                  )}
                  <span>{connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  onClick={handleAddWebDAV}
                  disabled={connectionStatus !== 'success'}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  <span>Add Provider</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}