import React, { useEffect, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { statisticsAPI } from '@/services/api'

interface EmotionTrendItem {
  date: string
  dominant_emotion: string
  average_intensity: number
  emotions: { name: string; intensity: number }[]
}

interface StatisticsOverview {
  total_dreams: number
  emotion_distribution: Record<string, number>
  most_common_emotion: string | null
  recurring_motifs: { name: string; count: number; percentage: number }[]
  recurring_keywords: { word: string; count: number }[]
  pattern_strength: number
  analysis: string
}

interface ThemeCluster {
  cluster_id: number
  cluster_name: string
  dream_count: number
  keywords: string[]
  top_motifs: string[]
  top_emotions: string[]
  first_appearance: string | null
  last_appearance: string | null
  pattern_description: string
}

interface Insight {
  type: string
  title: string
  description: string
  confidence: number
}

const emotionColorMap: Record<string, string> = {
  '恐惧': '#ef4444',
  '焦虑': '#f97316',
  '悲伤': '#3b82f6',
  '快乐': '#22c55e',
  '愤怒': '#dc2626',
  '惊讶': '#eab308',
  '厌恶': '#a855f7',
  '平静': '#06b6d4',
}

const Analytics: React.FC = () => {
  const [overview, setOverview] = useState<StatisticsOverview | null>(null)
  const [emotionTrend, setEmotionTrend] = useState<EmotionTrendItem[]>([])
  const [clusters, setClusters] = useState<ThemeCluster[]>([])
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [overviewRes, trendRes, clustersRes, insightsRes] = await Promise.all([
        statisticsAPI.getOverview(),
        statisticsAPI.getEmotionTrend(),
        statisticsAPI.getThemeClusters(),
        statisticsAPI.getInsights(),
      ])

      setOverview(overviewRes.data)
      setEmotionTrend(trendRes.data.trend || [])
      setClusters(clustersRes.data.clusters || [])
      setInsights(insightsRes.data.insights || [])
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getEmotionTrendChart = () => {
    if (!emotionTrend.length) return null

    const dates = emotionTrend.map((item) => item.date)
    const intensities = emotionTrend.map((item) => item.average_intensity)
    const dominantEmotions = emotionTrend.map((item) => item.dominant_emotion)

    return {
      title: {
        text: '情绪强度趋势',
        left: 'center',
        textStyle: {
          color: '#f0f0f5',
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(37, 37, 64, 0.9)',
        borderColor: 'rgba(130, 102, 160, 0.5)',
        textStyle: {
          color: '#f0f0f5',
        },
        formatter: (params: any) => {
          const date = params[0].axisValue
          const item = emotionTrend.find((i) => i.date === date)
          let result = `<div style="font-weight: bold; margin-bottom: 8px;">${date}</div>`
          result += `<div>主导情绪: ${item?.dominant_emotion || '未知'}</div>`
          result += `<div>平均强度: ${params[0].data}/10</div>`
          return result
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: {
          lineStyle: {
            color: 'rgba(161, 161, 195, 0.3)',
          },
        },
        axisLabel: {
          color: '#a1a1c3',
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 10,
        axisLine: {
          lineStyle: {
            color: 'rgba(161, 161, 195, 0.3)',
          },
        },
        axisLabel: {
          color: '#a1a1c3',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(161, 161, 195, 0.1)',
          },
        },
      },
      series: [
        {
          name: '情绪强度',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#8266a0',
            width: 3,
          },
          itemStyle: {
            color: '#8266a0',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(130, 102, 160, 0.4)',
                },
                {
                  offset: 1,
                  color: 'rgba(130, 102, 160, 0.05)',
                },
              ],
            },
          },
          data: intensities,
        },
      ],
    }
  }

  const getEmotionDistributionChart = () => {
    if (!overview || Object.keys(overview.emotion_distribution).length === 0) return null

    const data = Object.entries(overview.emotion_distribution).map(([name, value]) => ({
      name,
      value,
      itemStyle: {
        color: emotionColorMap[name] || '#8266a0',
      },
    }))

    return {
      title: {
        text: '情绪分布',
        left: 'center',
        textStyle: {
          color: '#f0f0f5',
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(37, 37, 64, 0.9)',
        borderColor: 'rgba(130, 102, 160, 0.5)',
        textStyle: {
          color: '#f0f0f5',
        },
        formatter: '{b}: {c}次 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: {
          color: '#a1a1c3',
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#252540',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
              color: '#f0f0f5',
            },
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    }
  }

  const getMotifsChart = () => {
    if (!overview || !overview.recurring_motifs.length) return null

    const data = overview.recurring_motifs.slice(0, 8).map((m) => ({
      name: m.name,
      value: m.count,
    }))

    return {
      title: {
        text: '高频梦境母题',
        left: 'center',
        textStyle: {
          color: '#f0f0f5',
          fontSize: 16,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(37, 37, 64, 0.9)',
        borderColor: 'rgba(130, 102, 160, 0.5)',
        textStyle: {
          color: '#f0f0f5',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(161, 161, 195, 0.3)',
          },
        },
        axisLabel: {
          color: '#a1a1c3',
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(161, 161, 195, 0.1)',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.name).reverse(),
        axisLine: {
          lineStyle: {
            color: 'rgba(161, 161, 195, 0.3)',
          },
        },
        axisLabel: {
          color: '#a1a1c3',
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value).reverse(),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#8266a0' },
                { offset: 1, color: '#9a82b3' },
              ],
            },
            borderRadius: [0, 8, 8, 0],
          },
        },
      ],
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card p-12 text-center">
          <div className="animate-pulse-slow text-4xl mb-4">🗺️</div>
          <p className="text-night-400">正在绘制你的梦境心理地图...</p>
        </div>
      </div>
    )
  }

  if (!overview || overview.total_dreams === 0) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2 text-gradient">
            心理地图
          </h1>
          <p className="text-night-400">
            可视化你的情绪轨迹和梦境模式
          </p>
        </div>

        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h2 className="text-xl font-semibold mb-2 text-night-200">
            数据不足，无法生成分析
          </h2>
          <p className="text-night-400 mb-6">
            记录更多梦境后，系统将为你生成详细的情绪分析和梦境模式识别
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold mb-2 text-gradient">
          心理地图
        </h1>
        <p className="text-night-400">
          基于 {overview.total_dreams} 条梦境记录的分析结果
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">🌙</div>
          <div className="text-3xl font-bold text-dream-300 mb-1">
            {overview.total_dreams}
          </div>
          <div className="text-sm text-night-400">梦境记录</div>
        </div>

        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">
            {overview.most_common_emotion ? '💭' : '✨'}
          </div>
          <div className="text-2xl font-bold text-dream-300 mb-1">
            {overview.most_common_emotion || '无数据'}
          </div>
          <div className="text-sm text-night-400">主导情绪</div>
        </div>

        <div className="card p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-dream-300 mb-1">
            {overview.pattern_strength}%
          </div>
          <div className="text-sm text-night-400">模式强度</div>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-night-200">
            ✨ 个性化洞察
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      insight.type === 'pattern'
                        ? 'bg-dream-500/20 text-dream-300'
                        : insight.type === 'emotion'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-night-700/50 text-night-300'
                    }`}
                  >
                    {insight.type === 'pattern'
                      ? '模式'
                      : insight.type === 'emotion'
                      ? '情绪'
                      : '分析'}
                  </span>
                  <span className="text-xs text-night-500">
                    置信度 {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
                <h3 className="font-semibold text-night-200 mb-2">
                  {insight.title}
                </h3>
                <p className="text-sm text-night-400 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {emotionTrend.length > 0 && (
          <div className="card p-6">
            <ReactECharts
              option={getEmotionTrendChart()}
              style={{ height: '300px' }}
              theme="dark"
            />
          </div>
        )}

        {Object.keys(overview.emotion_distribution).length > 0 && (
          <div className="card p-6">
            <ReactECharts
              option={getEmotionDistributionChart()}
              style={{ height: '300px' }}
              theme="dark"
            />
          </div>
        )}
      </div>

      {overview.recurring_motifs.length > 0 && (
        <div className="card p-6 mb-8">
          <ReactECharts
            option={getMotifsChart()}
            style={{ height: '300px' }}
            theme="dark"
          />
        </div>
      )}

      {clusters.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-night-200">
            🎯 主题聚类
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clusters.map((cluster, index) => (
              <div
                key={cluster.cluster_id}
                className="card p-6 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-dream-300">
                    {cluster.cluster_name}
                  </h3>
                  <span className="text-sm text-night-400">
                    {cluster.dream_count} 条梦境
                  </span>
                </div>

                {cluster.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cluster.keywords.slice(0, 8).map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-night-700/50 text-night-300 text-xs rounded-full"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                {cluster.top_motifs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {cluster.top_motifs.map((m, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-dream-500/10 text-dream-400 text-xs rounded-full border border-dream-500/20"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {cluster.pattern_description && (
                  <p className="text-sm text-night-400 mt-3 leading-relaxed">
                    {cluster.pattern_description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-3 text-night-200">
          📋 综合分析
        </h2>
        <p className="text-night-400 leading-relaxed">
          {overview.analysis}
        </p>
      </div>
    </div>
  )
}

export default Analytics
