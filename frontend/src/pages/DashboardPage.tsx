import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { statisticsApi, dreamApi } from '@/lib/api';
import type { DashboardData, Dream } from '@/types';
import { getMoodName, getMoodEmoji, getMoodColor, getMotifName, lucidityToName } from '@/utils/mood';
import { formatDate } from '@/utils/date';

const StatCard: React.FC<{
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}> = ({ icon, title, value, subtitle, color = 'accent' }) => {
  return (
    <div className="card card-hover p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dream-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-dream-800">{value}</p>
          {subtitle && <p className="text-sm text-dream-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-${color}/10`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const MoodChart: React.FC<{
  data: DashboardData['emotionTrend'];
}> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">情绪趋势</h3>
        <div className="text-center py-12 text-dream-400">
          <p className="text-4xl mb-2">📊</p>
          <p>暂无情绪数据</p>
          <p className="text-sm">记录更多梦境来查看情绪趋势</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-dream-800 mb-4">情绪趋势（最近7天）</h3>
      <div className="space-y-4">
        {data.slice(0, 7).map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="w-16 text-sm text-dream-500 shrink-0">
              {formatDate(item.date, 'short').slice(5)}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {Object.entries(item.distribution).slice(0, 3).map(([mood, count]) => (
                  <span 
                    key={mood} 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: `${getMoodColor(mood)}20`, color: getMoodColor(mood) }}
                  >
                    {getMoodEmoji(mood)} {getMoodName(mood)} ({count})
                  </span>
                ))}
              </div>
              {item.dominantEmotion && (
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-lg">{getMoodEmoji(item.dominantEmotion)}</span>
                  <span className="text-sm text-dream-600">{getMoodName(item.dominantEmotion)}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopPatterns: React.FC<{
  patterns: DashboardData['topPatterns'];
}> = ({ patterns }) => {
  if (!patterns || patterns.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">重复模式</h3>
        <div className="text-center py-8 text-dream-400">
          <p className="text-3xl mb-2">🔄</p>
          <p className="text-sm">记录更多梦境来识别重复模式</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-dream-800 mb-4">重复模式</h3>
      <div className="space-y-3">
        {patterns.slice(0, 5).map((pattern, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-dream-50 hover:bg-dream-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-soft-light/10 flex items-center justify-center text-sm font-medium text-accent-dark">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-dream-800">{pattern.name}</p>
                <p className="text-xs text-dream-500">{pattern.type}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="badge badge-soft">{pattern.occurrences} 次</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CommonMotifs: React.FC<{
  motifs: DashboardData['commonMotifs'];
}> = ({ motifs }) => {
  if (!motifs || motifs.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">常见母题</h3>
        <div className="text-center py-8 text-dream-400">
          <p className="text-3xl mb-2">🎭</p>
          <p className="text-sm">记录更多梦境来识别常见母题</p>
        </div>
      </div>
    );
  }

  const motifIcons: Record<string, string> = {
    chase: '🏃',
    falling: '⬇️',
    examination: '📝',
    lost: '🗺️',
    flying: '🦋',
    death: '🌙',
    water: '💧',
    teeth: '🦷',
    naked: '👤',
    other: '✨',
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-dream-800 mb-4">常见母题</h3>
      <div className="grid grid-cols-2 gap-3">
        {motifs.slice(0, 6).map((motif, index) => (
          <div key={index} className="p-4 rounded-xl bg-gradient-to-br from-soft-light/5 to-calm-light/5 border border-dream-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{motifIcons[motif.type] || '✨'}</span>
              <span className="font-medium text-dream-800">{getMotifName(motif.type)}</span>
            </div>
            <p className="text-sm text-dream-500">{motif.occurrences} 次</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ThemeCloud: React.FC<{
  themes: DashboardData['themeCloud'];
}> = ({ themes }) => {
  if (!themes || themes.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">主题云</h3>
        <div className="text-center py-8 text-dream-400">
          <p className="text-3xl mb-2">☁️</p>
          <p className="text-sm">记录更多梦境来生成主题云</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...themes.map(t => t.count));
  const minCount = Math.min(...themes.map(t => t.count));

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return 'text-base';
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.8) return 'text-2xl';
    if (ratio > 0.6) return 'text-xl';
    if (ratio > 0.4) return 'text-lg';
    return 'text-base';
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-dream-800 mb-4">主题云</h3>
      <div className="flex flex-wrap gap-3 justify-center py-4">
        {themes.slice(0, 15).map((theme, index) => (
          <span
            key={index}
            className={`${getFontSize(theme.count)} font-medium text-accent hover:text-accent-dark cursor-pointer transition-colors`}
            style={{ opacity: 0.6 + (theme.count / maxCount) * 0.4 }}
          >
            {theme.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const RecentDreams: React.FC<{
  dreams: Dream[];
  onViewDream: (id: string) => void;
}> = ({ dreams, onViewDream }) => {
  if (!dreams || dreams.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">最近梦境</h3>
        <div className="text-center py-12 text-dream-400">
          <p className="text-4xl mb-2">🌙</p>
          <p>还没有记录梦境</p>
          <p className="text-sm">开始记录你的第一个梦境吧</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-dream-800 mb-4">最近梦境</h3>
      <div className="space-y-3">
        {dreams.slice(0, 5).map((dream) => (
          <div
            key={dream.id}
            onClick={() => onViewDream(dream.id)}
            className="p-4 rounded-xl bg-dream-50 hover:bg-dream-100 cursor-pointer transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-dream-800 group-hover:text-accent transition-colors truncate">
                  {dream.title}
                </h4>
                <p className="text-sm text-dream-500 mt-1 line-clamp-2">
                  {dream.content}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-dream-400">
                    {formatDate(dream.dreamDate, 'short')}
                  </span>
                  {dream.overallMood && (
                    <span className="inline-flex items-center gap-1 text-xs">
                      {getMoodEmoji(dream.overallMood)}
                      {getMoodName(dream.overallMood)}
                    </span>
                  )}
                  {dream.lucidity && (
                    <span className="badge badge-calm">
                      {lucidityToName[dream.lucidity] || dream.lucidity}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-3 flex items-center gap-2">
                {dream.isFavorite && (
                  <span className="text-amber-500">⭐</span>
                )}
                <svg className="w-4 h-4 text-dream-400 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentDreams, setRecentDreams] = useState<Dream[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboard, dreams] = await Promise.all([
          statisticsApi.getDashboard(),
          dreamApi.getDreams({ limit: 5, sortBy: 'dreamDate', sortOrder: 'desc' }),
        ]);
        setDashboardData(dashboard);
        setRecentDreams(dreams.dreams);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewDream = (id: string) => {
    navigate(`/dreams/${id}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dream-800">仪表盘</h1>
            <p className="text-dream-500 mt-1">探索你的梦境世界</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-20 mb-2"></div>
              <div className="skeleton h-8 w-16 mb-1"></div>
              <div className="skeleton h-3 w-24"></div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-6 w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="skeleton h-12 w-full rounded-lg"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dream-800">仪表盘</h1>
          <p className="text-dream-500 mt-1">探索你的梦境世界</p>
        </div>
        <button
          onClick={() => navigate('/dreams/create')}
          className="btn btn-primary gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          记录新梦
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="🌙"
          title="总梦境数"
          value={dashboardData?.summary.totalDreams || 0}
          subtitle="已记录的梦境"
        />
        <StatCard
          icon="✨"
          title="已分析"
          value={dashboardData?.summary.totalAnalyzed || 0}
          subtitle="AI 解析完成"
        />
        <StatCard
          icon="🔥"
          title="连续记录"
          value={dashboardData?.summary.recordingStreak || 0}
          subtitle="天"
        />
        <StatCard
          icon="📏"
          title="平均长度"
          value={`${dashboardData?.summary.averageDreamLength || 0}`}
          subtitle="字符"
        />
      </div>

      {dashboardData?.summary.mostCommonMood && (
        <div className="card p-6 bg-gradient-to-r from-soft-light/5 to-calm-light/5">
          <div className="flex items-center gap-6">
            <div className="text-5xl">
              {getMoodEmoji(dashboardData.summary.mostCommonMood)}
            </div>
            <div>
              <p className="text-sm text-dream-500 mb-1">当前主导情绪</p>
              <h3 className="text-xl font-semibold text-dream-800">
                {getMoodName(dashboardData.summary.mostCommonMood)}
              </h3>
              <p className="text-sm text-dream-500 mt-1">
                这是你近期梦境中最常出现的情绪状态
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <MoodChart data={dashboardData?.emotionTrend || []} />
        <RecentDreams dreams={recentDreams} onViewDream={handleViewDream} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <TopPatterns patterns={dashboardData?.topPatterns || []} />
        <CommonMotifs motifs={dashboardData?.commonMotifs || []} />
        <ThemeCloud themes={dashboardData?.themeCloud || []} />
      </div>

      {dashboardData?.summary.lucidityDistribution && Object.keys(dashboardData.summary.lucidityDistribution).length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-dream-800 mb-4">清醒度分布</h3>
          <div className="grid gap-4 sm:grid-cols-5">
            {Object.entries(dashboardData.summary.lucidityDistribution).map(([level, count]) => (
              <div key={level} className="text-center p-4 rounded-xl bg-dream-50">
                <p className="text-2xl font-bold text-dream-800">{count}</p>
                <p className="text-sm text-dream-500 mt-1">
                  {lucidityToName[level] || level}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
