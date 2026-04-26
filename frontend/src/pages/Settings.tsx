import React, { useEffect, useState } from 'react'
import { configAPI } from '@/services/api'

interface UserConfig {
  id: number
  user_id: number
  volcanic_model_name: string
  privacy_mode: string
  has_api_key: boolean
}

const Settings: React.FC = () => {
  const [config, setConfig] = useState<UserConfig | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('doubao-pro-32k')
  const [privacyMode, setPrivacyMode] = useState('standard')
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    valid: boolean
    message: string
  } | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchConfig = async () => {
    try {
      const response = await configAPI.get()
      const data = response.data
      setConfig(data)
      setModelName(data.volcanic_model_name || 'doubao-pro-32k')
      setPrivacyMode(data.privacy_mode || 'standard')
      if (data.has_api_key) {
        setApiKey('••••••••••••••••')
      }
    } catch (err) {
      console.error('Failed to fetch config:', err)
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setSuccessMessage('')
    setValidationResult(null)

    try {
      const updateData: {
        volcanic_api_key?: string
        volcanic_model_name?: string
        privacy_mode?: string
      } = {
        volcanic_model_name: modelName,
        privacy_mode: privacyMode,
      }

      if (apiKey && !apiKey.includes('•')) {
        updateData.volcanic_api_key = apiKey
      }

      await configAPI.update(updateData)
      setSuccessMessage('设置已保存')
      await fetchConfig()
    } catch (err) {
      console.error('Failed to save config:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleValidate = async () => {
    if (!apiKey || apiKey.includes('•')) {
      setValidationResult({
        valid: false,
        message: '请先输入有效的API Key',
      })
      return
    }

    setValidating(true)
    setValidationResult(null)

    try {
      const response = await configAPI.validateKey()
      setValidationResult({
        valid: response.data.valid,
        message: response.data.message,
      })
    } catch (err) {
      setValidationResult({
        valid: false,
        message: '验证失败，请稍后重试',
      })
    } finally {
      setValidating(false)
    }
  }

  const clearApiKey = () => {
    setApiKey('')
    setValidationResult(null)
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

      <div className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-night-200">
            🔮 AI 配置
          </h2>
          <p className="text-night-400 text-sm mb-6">
            配置火山方舟大模型 API 以获得更深度的梦境解析
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                火山方舟 API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value)
                    setValidationResult(null)
                  }}
                  placeholder="输入你的火山方舟 API Key"
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
                从火山方舟控制台获取 API Key。配置后将使用 AI 进行深度梦境解析。
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
                {validationResult.valid ? '✅ ' : '❌ '}
                {validationResult.message}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-night-300 mb-2">
                模型名称
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="input-field w-full"
              >
                <option value="doubao-pro-32k">doubao-pro-32k</option>
                <option value="doubao-pro-128k">doubao-pro-128k</option>
                <option value="doubao-lite-32k">doubao-lite-32k</option>
                <option value="doubao-lite-128k">doubao-lite-128k</option>
              </select>
              <p className="mt-2 text-xs text-night-500">
                选择适合的模型版本。Pro 版本解析效果更好，但费用更高。
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleValidate}
                disabled={validating || !apiKey}
                className="btn-secondary disabled:opacity-50"
              >
                {validating ? '验证中...' : '验证 Key'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存设置'}
              </button>
            </div>
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
                    onChange={(e) => setPrivacyMode(e.target.value)}
                    className="mt-1 text-dream-500"
                  />
                  <div>
                    <span className="font-medium text-night-200">标准模式</span>
                    <p className="text-sm text-night-400 mt-1">
                      梦境内容仅在本地加密存储。使用 AI 解析时，内容会发送到火山方舟 API 进行处理。
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-night-700/30 rounded-xl cursor-pointer hover:bg-night-700/50 transition-colors">
                  <input
                    type="radio"
                    name="privacy_mode"
                    value="strict"
                    checked={privacyMode === 'strict'}
                    onChange={(e) => setPrivacyMode(e.target.value)}
                    className="mt-1 text-dream-500"
                  />
                  <div>
                    <span className="font-medium text-night-200">严格模式</span>
                    <p className="text-sm text-night-400 mt-1">
                      仅使用本地规则分析，不会将任何数据发送到外部 API。AI 解析功能将不可用。
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
              <div className="font-medium text-night-200">
                {config?.volcanic_model_name || '未设置'}
              </div>
            </div>

            <div className="p-4 bg-night-700/30 rounded-xl">
              <div className="text-sm text-night-400 mb-1">隐私模式</div>
              <div className="font-medium text-night-200">
                {config?.privacy_mode === 'strict' ? '严格模式' : '标准模式'}
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
                  : '❌ 不可用'}
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 text-night-200">
            ℹ️ 关于 SomniMap
          </h2>

          <div className="space-y-3 text-sm text-night-400">
            <p>
              <strong className="text-night-300">版本：</strong> 1.0.0
            </p>
            <p>
              <strong className="text-night-300">功能说明：</strong>
              SomniMap 是一个专注于心理探索和长期自我觉察的梦境记录应用。
              它可以帮助你记录梦境、分析梦境模式、追踪情绪变化，并通过 AI
              技术提供更深度的心理洞察。
            </p>
            <p>
              <strong className="text-night-300">数据安全：</strong>
              你的梦境数据存储在本地数据库中。只有当你配置了火山方舟 API
              并使用 AI 解析功能时，相关内容才会被发送到火山方舟进行处理。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
