import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dreamAPI } from '@/services/api'

const emotions = [
  { value: '平静', label: '平静', emoji: '😌' },
  { value: '快乐', label: '快乐', emoji: '😊' },
  { value: '惊讶', label: '惊讶', emoji: '😮' },
  { value: '恐惧', label: '恐惧', emoji: '😨' },
  { value: '悲伤', label: '悲伤', emoji: '😢' },
  { value: '愤怒', label: '愤怒', emoji: '😠' },
  { value: '焦虑', label: '焦虑', emoji: '😰' },
]

const DreamRecord: React.FC = () => {
  const [content, setContent] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null)
  const [dreamDate, setDreamDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!content.trim()) {
      return
    }

    setSaving(true)
    setError('')
    try {
      const response = await dreamAPI.create({
        content: content.trim(),
        dream_date: new Date(dreamDate).toISOString(),
        overall_emotion: selectedEmotion || undefined,
      })
      
      setSuccess(true)
      
      setTimeout(() => {
        navigate(`/dreams/${response.data.id}`)
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.detail || '保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length
  const charCount = content.length

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2 text-gradient">
          记录梦境
        </h1>
        <p className="text-night-400">
          用自然语言描述你的梦境，越详细越好
        </p>
      </div>

      {success ? (
        <div className="card p-12 text-center animate-slide-up">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-xl font-semibold mb-2 text-dream-300">
            梦境已保存
          </h2>
          <p className="text-night-400">正在跳转到解析页面...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm text-night-400 mb-1">
                    梦境日期
                  </label>
                  <input
                    type="date"
                    value={dreamDate}
                    onChange={(e) => setDreamDate(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-night-400">
                <span>{wordCount} 字</span>
                <span>{charCount} 字符</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-night-400 mb-3">
                整体情绪（可选）
              </label>
              <div className="flex flex-wrap gap-2">
                {emotions.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    onClick={() =>
                      setSelectedEmotion(
                        selectedEmotion === emotion.value ? null : emotion.value
                      )
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedEmotion === emotion.value
                        ? 'bg-dream-500/30 text-dream-300 border-2 border-dream-500'
                        : 'bg-night-800/50 text-night-300 border-2 border-transparent hover:bg-night-700/50'
                    }`}
                  >
                    <span className="mr-2">{emotion.emoji}</span>
                    {emotion.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-night-400 mb-3">
                梦境内容
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="比如：我梦见自己在一片紫色的花海中奔跑，天空中有彩色的云在流动。远处有一座白色的城堡，我感觉那里有什么重要的东西在等着我..."
                className="dream-input w-full text-lg leading-relaxed"
                rows={12}
              />
              <p className="mt-3 text-sm text-night-500">
                💡 提示：记录的细节越多，AI解析效果越好。包括场景、人物、情绪、颜色、声音等。
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setContent('')}
              className="btn-secondary"
              disabled={saving}
            >
              清空
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存并解析'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DreamRecord
