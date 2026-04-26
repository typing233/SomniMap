import { useState, useEffect, useCallback } from 'react';
import { statisticsApi } from '@/lib/api';
import type {
  EmotionTrend,
  PatternSummary,
  MotifSummary,
  ThemeCloudItem,
} from '@/types';
import {
  getMoodName,
  getMoodEmoji,
  getMoodColor,
  getMotifName,
  motifTypeToDescription,
} from '@/utils/mood';
import { formatDate } from '@/utils/date';

const TimeRangeSelector: React.FC<{
  value: number;
  onChange: (days: number) => void;
}> = ({ value, onChange }) => {
  const options = [
    { days: 7, label: '最近 7 天' },
    { days: 30, label: '最近 30 天' },
    { days: 90, label: '最近 3 个月' },
    { days: 180, label: '最近 6 个月' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.days}
          onClick={() => onChange(opt.days)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === opt.days
              ? 'bg-accent text-white shadow-lg shadow-accent/25'
              : 'bg-dream-50 text-dream-600 hover:bg-dream-100'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const EmotionTrendChart: React.FC<{
  data: EmotionTrend[];
}> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="card p-8">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">情绪趋势</h3>
        <div className="text-center py-8 text-dream-400">
          <p className="text-4xl mb-2">📈</p>
          <p>暂无情绪数据</p>
          <p className="text-sm">记录更多梦境来查看情绪趋势</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-dream-800 mb-6">情绪趋势</h3>
      <div className="space-y-4">
        {data.slice(0, 14).map((item, index) => {
          const total = Object.values(item.distribution).reduce((a, b) => a + b, 0) || 1;
          const entries = Object.entries(item.distribution).slice(0, 3);

          return (
            <div key={index} className="flex items-center gap-4">
              <div className="w-20 text-sm text-dream-500 shrink-0">
                {formatDate(item.date, 'short')}
              </div>
              <div className="flex-1">
                <div className="h-8 bg-dream-100 rounded-lg overflow-hidden flex">
                  {entries.map(([mood, count], moodIdx) => {
                    const width = (count / total) * 100;
                    return (
                      <div
                        key={moodIdx}
                        className="h-full transition-all"
                        style={{
                          width: `${width}%`,
                          backgroundColor: getMoodColor(mood),
                        }}
                        title={`${getMoodName(mood)}: ${count}次`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {entries.map(([mood, count], moodIdx) => (
                    <span
                      key={moodIdx}
                      className="inline-flex items-center gap-1 text-xs"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getMoodColor(mood) }}
                      />
                      {getMoodEmoji(mood)} {getMoodName(mood)} ({count})
                    </span>
                  ))}
                </div>
              </div>
              {item.dominantEmotion && (
                <div className="shrink-0 text-center">
                  <span className="text-2xl">{getMoodEmoji(item.dominantEmotion)}</span>
                  <p className="text-xs text-dream-500 mt-1">
                    {getMoodName(item.dominantEmotion)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PatternsCard: React.FC<{
  title: string;
  icon: string;
  patterns: PatternSummary[];
  type: string;
}> = ({ title, icon, patterns, type }) => {
  const filtered = patterns.filter((p) => p.type === type);

  if (filtered.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold text-dream-800">{title}</h3>
        </div>
        <p className="text-sm text-dream-400">暂无数据</p>
      </div>
    );
  }

  const maxOccurrences = Math.max(...filtered.map((p) => p.occurrences));

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-semibold text-dream-800">{title}</h3>
      </div>
      <div className="space-y-4">
        {filtered.slice(0, 5).map((pattern, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-dream-800">{pattern.name}</span>
              <span className="badge badge-soft">{pattern.occurrences} 次</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-value"
                style={{ width: `${(pattern.occurrences / maxOccurrences) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-dream-400 mt-1">
              最后出现: {formatDate(pattern.lastOccurrence, 'short')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const MotifsCard: React.FC<{
  motifs: MotifSummary[];
}> = ({ motifs }) => {
  if (!motifs || motifs.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">常见梦境母题</h3>
        <div className="text-center py-8 text-dream-400">
          <p className="text-4xl mb-2">🎭</p>
          <p>暂无母题数据</p>
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

  const maxOccurrences = Math.max(...motifs.map((m) => m.occurrences));

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-dream-800 mb-6">常见梦境母题</h3>
      <div className="space-y-4">
        {motifs.slice(0, 8).map((motif, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-dream-50 hover:bg-dream-100 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{motifIcons[motif.type] || '✨'}</span>
                <div>
                  <h4 className="font-medium text-dream-800">{getMotifName(motif.type)}</h4>
                  <p className="text-sm text-dream-500 mt-1">
                    {motifTypeToDescription[motif.type] || ''}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-bold text-accent">{motif.occurrences}</span>
                <span className="text-sm text-dream-400 ml-1">次</span>
                <div className="progress-bar w-24 mt-2">
                  <div
                    className="progress-value"
                    style={{ width: `${(motif.occurrences / maxOccurrences) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dream-100 text-sm text-dream-400">
              <span>首次: {formatDate(motif.firstOccurrence, 'short')}</span>
              <span>最近: {formatDate(motif.lastOccurrence, 'short')}</span>
              <span>平均强度: {motif.averageIntensity}/10</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ThemeCloudCard: React.FC<{
  themes: ThemeCloudItem[];
}> = ({ themes }) => {
  if (!themes || themes.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">主题云</h3>
        <div className="text-center py-8 text-dream-400">
          <p className="text-4xl mb-2">☁️</p>
          <p>暂无主题数据</p>
          <p className="text-sm">记录更多梦境来生成主题云</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...themes.map((t) => t.count));
  const minCount = Math.min(...themes.map((t) => t.count));

  const getSize = (count: number) => {
    if (maxCount === minCount) return 'text-base';
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.8) return 'text-3xl';
    if (ratio > 0.6) return 'text-2xl';
    if (ratio > 0.4) return 'text-xl';
    if (ratio > 0.2) return 'text-lg';
    return 'text-base';
  };

  const colors = [
    '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6',
    '#10b981', '#84cc16', '#eab308', '#f97316', '#ec4899',
  ];

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-dream-800 mb-6">主题云</h3>
      <div className="flex flex-wrap gap-4 justify-center py-4">
        {themes.slice(0, 20).map((theme, index) => (
          <span
            key={index}
            className={`${getSize(theme.count)} font-medium cursor-pointer hover:scale-110 transition-transform`}
            style={{
              color: colors[index % colors.length],
              opacity: 0.6 + (theme.count / maxCount) * 0.4,
            }}
            title={`${theme.name}: ${theme.count} 次出现`}
          >
            {theme.name}
          </span>
        ))}
      </div>
    </div>
  );
};

const PersonalInsightsCard: React.FC<{
  insights: string[];
}> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="card p-6 bg-gradient-to-r from-soft-light/10 to-calm-light/10">
        <h3 className="text-lg font-semibold text-dream-800 mb-4">心理洞察</h3>
        <div className="text-center py-8 text-dream-400">
          <p className="text-4xl mb-2">🧠</p>
          <p>暂无心理洞察</p>
          <p className="text-sm">记录更多梦境来获取个性化心理洞察</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 bg-gradient-to-r from-soft-light/10 to-calm-light/10">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🧠</span>
        <h3 className="text-lg font-semibold text-dream-800">心理洞察</h3>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-4 rounded-xl bg-white/60"
          >
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-accent-dark font-bold text-sm">{index + 1}</span>
            </div>
            <p className="text-dream-700 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnalysisPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [emotionTrend, setEmotionTrend] = useState<EmotionTrend[]>([]);
  const [patterns, setPatterns] = useState<PatternSummary[]>([]);
  const [motifs, setMotifs] = useState<MotifSummary[]>([]);
  const [themeCloud, setThemeCloud] = useState<ThemeCloudItem[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [trend, patternData, motifData, themeData] = await Promise.all([
        statisticsApi.getEmotionTrend(timeRange),
        statisticsApi.getPatterns(undefined, 20),
        statisticsApi.getMotifs(),
        statisticsApi.getThemeCloud(30),
      ]);
      setEmotionTrend(trend.emotionTrend);
      setPatterns(patternData.patterns);
      setMotifs(motifData.motifs);
      setThemeCloud(themeData.themeCloud);

      const generatedInsights: string[] = [];
      
      if (patternData.patterns.length > 0) {
        const topPerson = patternData.patterns.find((p) => p.type === 'person');
        if (topPerson) {
          generatedInsights.push(
            `你最近的梦境中频繁出现「${topPerson.name}」，这可能意味着这个人在你的潜意识中占据重要位置，或者与你近期的情绪状态有关。`
          );
        }
      }

      if (trend.emotionTrend.length > 0) {
        const recentEmotions = trend.emotionTrend.slice(-7);
        const positiveEmotions = ['joy', 'peace', 'excitement', 'trust'];
        const negativeEmotions = ['fear', 'anger', 'sadness', 'anxiety'];

        const positiveCount = recentEmotions.filter((e) =>
          positiveEmotions.includes(e.dominantEmotion)
        ).length;
        const negativeCount = recentEmotions.filter((e) =>
          negativeEmotions.includes(e.dominantEmotion)
        ).length;

        if (positiveCount > negativeCount) {
          generatedInsights.push(
            `你近期的梦境情绪整体偏向积极，这可能反映了你在现实生活中的良好状态。继续保持这种积极的心态。`
          );
        } else if (negativeCount > positiveCount) {
          generatedInsights.push(
            `你近期的梦境中出现了较多的负面情绪，这可能是潜意识在提醒你关注现实生活中的压力或困扰。建议适当放松和自我关怀。`
          );
        }
      }

      if (motifData.motifs.length > 0) {
        const chaseMotif = motifData.motifs.find((m) => m.type === 'chase');
        const fallingMotif = motifData.motifs.find((m) => m.type === 'falling');
        const examMotif = motifData.motifs.find((m) => m.type === 'examination');

        if (chaseMotif) {
          generatedInsights.push(
            `你有 ${chaseMotif.occurrences} 次被追逐的梦境，这类梦境通常反映你在现实生活中感到压力或需要逃避某些事情。建议思考一下生活中是否有让你感到焦虑的情境。`
          );
        }
        if (fallingMotif) {
          generatedInsights.push(
            `坠落梦境出现了 ${fallingMotif.occurrences} 次，这可能暗示你对生活中某些方面感到失控，或是对未知的恐惧。尝试找到可以掌控的小事情来重建安全感。`
          );
        }
        if (examMotif) {
          generatedInsights.push(
            `考试相关的梦境出现了 ${examMotif.occurrences} 次，这类梦境常常与自我怀疑、对表现的担忧或对未来的焦虑相关。试着关注你在生活中是否有被评判的感受。`
          );
        }
      }

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Failed to fetch analysis data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasData =
    emotionTrend.length > 0 || patterns.length > 0 || motifs.length > 0 || themeCloud.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dream-800">心理分析</h1>
          <p className="text-dream-500 mt-1">探索梦境背后的潜意识密码</p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-6 w-32 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j}>
                    <div className="skeleton h-4 w-full mb-2"></div>
                    <div className="skeleton h-2 w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : hasData ? (
        <>
          {insights.length > 0 && (
            <PersonalInsightsCard insights={insights} />
          )}

          <EmotionTrendChart data={emotionTrend} />

          <div className="grid gap-6 lg:grid-cols-3">
            <PatternsCard
              title="反复出现的人物"
              icon="👥"
              patterns={patterns}
              type="person"
            />
            <PatternsCard
              title="常见场景"
              icon="📍"
              patterns={patterns}
              type="place"
            />
            <PatternsCard
              title="重复情绪"
              icon="💭"
              patterns={patterns}
              type="emotion"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <MotifsCard motifs={motifs} />
            <ThemeCloudCard themes={themeCloud} />
          </div>

          {patterns.filter((p) => p.type === 'object').length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              <PatternsCard
                title="常见物品"
                icon="📦"
                patterns={patterns}
                type="object"
              />
              <PatternsCard
                title="动物意象"
                icon="🐾"
                patterns={patterns}
                type="animal"
              />
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h3 className="text-xl font-semibold text-dream-800 mb-2">还没有足够的数据</h3>
          <p className="text-dream-500 mb-6 max-w-md mx-auto">
            心理分析需要至少 3-5 条梦境记录才能生成有意义的洞察。继续记录你的梦境，让 AI 帮助你探索潜意识的奥秘。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-dream-500">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              记录更多梦境
            </div>
            <div className="flex items-center gap-2 text-sm text-dream-500">
              <span className="w-2 h-2 rounded-full bg-calm-light"></span>
              等待 AI 解析完成
            </div>
            <div className="flex items-center gap-2 text-sm text-dream-500">
              <span className="w-2 h-2 rounded-full bg-soft-light"></span>
              发现潜意识模式
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
