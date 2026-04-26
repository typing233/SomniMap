import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { dreamApi, tagApi } from '@/lib/api';
import type { Dream, Tag, CreateDreamRequest, UpdateDreamRequest } from '@/types';
import { getMoodColor, generateTagColor } from '@/utils/mood';
import { getTodayString, getYesterdayString } from '@/utils/date';

const lucidityOptions = [
  { value: 'none', label: '无记忆', emoji: '😶' },
  { value: 'low', label: '模糊', emoji: '🌫️' },
  { value: 'medium', label: '部分清晰', emoji: '🌤️' },
  { value: 'high', label: '清晰', emoji: '☀️' },
  { value: 'lucid', label: '清醒梦', emoji: '✨' },
];

const moodOptions = [
  { value: 'joy', label: '愉悦', emoji: '😊' },
  { value: 'sadness', label: '悲伤', emoji: '😢' },
  { value: 'fear', label: '恐惧', emoji: '😨' },
  { value: 'anger', label: '愤怒', emoji: '😠' },
  { value: 'anxiety', label: '焦虑', emoji: '😰' },
  { value: 'peace', label: '平静', emoji: '😌' },
  { value: 'excitement', label: '兴奋', emoji: '🤩' },
  { value: 'confusion', label: '困惑', emoji: '😕' },
  { value: 'neutral', label: '中性', emoji: '😐' },
];

