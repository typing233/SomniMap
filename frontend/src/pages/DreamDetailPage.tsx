import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { dreamApi } from '@/lib/api';
import type { Dream, DreamElement, Theme, Symbol, PsychologicalClue, SceneChange } from '@/types';
import {
  getMoodName,
  getMoodEmoji,
  getMoodColor,
  lucidityToName,
  elementTypeToName,
  elementTypeToIcon,
  psychologicalClueTypeToName,
  psychologicalClueTypeToDescription,
  getThemesByCategory,
} from '@/utils/mood';
import { formatDate } from '@/utils/date';

const AnalysisSection: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold text-dream-800">{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-dream-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="px-6 pb-6 border-t border-dream-100 pt-4">{children}</div>}
    </div>
  );
};

const DreamQualityBar: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-dream-600">{label}</span>
      <span className="text-dream-800 font-medium">{value}%</span>
    </div>
    <div className="progress-bar">
      <div
        className="progress-value"
        style={{ width: `${value}%`, backgroundColor: color }}
      ></div>
    </div>
  </div>
);

const ElementsGrid: React.FC<{
  elements: DreamElement[];
}> = ({ elements }) => {
  const grouped = elements.reduce(
    (acc, el) => {
      if (!acc[el.type]) acc[el.type] = [];
      acc[el.type].push(el);
      return acc;
    },
    {} as Record<string, DreamElement[]>
  );

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, typeElements]) => (
        <div key={type}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{elementTypeToIcon[type] || '📌'}</span>
            <h4 className="font-medium text-dream-800">{elementTypeToName[type] || type}</h4>
            <span className="badge badge-soft">{typeElements.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {typeElements.map((el, idx) => (
              <div
                key={idx}
                className="inline-flex flex-col gap-1 px-4 py-2 rounded-xl bg-dream-50 hover:bg-dream-100 transition-colors cursor-default"
                title={el.description}
              >
                <span className="font-medium text-dream-800">{el.name}</span>
                {el.significance && (
                  <div className="flex items-center gap-1">
                    <div className="progress-bar h-1 w-16">
                      <div
                        className="progress-value"
                        style={{ width: `${el.significance * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-dream-400">{el.significance}/10</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ScenesTimeline: React.FC<{
  scenes: SceneChange[];
}> = ({ scenes }) => {
  if (scenes.length === 0) {
    return <p className="text-dream-500 text-sm">未检测到明显的场景变化</p>;
  }

  return (
    <div className="space-y-4">
      {scenes.map((scene, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-soft-light/20 flex items-center justify-center text-sm font-medium text-accent-dark">
              {scene.order || idx + 1}
            </div>
            {idx < scenes.length - 1 && (
              <div className="w-0.5 h-full bg-dream-200 my-2"></div>
            )}
          </div>
          <div className="flex-1 pb-4">
            {scene.location && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-calm-light/10 text-calm-dark text-sm mb-2">
                📍 {scene.location}
              </span>
            )}
            <p className="text-dream-700 leading-relaxed">{scene.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const ThemesList: React.FC<{
  themes: Theme[];
}> = ({ themes }) => {
  const categorized = getThemesByCategory(themes);

  return (
    <div className="space-y-6">
      {Object.entries(categorized).map(([category, categoryThemes]) => (
        <div key={category}>
          <h4 className="font-medium text-dream-800 mb-3">{category}</h4>
          <div className="space-y-2">
            {categoryThemes.map((theme, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-dream-50"
              >
                <div className="flex-1">
                  <span className="font-medium text-dream-800">{theme.name}</span>
                  {theme.description && (
                    <p className="text-sm text-dream-500 mt-1">{theme.description}</p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <div className="progress-bar w-20">
                    <div
                      className="progress-value"
                      style={{ width: `${theme.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-dream-600 w-12 text-right">
                    {theme.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const SymbolsList: React.FC<{
  symbols: Symbol[];
}> = ({ symbols }) => {
  if (symbols.length === 0) {
    return <p className="text-dream-500 text-sm">未提取到明确的象征意象</p>;
  }

  return (
    <div className="space-y-4">
      {symbols.map((symbol, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl bg-gradient-to-r from-soft-light/5 to-calm-light/5 border border-dream-100"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-medium text-dream-800 text-lg">{symbol.name}</h4>
              <p className="text-sm text-dream-500 mt-1">语境: {symbol.context}</p>
            </div>
            <div className="badge badge-soft shrink-0">
              重要度 {symbol.significance}/10
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-dream-100">
            <p className="text-dream-700 leading-relaxed">
              <span className="font-medium text-accent-dark">象征意义：</span>
              {symbol.meaning}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const PsychologicalCluesList: React.FC<{
  clues: PsychologicalClue[];
}> = ({ clues }) => {
  if (clues.length === 0) {
    return <p className="text-dream-500 text-sm">未提取到明确的心理线索</p>;
  }

  const typeIcons: Record<string, string> = {
    conflict: '⚔️',
    desire: '💫',
    fear: '😰',
    memory: '📜',
    pattern: '🔄',
  };

  return (
    <div className="space-y-4">
      {clues.map((clue, idx) => (
        <div
          key={idx}
          className="p-4 rounded-xl border"
          style={{
            backgroundColor: `${getMoodColor(clue.type === 'fear' ? 'fear' : clue.type === 'conflict' ? 'anxiety' : 'peace')}10`,
            borderColor: `${getMoodColor(clue.type === 'fear' ? 'fear' : clue.type === 'conflict' ? 'anxiety' : 'peace')}30`,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl shrink-0">
              {typeIcons[clue.type] || '💭'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-dream-800">
                  {psychologicalClueTypeToName[clue.type] || clue.type}
                </h4>
                <span className="badge" style={{
                  backgroundColor: `${getMoodColor(clue.type === 'fear' ? 'fear' : clue.type === 'conflict' ? 'anxiety' : 'peace')}20`,
                  color: getMoodColor(clue.type === 'fear' ? 'fear' : clue.type === 'conflict' ? 'anxiety' : 'peace'),
                }}>
                  强度 {clue.intensity}/10
                </span>
              </div>
              <p className="text-dream-700 leading-relaxed mb-3">{clue.description}</p>
              <p className="text-xs text-dream-500">
                {psychologicalClueTypeToDescription[clue.type] || ''}
              </p>
              {clue.evidence && clue.evidence.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dream-100">
                  <p className="text-sm font-medium text-dream-600 mb-2">证据线索：</p>
                  <ul className="space-y-1">
                    {clue.evidence.map((ev, evIdx) => (
                      <li key={evIdx} className="text-sm text-dream-500 flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DreamDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDream = async () => {
      try {
        setLoading(true);
        const data = await dreamApi.getDream(id);
        setDream(data);
        setIsFavorite(data.isFavorite);
      } catch (err) {
        setError('加载梦境失败，请稍后重试');
        console.error('Failed to fetch dream:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDream();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!dream) return;
    try {
      const newFavorite = !isFavorite;
      await dreamApi.updateDream(dream.id, { isFavorite: newFavorite });
      setIsFavorite(newFavorite);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleReanalyze = async () => {
    if (!dream) return;
    try {
      setReanalyzing(true);
      await dreamApi.reanalyzeDream(dream.id);
      const updatedDream = await dreamApi.getDream(dream.id);
      setDream(updatedDream);
    } catch (err) {
      console.error('Failed to reanalyze:', err);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!dream) return;
    try {
      await dreamApi.deleteDream(dream.id);
      navigate('/dreams');
    } catch (err) {
      console.error('Failed to delete dream:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="card p-6">
          <div className="skeleton h-8 w-64 mb-4"></div>
          <div className="skeleton h-4 w-48 mb-6"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-4 w-full"></div>
            ))}
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6">
            <div className="skeleton h-6 w-40"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !dream) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-dream-800 mb-2">梦境不存在</h3>
          <p className="text-dream-500 mb-6">{error || '无法找到请求的梦境记录'}</p>
          <Link to="/dreams" className="btn btn-primary">
            返回梦境列表
          </Link>
        </div>
      </div>
    );
  }

  const analysis = dream.analysis;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          to="/dreams"
          className="flex items-center gap-2 text-dream-500 hover:text-dream-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            className="btn btn-secondary gap-2"
          >
            <span className={isFavorite ? 'text-amber-500' : 'text-dream-400'}>
              {isFavorite ? '⭐' : '☆'}
            </span>
            {isFavorite ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={() => navigate(`/dreams/${id}?edit=true`)}
            className="btn btn-secondary gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            编辑
          </button>
          {analysis && (
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="btn btn-secondary gap-2"
            >
              <svg className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {reanalyzing ? '重新解析中...' : '重新解析'}
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn btn-danger gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            删除
          </button>
        </div>
      </div>

      <div className="card p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dream-900">{dream.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-dream-500 text-sm">
                📅 {formatDate(dream.dreamDate, 'long')}
              </span>
              {dream.overallMood && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: `${getMoodColor(dream.overallMood)}20`,
                    color: getMoodColor(dream.overallMood),
                  }}
                >
                  {getMoodEmoji(dream.overallMood)} {getMoodName(dream.overallMood)}
                </span>
              )}
              {dream.lucidity && dream.lucidity !== 'none' && (
                <span className="badge badge-calm">
                  {lucidityToName[dream.lucidity] || dream.lucidity}
                </span>
              )}
            </div>
          </div>
          {dream.tags && dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {dream.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="badge"
                  style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="prose prose-invert max-w-none">
          <div className="text-dream-700 leading-relaxed whitespace-pre-wrap text-lg">
            {dream.content}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-dream-100 flex flex-wrap items-center justify-between gap-4 text-sm text-dream-500">
          <div className="flex items-center gap-4">
            <span>记录于 {formatDate(dream.createdAt, 'long')}</span>
            {dream.updatedAt !== dream.createdAt && (
              <span>最后编辑 {formatDate(dream.updatedAt, 'relative')}</span>
            )}
          </div>
          <span className="text-dream-400">
            共 {dream.content.length} 字符
          </span>
        </div>
      </div>

      {analysis && (
        <>
          {analysis.summary && (
            <div className="card p-6 bg-gradient-to-r from-soft-light/10 to-calm-light/10">
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">💭</div>
                <div>
                  <h3 className="font-semibold text-dream-800 mb-2">AI 摘要</h3>
                  <p className="text-dream-700 leading-relaxed">{analysis.summary}</p>
                </div>
              </div>
            </div>
          )}

          {analysis.dreamQuality && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dream-800 mb-6">梦境质量</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <DreamQualityBar
                  label="清晰度"
                  value={analysis.dreamQuality.vividness}
                  color="#8b5cf6"
                />
                <DreamQualityBar
                  label="情绪强度"
                  value={analysis.dreamQuality.emotionalIntensity}
                  color="#ec4899"
                />
                <DreamQualityBar
                  label="清醒度"
                  value={analysis.dreamQuality.lucidity}
                  color="#3b82f6"
                />
                <DreamQualityBar
                  label="叙事连贯性"
                  value={analysis.dreamQuality.narrativeCoherence}
                  color="#10b981"
                />
              </div>
            </div>
          )}

          {analysis.elements && analysis.elements.length > 0 && (
            <AnalysisSection title="梦境元素" icon="🔍">
              <ElementsGrid elements={analysis.elements} />
            </AnalysisSection>
          )}

          {analysis.scenes && analysis.scenes.length > 0 && (
            <AnalysisSection title="场景变化" icon="🎬">
              <ScenesTimeline scenes={analysis.scenes} />
            </AnalysisSection>
          )}

          {analysis.themes && analysis.themes.length > 0 && (
            <AnalysisSection title="主题分析" icon="📚">
              <ThemesList themes={analysis.themes} />
            </AnalysisSection>
          )}

          {analysis.symbols && analysis.symbols.length > 0 && (
            <AnalysisSection title="象征意象" icon="🔮">
              <SymbolsList symbols={analysis.symbols} />
            </AnalysisSection>
          )}

          {analysis.psychologicalClues && analysis.psychologicalClues.length > 0 && (
            <AnalysisSection title="心理线索" icon="🧠">
              <PsychologicalCluesList clues={analysis.psychologicalClues} />
            </AnalysisSection>
          )}

          {analysis.interpretation && (
            <AnalysisSection title="综合解读" icon="✨">
              <div className="prose max-w-none">
                <p className="text-dream-700 leading-relaxed whitespace-pre-wrap">
                  {analysis.interpretation}
                </p>
              </div>
            </AnalysisSection>
          )}

          {analysis.questionsForReflection && analysis.questionsForReflection.length > 0 && (
            <AnalysisSection title="反思问题" icon="❓">
              <div className="space-y-3">
                {analysis.questionsForReflection.map((question, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-dream-50"
                  >
                    <span className="text-accent-dark font-bold text-lg">{idx + 1}.</span>
                    <p className="text-dream-700 leading-relaxed">{question}</p>
                  </div>
                ))}
              </div>
            </AnalysisSection>
          )}

          <div className="card p-6 text-center">
            <p className="text-sm text-dream-400">
              解析由 AI 模型 {analysis.modelUsed} 生成，版本 {analysis.version}
              <br />
              分析完成于 {formatDate(analysis.createdAt, 'long')}
            </p>
          </div>
        </>
      )}

      {!analysis && dream.analysisStatus === 'processing' && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4 animate-pulse">🔮</div>
          <h3 className="text-xl font-semibold text-dream-800 mb-2">正在解析梦境...</h3>
          <p className="text-dream-500 mb-4">AI 正在深入分析你的梦境内容，这可能需要一些时间</p>
          <div className="progress-bar max-w-xs mx-auto">
            <div className="progress-value animate-pulse" style={{ width: '50%' }}></div>
          </div>
          <p className="text-sm text-dream-400 mt-4">你可以稍后刷新页面查看结果</p>
        </div>
      )}

      {!analysis && dream.analysisStatus === 'failed' && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-dream-800 mb-2">解析失败</h3>
          <p className="text-dream-500 mb-6">AI 解析过程中出现错误，请稍后重试</p>
          <button onClick={handleReanalyze} disabled={reanalyzing} className="btn btn-primary gap-2">
            <svg className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {reanalyzing ? '重试中...' : '重新解析'}
          </button>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-dream-800 mb-2">确认删除</h3>
              <p className="text-dream-500 mb-6">
                确定要删除这个梦境记录吗？此操作无法撤销，梦境内容和相关分析将永久删除。
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
