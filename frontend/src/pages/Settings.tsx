import React, { useEffect, useState } from 'react'
import { configAPI } from '@/services/api'

const DEFAULT_VOLCANIC_BASE_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const DEFAULT_MODEL = 'doubao-pro-32k'

interface UserConfig {
  id: number
  user_id: number
  volcanic_model_name: string
  volcanic_base_url: string | null
  privacy_mode: string
  has_api_key: boolean
}

interface ValidationResult {
  valid: boolean
  message: string
  base_url?: string
  model?: string
}

const Settings: React.FC = () => {
  const [config, setConfig] = useState<UserConfig | null>(null)
  
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState(DEFAULT_MODEL)
  const [baseUrl, setBaseUrl] = useState(DEFAULT_VOLCANIC_BASE_URL)
  const [privacyMode, setPrivacyMode] = useState('standard')
  
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const fetchConfig = async () => {
    try {
      const response = await configAPI.get()
      const data = response.data
      setConfig(data)
      setModelName(data.volcanic_model_name || DEFAULT_MODEL)
      setBaseUrl(data.volcanic_base_url || DEFAULT_VOLCANIC_BASE_URL)
      setPrivacyMode(data.privacy_mode || 'standard')
      if (data.has_api_key) {
        setApiKey('••••••••••••••••')
      }
      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Failed to fetch config:', err)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const markUnsaved = () => {
    setHasUnsavedChanges(true)
    setValidationResult(null)
    setSuccessMessage('')
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccessMessage('')
    setValidationResult(null)

    try {
      const updateData: {
        volcanic_api_key?: string
        volcanic_model_name?: string
        volcanic_base_url?: string
        privacy_mode?: string
      } = {
        volcanic_model_name: modelName,
        volcanic_base_url: baseUrl === DEFAULT_VOLCANIC_BASE_URL ? null : baseUrl,
        privacy_mode: privacyMode,
      }

      if (apiKey && !apiKey.includes('•')) {
        updateData.volcanic_api_key = apiKey
      }

      await configAPI.update(updateData)
      setSuccessMessage('设置已保存')
      setHasUnsavedChanges(false)
      await fetchConfig()
    } catch (err) {
      console.error('Failed to save config:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey || apiKey.includes('•')) {
      setValidationResult({
        valid: false,
        message: '请先输入有效的 API Key',
      })
      return
    }

    setValidating(true)
    setValidationResult(null)

    try {
      const response = await configAPI.testConnection({
        api_key: apiKey,
        model_name: modelName,
        base_url: baseUrl === DEFAULT_VOLCANIC_BASE_URL ? undefined : baseUrl,
      })
      
      setValidationResult({
        valid: response.data.valid,
        message: response.data.message,
        base_url: response.data.base_url,
        model: response.data.model,
      })
    } catch (err: any) {
      setValidationResult({
        valid: false,
        message: err.response?.data?.detail || '连接失败，请稍后重试',
      })
    } finally {
      setValidating(false)
    }
  }

  const clearApiKey = () => {
    setApiKey('')
    markUnsaved()
  }

  const resetToDefaults = () => {
    setBaseUrl(DEFAULT_VOLCANIC_BASE_URL)
    setModelName(DEFAULT_MODEL)
    markUnsaved()
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2 text-gradient">
          设置
        </h1>
        <p className="text-night-400">
          配置你的 SomniMap 体验
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-sm">
          ✅ {successMessage}
        </div>
      )}

      {hasUnsavedChanges && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-sm">
          ⚠️ 有未保存的更改
        </div>
      )}

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-night-200">
            🔮 AI 服务配置
          </h2>
          <p className="text-night-400 text-sm mb-6">
            配置 OpenAI 兼容的 API 服务以获得更深度的梦境解析。支持火山方舟、Ollama 等兼容服务。
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                API Base URL
                <span className="text-night-500 ml-2">(OpenAI 兼容格式)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => {
                    setBaseUrl(e.target.value)
                    markUnsaved()
                  }}
                  placeholder="https://ark.cn-beijing.volces.com/api/v3/chat/completions"
                  className="input-field flex-1 font-mono text-sm"
                />
                <button
                  onClick={resetToDefaults}
                  className="px-4 py-2 bg-night-700 hover:bg-night-600 rounded-xl text-sm transition-colors text-night-300 whitespace-nowrap"
                >
                  恢复默认
                </button>
              </div>
              <p className="mt-2 text-xs text-night-500">
                示例：火山方舟 <code className="text-dream-300">https://ark.cn-beijing.volces.com/api/v3/chat/completions</code> | 
                Ollama <code className="text-dream-300">http://localhost:11434/v1/chat/completions</code>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    markUnsaved()
                  }}
                  placeholder="输入你的 API Key"
                  className="input-field flex-1"
                />
                {apiKey.includes('•') && (
                  <button
                    onClick={clearApiKey}
                    className="px-4 py-2 bg-night-700 hover:bg-night-600 rounded-xl text-sm transition-colors"
                  >
                    重新输入
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-night-500">
                从你的 API 服务商获取。Ollama 等本地服务可留空或填写任意值。
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                模型名称
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => {
                    setModelName(e.target.value)
                    markUnsaved()
                  }}
                  placeholder="例如: doubao-pro-32k, llama3:8b, gpt-4"
                  className="input-field flex-1"
                />
              </div>
              <p className="mt-2 text-xs text-night-500">
                火山方舟：<code className="text-dream-300">doubao-pro-32k</code> | 
                Ollama：<code className="text-dream-300">llama3:8b</code> | 
                OpenAI：<code className="text-dream-300">gpt-4</code>
              </p>
            </div>

            {validationResult && (
              <div
                className={`p-4 rounded-xl text-sm ${
                  validationResult.valid
                    ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span>{validationResult.valid ? '✅' : '❌'}</span>
                  <div>
                    <p>{validationResult.message}</p>
                    {validationResult.base_url && (
                      <p className="mt-1 text-xs opacity-70">
                        测试地址: {validationResult.base_url}
                        {validationResult.model && ` (模型: ${validationResult.model})`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleTestConnection}
                disabled={validating || !apiKey}
                className="btn-secondary disabled:opacity-50"
              >
                {validating ? '连接测试中...' : '🔍 测试连接'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? '保存中...' : '💾 保存设置'}
              </button>
            </div>
            
            <p className="text-xs text-night-500 mt-2">
              💡 提示：可以先测试连接确认配置正确后再保存
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-night-200">
            🔒 隐私设置
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                隐私模式
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 bg-night-700/30 rounded-xl cursor-pointer hover:bg-night-700/50 transition-colors">
                  <input
                    type="radio"
                    name="privacy_mode"
                    value="standard"
                    checked={privacyMode === 'standard'}
                    onChange={(e) => {
                      setPrivacyMode(e.target.value)
                      markUnsaved()
                    }}
                    className="mt-1 text-dream-500"
                  />
                  <div>
                    <span className="font-medium text-night-200">标准模式</span>
                    <p className="text-sm text-night-400 mt-1">
                      梦境内容仅在本地加密存储。使用 AI 解析时，内容会发送到配置的 API 服务进行处理。
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-night-700/30 rounded-xl cursor-pointer hover:bg-night-700/50 transition-colors">
                  <input
                    type="radio"
                    name="privacy_mode"
                    value="strict"
                    checked={privacyMode === 'strict'}
                    onChange={(e) => {
                      setPrivacyMode(e.target.value)
                      markUnsaved()
                    }}
                    className="mt-1 text-dream-500"
                  />
                  <div>
                    <span className="font-medium text-night-200">严格模式 (纯本地)</span>
                    <p className="text-sm text-night-400 mt-1">
                      <strong className="text-amber-400">禁止任何外部 API 调用。</strong>
                      仅使用本地规则分析，不会将任何数据发送到外部。AI 深度解析功能将不可用，仅使用基础关键词匹配。
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                保存隐私设置
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-night-200">
            📋 当前状态
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-night-700/30 rounded-xl">
              <div className="text-sm text-night-400 mb-1">API Key 状态</div>
              <div className={`font-medium ${
                config?.has_api_key ? 'text-green-400' : 'text-night-500'
              }`}>
                {config?.has_api_key ? '✅ 已配置' : '❌ 未配置'}
              </div>
            </div>

            <div className="p-4 bg-night-700/30 rounded-xl">
              <div className="text-sm text-night-400 mb-1">当前模型</div>
              <div className="font-medium text-night-200 truncate" title={config?.volcanic_model_name}>
                {config?.volcanic_model_name || '未设置'}
              </div>
            </div>

            <div className="p-4 bg-night-700/30 rounded-xl">
              <div className="text-sm text-night-400 mb-1">隐私模式</div>
              <div className="font-medium text-night-200">
                {config?.privacy_mode === 'strict' ? '🔒 严格模式' : '📤 标准模式'}
              </div>
            </div>

            <div className="p-4 bg-night-700/30 rounded-xl">
              <div className="text-sm text-night-400 mb-1">AI 解析能力</div>
              <div className={`font-medium ${
                config?.has_api_key && config?.privacy_mode !== 'strict'
                  ? 'text-green-400'
                  : 'text-night-500'
              }`}>
                {config?.has_api_key && config?.privacy_mode !== 'strict'
                  ? '✅ 可用'
                  : config?.privacy_mode === 'strict'
                    ? '🔒 严格模式禁用'
                    : '❌ 未配置'}
              </div>
            </div>
          </div>
          
          {config?.volcanic_base_url && (
            <div className="mt-4 p-4 bg-night-700/30 rounded-xl">
              <div className="text-sm text-night-400 mb-1">API 地址</div>
              <div className="font-mono text-xs text-night-300 break-all">
                {config.volcanic_base_url}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-night-200">
            ℹ️ 关于 SomniMap
          </h2>

          <div className="space-y-3 text-sm text-night-400">
            <p>
              <strong className="text-night-300">版本：</strong> 2.0.0
            </p>
            <p>
              <strong className="text-night-300">功能说明：</strong>
              SomniMap 是一个专注于心理探索和长期自我觉察的梦境记录应用。
              它可以帮助你记录梦境、分析梦境模式、追踪情绪变化，并通过 AI
              技术提供更深度的心理洞察。
            </p>
            <p>
              <strong className="text-night-300">数据安全：</strong>
              你的梦境数据存储在本地数据库中。只有当你配置了 API 服务
              并使用 AI 解析功能时，相关内容才会被发送到配置的服务进行处理。
              选择「严格模式」可完全禁止外部网络调用。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
