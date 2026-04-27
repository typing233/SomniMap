import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { dreamAPI } from '@/services/api'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DreamElement {
  id: number
  element_type: string
  name: string
  description?: string
  importance: number
  context?: string
}

interface DreamAnalysis {
  id: number
  dream_id: number
  themes?: string[]
  symbols?: { name: string; description?: string; meaning?: string }[]
  psychological_insights?: string[]
  emotions?: { name: string; intensity: number; context?: string }[]
  motifs?: string[]
  detailed_analysis?: string
  confidence_score: number
}

interface Dream {
  id: number
  content: string
  dream_date: string
  overall_emotion?: string
  sleep_start_time?: string
  sleep_end_time?: string
  clarity?: number
  created_at: string
  elements: DreamElement[]
  analysis?: DreamAnalysis
}

const elementTypeLabels: Record<string, string> = {
  character: '人物',
  location: '地点',
  object: '物品',
  animal: '动物',
  color: '颜色',
  keyword: '关键词',
}

const emotionColors: Record<string, string> = {
  '恐惧': 'bg-red-500',
  '焦虑': 'bg-orange-500',
  '悲伤': 'bg-blue-500',
  '快乐': 'bg-green-500',
  '愤怒': 'bg-red-600',
  '惊讶': 'bg-yellow-500',
  '厌恶': 'bg-purple-500',
  '平静': 'bg-cyan-500',
}

const DreamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dream, setDream] = useState<Dream | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'content' | 'analysis'>('content')
  const [error, setError] = useState('')

  const fetchDream = async () => {
    if (!id) return
    setLoading(true)
    try {
      const response = await dreamAPI.getById(parseInt(id))
      setDream(response.data)
    } catch (err) {
      console.error('Failed to fetch dream:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!id) return
    setAnalyzing(true)
    setError('')
    try {
      await dreamAPI.analyze(parseInt(id))
      await fetchDream()
    } catch (err: any) {
      setError(err.response?.data?.detail || '解析失败，请稍后重试')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    if (window.confirm('确定要删除这条梦境记录吗？此操作不可撤销。')) {
      try {
        await dreamAPI.delete(parseInt(id))
        navigate('/dreams')
      } catch (err: any) {
        setError(err.response?.data?.detail || '删除失败，请稍后重试')
      }
    }
  }

  useEffect(() => {
    fetchDream()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 text-center">
          <div className="animate-pulse-slow text-4xl mb-4">🌙</div>
          <p className="text-night-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!dream) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-semibold mb-2">梦境不存在</h2>
          <Link to="/dreams" className="text-dream-300 hover:text-dream-200">
            返回梦境列表
          </Link>
        </div>
      </div>
    )
  }

  const groupedElements = dream.elements.reduce((acc, el) => {
    if (!acc[el.element_type]) {
      acc[el.element_type] = []
    }
    acc[el.element_type].push(el)
    return acc
  }, {} as Record<string, DreamElement[]>)

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Link
          to="/dreams"
          className="inline-flex items-center text-night-400 hover:text-dream-300 transition-colors mb-4"
        >
          ← 返回梦境列表
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-gradient">
              {format(new Date(dream.dream_date), 'yyyy年MM月dd日 EEEE', {
                locale: zhCN,
              })}
            </h1>
            <p className="text-night-400 text-sm mt-1">
              记录于 {format(new Date(dream.created_at), 'yyyy-MM-dd HH:mm')}
              {dream.clarity && ` · 清晰度: ${dream.clarity}/10`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!dream.analysis && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary text-sm"
              >
                {analyzing ? '解析中...' : '🔮 AI解析'}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-night-700/50">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'content'
              ? 'border-dream-500 text-dream-300'
              : 'border-transparent text-night-400 hover:text-night-300'
          }`}
        >
          梦境内容
        </button>
        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-4 py-3 text-sm font-medium transition-all border-b-2 ${
            activeTab === 'analysis'
              ? 'border-dream-500 text-dream-300'
              : 'border-transparent text-night-400 hover:text-night-300'
          }`}
        >
          {dream.analysis ? '解析结果' : '待解析'}
          {dream.analysis && (
            <span className="ml-2 px-2 py-0.5 bg-dream-500/20 text-dream-300 text-xs rounded-full">
              已解析
            </span>
          )}
        </button>
      </div>

      {activeTab === 'content' && (
        <div className="space-y-6 animate-slide-up">
          <div className="card p-6 sm:p-8">
            <h2 className="text-lg font-semibold mb-4 text-night-200">梦境原文</h2>
            <p className="text-night-100 leading-loose text-lg whitespace-pre-wrap">
              {dream.content}
            </p>
          </div>

          {Object.keys(groupedElements).length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4 text-night-200">提取的元素</h2>
              <div className="space-y-4">
                {Object.entries(groupedElements).map(([type, elements]) => (
                  <div key={type}>
                    <h3 className="text-sm font-medium text-night-400 mb-2">
                      {elementTypeLabels[type] || type}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {elements.map((el) => (
                        <div
                          key={el.id}
                          className="px-4 py-2 bg-night-700/30 rounded-xl text-sm"
                          title={el.description || el.context}
                        >
                          <span className="text-night-200">{el.name}</span>
                          {el.description && (
                            <p className="text-xs text-night-500 mt-1">{el.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="animate-slide-up">
          {dream.analysis ? (
            <div className="space-y-6">
              {dream.analysis.themes && dream.analysis.themes.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4 text-night-200">
                    🎯 核心主题
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {dream.analysis.themes.map((theme, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-dream-500/20 text-dream-300 rounded-xl text-sm font-medium"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dream.analysis.motifs && dream.analysis.motifs.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4 text-night-200">
                    🌙 梦境母题
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {dream.analysis.motifs.map((motif, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-night-700/50 text-night-200 rounded-xl text-sm border border-night-600/50"
                      >
                        {motif}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {dream.analysis.emotions && dream.analysis.emotions.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4 text-night-200">
                    💭 情绪分析
                  </h2>
                  <div className="space-y-3">
                    {dream.analysis.emotions.map((emotion, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-night-300">{emotion.name}</span>
                          <span className="text-sm text-night-400">
                            强度: {emotion.intensity}/10
                          </span>
                        </div>
                        <div className="w-full bg-night-700/50 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              emotionColors[emotion.name] || 'bg-dream-500'
                            }`}
                            style={{ width: `${(emotion.intensity / 10) * 100}%` }}
                          />
                        </div>
                        {emotion.context && (
                          <p className="text-xs text-night-500 mt-1">{emotion.context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dream.analysis.symbols && dream.analysis.symbols.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4 text-night-200">
                    🔮 象征解读
                  </h2>
                  <div className="space-y-4">
                    {dream.analysis.symbols.map((symbol, i) => (
                      <div
                        key={i}
                        className="p-4 bg-night-700/30 rounded-xl"
                      >
                        <h3 className="font-medium text-night-200 mb-2">
                          {symbol.name}
                        </h3>
                        {symbol.description && (
                          <p className="text-sm text-night-400 mb-2">
                            梦境中: {symbol.description}
                          </p>
                        )}
                        {symbol.meaning && (
                          <p className="text-sm text-dream-300">
                            💡 象征意义: {symbol.meaning}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dream.analysis.psychological_insights &&
                dream.analysis.psychological_insights.length > 0 && (
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4 text-night-200">
                      🧠 心理洞察
                    </h2>
                    <ul className="space-y-3">
                      {dream.analysis.psychological_insights.map((insight, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-night-200"
                        >
                          <span className="text-dream-400 mt-0.5">✨</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {dream.analysis.detailed_analysis && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold mb-4 text-night-200">
                    📝 详细解析
                  </h2>
                  <p className="text-night-200 leading-relaxed whitespace-pre-wrap">
                    {dream.analysis.detailed_analysis}
                  </p>
                </div>
              )}

              <div className="text-center text-night-500 text-sm">
                解析置信度: {Math.round(dream.analysis.confidence_score * 100)}%
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">🔮</div>
              <h2 className="text-xl font-semibold mb-2 text-night-200">
                等待AI解析
              </h2>
              <p className="text-night-400 mb-6">
                点击上方"AI解析"按钮，让人工智能帮你解读这个梦境
              </p>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary"
              >
                {analyzing ? '解析中...' : '开始解析'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DreamDetail
