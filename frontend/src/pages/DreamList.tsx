import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dreamAPI } from '@/services/api'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Dream {
  id: number
  content: string
  dream_date: string
  overall_emotion?: string
  created_at: string
  analysis?: {
    themes?: string[]
    motifs?: string[]
    emotions?: { name: string; intensity: number }[]
  }
}

const emotionEmojis: Record<string, string> = {
  '平静': '😌',
  '快乐': '😊',
  '惊讶': '😮',
  '恐惧': '😨',
  '悲伤': '😢',
  '愤怒': '😠',
  '焦虑': '😰',
}

const DreamList: React.FC = () => {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchDreams = async (reset = false) => {
    setLoading(true)
    try {
      const response = await dreamAPI.getList({
        skip: reset ? 0 : page * 20,
        limit: 20,
      })
      
      const newDreams = response.data
      if (reset) {
        setDreams(newDreams)
      } else {
        setDreams((prev) => [...prev, ...newDreams])
      }
      setHasMore(newDreams.length === 20)
      if (!reset && newDreams.length > 0) {
        setPage((prev) => prev + 1)
      }
    } catch (err) {
      console.error('Failed to fetch dreams:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDreams(true)
  }, [])

  if (loading && dreams.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 text-center">
          <div className="animate-pulse-slow text-4xl mb-4">🌙</div>
          <p className="text-night-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (dreams.length === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2 text-gradient">
            梦境列表
          </h1>
        </div>

        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h2 className="text-xl font-semibold mb-2 text-night-200">
            还没有梦境记录
          </h2>
          <p className="text-night-400 mb-6">
            开始记录你的第一个梦境，探索潜意识的奥秘
          </p>
          <Link to="/record" className="btn-primary inline-block">
            记录第一个梦境
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2 text-gradient">
          梦境列表
        </h1>
        <p className="text-night-400">
          共 {dreams.length} 条梦境记录
        </p>
      </div>

      <div className="space-y-4">
        {dreams.map((dream, index) => (
          <Link
            key={dream.id}
            to={`/dreams/${dream.id}`}
            className="block card p-6 card-hover animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm text-night-400">
                    {format(new Date(dream.dream_date), 'yyyy年MM月dd日 EEEE', {
                      locale: zhCN,
                    })}
                  </span>
                  {dream.overall_emotion && (
                    <span className="text-sm">
                      {emotionEmojis[dream.overall_emotion] || '💭'} {dream.overall_emotion}
                    </span>
                  )}
                  {dream.analysis && (
                    <span className="px-2 py-0.5 bg-dream-500/20 text-dream-300 text-xs rounded-full">
                      已解析
                    </span>
                  )}
                </div>

                <p className="text-night-200 line-clamp-3 leading-relaxed">
                  {dream.content}
                </p>

                {dream.analysis?.themes && dream.analysis.themes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {dream.analysis.themes.slice(0, 3).map((theme, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-night-700/50 text-night-300 text-xs rounded-full"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}

                {dream.analysis?.motifs && dream.analysis.motifs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dream.analysis.motifs.slice(0, 3).map((motif, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-dream-500/10 text-dream-400 text-xs rounded-full border border-dream-500/20"
                      >
                        {motif}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-night-500 text-sm sm:mt-1">
                →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => fetchDreams(false)}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  )
}

export default DreamList
