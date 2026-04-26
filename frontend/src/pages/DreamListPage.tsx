import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dreamApi, tagApi } from '@/lib/api';
import type { Dream, Tag } from '@/types';
import { getMoodName, getMoodEmoji, lucidityToName } from '@/utils/mood';
import { formatDate } from '@/utils/date';

interface FilterState {
  search: string;
  tag: string;
  mood: string;
  lucidity: string;
  isFavorite: boolean;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const DreamCard: React.FC<{
  dream: Dream;
  onClick: () => void;
}> = ({ dream, onClick }) => {
  const statusMap = {
    pending: { label: '待解析', color: 'badge-warning' },
    processing: { label: '解析中', color: 'badge-soft' },
    completed: { label: '已解析', color: 'badge-success' },
    failed: { label: '解析失败', color: 'badge-danger' },
  };

  const status = statusMap[dream.analysisStatus] || statusMap.pending;

  return (
    <div
      onClick={onClick}
      className="card card-hover p-6 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {dream.overallMood && (
            <span className="text-2xl">{getMoodEmoji(dream.overallMood)}</span>
          )}
          <div>
            <h3 className="font-semibold text-dream-800 group-hover:text-accent transition-colors">
              {dream.title}
            </h3>
            <p className="text-sm text-dream-500">
              {formatDate(dream.dreamDate, 'long')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dream.isFavorite && (
            <span className="text-amber-500">⭐</span>
          )}
          <span className={`badge ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <p className="text-dream-600 line-clamp-3 mb-4 leading-relaxed">
        {dream.content}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {dream.overallMood && (
            <span className="inline-flex items-center gap-1 text-sm text-dream-500">
              {getMoodName(dream.overallMood)}
            </span>
          )}
          {dream.lucidity && dream.lucidity !== 'none' && (
            <span className="badge badge-calm">
              {lucidityToName[dream.lucidity] || dream.lucidity}
            </span>
          )}
          {dream.tags && dream.tags.length > 0 && dream.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="badge"
              style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <svg className="w-5 h-5 text-dream-400 group-hover:text-accent group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

const FilterPanel: React.FC<{
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  tags: Tag[];
  onClear: () => void;
  hasActiveFilters: boolean;
}> = ({ filters, setFilters, tags, onClear, hasActiveFilters }) => {
  const [expanded, setExpanded] = useState(false);

  const moods = [
    { value: '', label: '全部情绪' },
    { value: 'joy', label: '愉悦' },
    { value: 'sadness', label: '悲伤' },
    { value: 'fear', label: '恐惧' },
    { value: 'anger', label: '愤怒' },
    { value: 'anxiety', label: '焦虑' },
    { value: 'peace', label: '平静' },
    { value: 'excitement', label: '兴奋' },
    { value: 'confusion', label: '困惑' },
  ];

  const lucidities = [
    { value: '', label: '全部清晰度' },
    { value: 'none', label: '无记忆' },
    { value: 'low', label: '模糊' },
    { value: 'medium', label: '部分清晰' },
    { value: 'high', label: '清晰' },
    { value: 'lucid', label: '清醒梦' },
  ];

  const sortOptions = [
    { value: 'dreamDate', label: '按梦境日期' },
    { value: 'createdAt', label: '按记录时间' },
    { value: 'title', label: '按标题' },
  ];

  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dream-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="搜索梦境内容..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="btn btn-secondary gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              筛选
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-accent rounded-full"></span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="btn btn-ghost"
              >
                清除
              </button>
            )}
          </div>
        </div>

        {expanded && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-dream-100 animate-fade-in">
            <div>
              <label className="label">情绪</label>
              <select
                value={filters.mood}
                onChange={(e) => setFilters((f) => ({ ...f, mood: e.target.value }))}
                className="input"
              >
                {moods.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">清晰度</label>
              <select
                value={filters.lucidity}
                onChange={(e) => setFilters((f) => ({ ...f, lucidity: e.target.value }))}
                className="input"
              >
                {lucidities.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">标签</label>
              <select
                value={filters.tag}
                onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
                className="input"
              >
                <option value="">全部标签</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">排序</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
                className="input"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">开始日期</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                className="input"
              />
            </div>

            <div>
              <label className="label">结束日期</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                className="input"
              />
            </div>

            <div>
              <label className="label">排序方式</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters((f) => ({ ...f, sortOrder: e.target.value as 'asc' | 'desc' }))}
                className="input"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isFavorite}
                  onChange={(e) => setFilters((f) => ({ ...f, isFavorite: e.target.checked }))}
                  className="w-4 h-4 text-accent rounded"
                />
                <span className="text-sm text-dream-700">仅显示收藏</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`btn ${currentPage === 1 ? 'btn-primary' : 'btn-ghost'}`}
          >
            1
          </button>
          {startPage > 2 && <span className="text-dream-400">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`btn ${currentPage === page ? 'btn-primary' : 'btn-ghost'}`}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-dream-400">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`btn ${currentPage === totalPages ? 'btn-primary' : 'btn-ghost'}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export const DreamListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [dreams, setDreams] = useState<Dream[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tag: '',
    mood: '',
    lucidity: '',
    isFavorite: false,
    startDate: '',
    endDate: '',
    sortBy: searchParams.get('sortBy') || 'dreamDate',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  });

  const hasActiveFilters = !!(
    filters.search ||
    filters.tag ||
    filters.mood ||
    filters.lucidity ||
    filters.isFavorite ||
    filters.startDate ||
    filters.endDate
  );

  const fetchDreams = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: 12,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      if (filters.search) params.search = filters.search;
      if (filters.tag) params.tag = filters.tag;
      if (filters.mood) params.mood = filters.mood;
      if (filters.lucidity) params.lucidity = filters.lucidity;
      if (filters.isFavorite) params.isFavorite = true;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await dreamApi.getDreams(params);
      setDreams(response.dreams);
      setCurrentPage(response.meta.page);
      setTotalPages(response.meta.pages);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Failed to fetch dreams:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await tagApi.getTags();
      setTags(response);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    fetchDreams();
  }, [fetchDreams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      tag: '',
      mood: '',
      lucidity: '',
      isFavorite: false,
      startDate: '',
      endDate: '',
      sortBy: 'dreamDate',
      sortOrder: 'desc',
    });
  };

  const handleViewDream = (id: string) => {
    navigate(`/dreams/${id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dream-800">梦境记录</h1>
          <p className="text-dream-500 mt-1">
            {total > 0 ? `共 ${total} 条梦境记录` : '开始记录你的梦境吧'}
          </p>
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

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        tags={tags}
        onClear={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-8 h-8 rounded-full"></div>
                <div>
                  <div className="skeleton h-5 w-32 mb-2"></div>
                  <div className="skeleton h-4 w-24"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : dreams.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dreams.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                onClick={() => handleViewDream(dream.id)}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h3 className="text-xl font-semibold text-dream-800 mb-2">
            {hasActiveFilters ? '没有找到匹配的梦境' : '还没有记录梦境'}
          </h3>
          <p className="text-dream-500 mb-6">
            {hasActiveFilters
              ? '尝试调整筛选条件，或清除所有筛选'
              : '开始记录你的第一个梦境，探索潜意识的奥秘'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button onClick={handleClearFilters} className="btn btn-secondary">
                清除筛选
              </button>
            ) : (
              <button
                onClick={() => navigate('/dreams/create')}
                className="btn btn-primary gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                记录第一个梦境
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