export const CreateDreamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = searchParams.get('edit') === 'true' && !!id;

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [dreamDate, setDreamDate] = useState(getTodayString());
  const [lucidity, setLucidity] = useState('');
  const [overallMood, setOverallMood] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [showNewTagInput, setShowNewTagInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchingDream, setFetchingDream] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await tagApi.getTags();
        setTags(data);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchDream = async () => {
      try {
        setFetchingDream(true);
        const data = await dreamApi.getDream(id);
        setContent(data.content);
        setTitle(data.title || '');
        setDreamDate(data.dreamDate.split('T')[0]);
        setLucidity(data.lucidity);
        setOverallMood(data.overallMood || '');
        setSelectedTagIds(data.tags?.map((t) => t.id) || []);
      } catch (err) {
        setError('加载梦境失败，请稍后重试');
        console.error('Failed to fetch dream:', err);
      } finally {
        setFetchingDream(false);
      }
    };

    fetchDream();
  }, [id, isEdit]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await tagApi.createTag({
        name: newTagName.trim(),
        color: generateTagColor(),
      });
      setTags((prev) => [...prev, newTag]);
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setNewTagName('');
      setShowNewTagInput(false);
    } catch (err) {
      console.error('Failed to create tag:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('请输入梦境内容');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const requestData: CreateDreamRequest | UpdateDreamRequest = {
        content: content.trim(),
        ...(title.trim() ? { title: title.trim() } : {}),
        dreamDate,
        ...(lucidity ? { lucidity: lucidity as CreateDreamRequest['lucidity'] } : {}),
        ...(overallMood ? { overallMood } : {}),
        tags: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      };

      let dream: Dream;
      if (isEdit && id) {
        dream = await dreamApi.updateDream(id, requestData as UpdateDreamRequest);
      } else {
        dream = await dreamApi.createDream(requestData as CreateDreamRequest);
      }

      navigate(`/dreams/${dream.id}`);
    } catch (err) {
      setError(isEdit ? '保存失败，请稍后重试' : '创建失败，请稍后重试');
      console.error('Failed to save dream:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const wordCount = content.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const charCount = content.length;

  if (fetchingDream) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-soft-light/30 border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-dream-500">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={isEdit ? `/dreams/${id}` : '/dreams'}
            className="flex items-center gap-2 text-dream-500 hover:text-dream-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Link>
          <h1 className="text-2xl font-bold text-dream-800">
            {isEdit ? '编辑梦境' : '记录新梦'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="card p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <label className="label">梦境标题 <span className="text-dream-400">(可选，AI 将自动生成)</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给这个梦起个名字..."
            className="input"
          />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <label className="label mb-0">梦境内容</label>
            <div className="flex items-center gap-4 text-sm text-dream-400">
              <span>{wordCount} 词</span>
              <span>{charCount} 字符</span>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`记录你的梦境...

比如：
"昨晚我梦见自己在一片无尽的草原上奔跑，天空是紫色的，远处有一座发光的城堡。突然一只巨大的蝴蝶飞到我面前，它的翅膀上有我小时候的脸..."

尽量详细描述，细节越多，AI 解析越准确。`}
            className="input textarea min-h-[300px] text-base leading-relaxed"
            autoFocus
          />
          <div className="mt-3 flex items-center justify-between text-sm text-dream-400">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span>尽量详细描述梦境的细节，包括人物、地点、情绪和场景变化</span>
            </div>
          </div>
        </div>

        <div className="card">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⚙️</span>
              <span className="font-medium text-dream-800">更多选项</span>
            </div>
            <svg
              className={`w-5 h-5 text-dream-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="px-6 pb-6 space-y-6 animate-fade-in">
              <div>
                <label className="label">梦境日期</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { value: getTodayString(), label: '今天' },
                    { value: getYesterdayString(), label: '昨天' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDreamDate(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        dreamDate === opt.value
                          ? 'bg-accent text-white'
                          : 'bg-dream-50 text-dream-600 hover:bg-dream-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={dreamDate}
                  onChange={(e) => setDreamDate(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="label">梦境清晰度</label>
                <div className="flex flex-wrap gap-2">
                  {lucidityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLucidity(lucidity === opt.value ? '' : opt.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        lucidity === opt.value
                          ? 'bg-accent text-white shadow-lg shadow-accent/25'
                          : 'bg-dream-50 text-dream-600 hover:bg-dream-100'
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">整体情绪</label>
                <div className="flex flex-wrap gap-2">
                  {moodOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setOverallMood(overallMood === opt.value ? '' : opt.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        overallMood === opt.value
                          ? 'text-white shadow-lg'
                          : 'bg-dream-50 text-dream-600 hover:bg-dream-100'
                      }`}
                      style={
                        overallMood === opt.value
                          ? { backgroundColor: getMoodColor(opt.value), boxShadow: `0 4px 14px ${getMoodColor(opt.value)}40` }
                          : {}
                      }
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">标签</label>
                  <button
                    type="button"
                    onClick={() => setShowNewTagInput(true)}
                    className="text-sm text-accent hover:text-accent-dark"
                  >
                    + 创建新标签
                  </button>
                </div>

                {showNewTagInput && (
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateTag();
                        }
                      }}
                      placeholder="输入标签名称..."
                      className="input flex-1"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateTag}
                      className="btn btn-primary"
                    >
                      创建
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewTagInput(false);
                        setNewTagName('');
                      }}
                      className="btn btn-secondary"
                    >
                      取消
                    </button>
                  </div>
                )}

                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`tag-pill border-2 transition-all ${
                          selectedTagIds.includes(tag.id)
                            ? 'shadow-md'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={
                          selectedTagIds.includes(tag.id)
                            ? { backgroundColor: `${tag.color}15`, borderColor: tag.color, color: tag.color }
                            : { backgroundColor: 'white', borderColor: '#e2e8f0', color: '#64748b' }
                        }
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        ></span>
                        {tag.name}
                        {tag.dreamCount > 0 && (
                          <span className="text-xs opacity-70">({tag.dreamCount})</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-dream-400 text-sm">还没有标签，点击上方按钮创建第一个标签</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <Link
            to={isEdit ? `/dreams/${id}` : '/dreams'}
            className="btn btn-secondary"
          >
            取消
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn btn-primary px-8 py-3 text-base gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isEdit ? '保存中...' : '保存中...'}
                </>
              ) : (
                <>
                  <span>{isEdit ? '💾' : '🌙'}</span>
                  {isEdit ? '保存修改' : '记录梦境'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="card p-6 bg-gradient-to-r from-soft-light/5 to-calm-light/5">
        <div className="flex items-start gap-4">
          <div className="text-3xl shrink-0">💡</div>
          <div>
            <h3 className="font-medium text-dream-800 mb-2">记录梦境的小提示</h3>
            <ul className="text-sm text-dream-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span><strong>醒后立即记录</strong>：梦境记忆很容易遗忘，最好在醒来后 5 分钟内记录</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span><strong>详细描述</strong>：包括视觉、听觉、嗅觉、触觉等感官体验</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span><strong>关注情绪</strong>：梦境中的情绪往往比情节更能反映潜意识</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent mt-0.5">•</span>
                <span><strong>不要过滤</strong>：即使是看似无关紧要的细节也可能有意义</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
