import { useState, useEffect } from 'react';
import { tagApi } from '@/lib/api';
import type { Tag, CreateTagRequest, UpdateTagRequest } from '@/types';
import { generateTagColor } from '@/utils/mood';
import { formatDate } from '@/utils/date';

const colorOptions = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#E11D48', '#A855F7', '#22C55E', '#EA580C',
];

interface EditingTag extends Tag {
  isEditing?: boolean;
  editName?: string;
  editColor?: string;
  editDescription?: string;
}

export const TagsPage: React.FC = () => {
  const [tags, setTags] = useState<EditingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTag, setNewTag] = useState<CreateTagRequest>({
    name: '',
    color: generateTagColor(),
    description: '',
  });
  const [error, setError] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const data = await tagApi.getTags();
        setTags(data);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleCreateTag = async () => {
    if (!newTag.name.trim()) {
      setError('请输入标签名称');
      return;
    }

    try {
      const created = await tagApi.createTag({
        name: newTag.name.trim(),
        color: newTag.color,
        description: newTag.description?.trim() || undefined,
      });
      setTags((prev) => [...prev, created]);
      setShowCreateModal(false);
      setNewTag({ name: '', color: generateTagColor(), description: '' });
      setError('');
    } catch (err) {
      setError('创建标签失败，请重试');
      console.error('Failed to create tag:', err);
    }
  };

  const startEditing = (tag: EditingTag) => {
    setTags((prev) =>
      prev.map((t) =>
        t.id === tag.id
          ? { ...t, isEditing: true, editName: t.name, editColor: t.color, editDescription: t.description || '' }
          : { ...t, isEditing: false }
      )
    );
  };

  const cancelEditing = (tagId: string) => {
    setTags((prev) =>
      prev.map((t) =>
        t.id === tagId
          ? { ...t, isEditing: false, editName: undefined, editColor: undefined, editDescription: undefined }
          : t
      )
    );
  };

  const saveEditing = async (tag: EditingTag) => {
    if (!tag.editName?.trim()) {
      return;
    }

    try {
      const updateData: UpdateTagRequest = {};
      if (tag.editName !== tag.name) updateData.name = tag.editName.trim();
      if (tag.editColor !== tag.color) updateData.color = tag.editColor;
      if (tag.editDescription !== tag.description)
        updateData.description = tag.editDescription?.trim() || undefined;

      if (Object.keys(updateData).length === 0) {
        cancelEditing(tag.id);
        return;
      }

      const updated = await tagApi.updateTag(tag.id, updateData);
      setTags((prev) =>
        prev.map((t) =>
          t.id === tag.id
            ? { ...updated, isEditing: false, editName: undefined, editColor: undefined, editDescription: undefined }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to update tag:', err);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await tagApi.deleteTag(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete tag:', err);
    }
  };

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalDreamCount = tags.reduce((sum, tag) => sum + tag.dreamCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dream-800">标签管理</h1>
          <p className="text-dream-500 mt-1">
            共 {tags.length} 个标签，{totalDreamCount} 次使用
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建标签
        </button>
      </div>

      <div className="card p-6">
        <div className="relative mb-6">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dream-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索标签..."
            className="input pl-10"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-6 w-32 mb-3"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-3 w-24"></div>
              </div>
            ))}
          </div>
        ) : filteredTags.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="card card-hover p-6"
            >
              {tag.isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="label">标签名称</label>
                    <input
                      type="text"
                      value={tag.editName || ''}
                      onChange={(e) =>
                        setTags((prev) =>
                          prev.map((t) =>
                            t.id === tag.id ? { ...t, editName: e.target.value } : t
                          )
                        )
                      }
                      className="input"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label">标签颜色</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            setTags((prev) =>
                              prev.map((t) =>
                                t.id === tag.id ? { ...t, editColor: color } : t
                              )
                            )
                          }
                          className="w-8 h-8 rounded-lg border-2 transition-all"
                          style={{
                            backgroundColor: color,
                            borderColor: tag.editColor === color ? color : 'transparent',
                            boxShadow: tag.editColor === color ? `0 0 0 2px ${color}40` : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">描述 <span className="text-dream-400">(可选)</span></label>
                    <textarea
                      value={tag.editDescription || ''}
                      onChange={(e) =>
                        setTags((prev) =>
                          prev.map((t) =>
                            t.id === tag.id ? { ...t, editDescription: e.target.value } : t
                          )
                        )
                      }
                      placeholder="这个标签的用途..."
                      className="input textarea min-h-[60px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEditing(tag)}
                      className="btn btn-primary flex-1"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => cancelEditing(tag.id)}
                      className="btn btn-secondary"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: tag.color + '20' }}
                      >
                        <div
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dream-800">{tag.name}</h3>
                        <span className="badge badge-soft">{tag.dreamCount} 个梦境</span>
                      </div>
                    </div>
                  </div>

                  {tag.description && (
                    <p className="text-sm text-dream-500 mb-3 line-clamp-2">
                      {tag.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-dream-100">
                    <span className="text-xs text-dream-400">
                      创建于 {formatDate(tag.createdAt, 'short')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing(tag)}
                        className="btn btn-ghost text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(tag.id)}
                        className="btn btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-xl font-semibold text-dream-800 mb-2">
              {searchQuery ? '没有找到匹配的标签' : '还没有标签'}
            </h3>
            <p className="text-dream-500 mb-6">
              {searchQuery
                ? '尝试使用其他关键词搜索'
                : '创建标签来更好地组织你的梦境记录'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建第一个标签
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="modal-content p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-dream-800">创建新标签</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-dream-400 hover:text-dream-600 hover:bg-dream-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="label">标签名称 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newTag.name}
                  onChange={(e) => {
                    setNewTag((prev) => ({ ...prev, name: e.target.value }));
                    if (error) setError('');
                  }}
                  placeholder="例如：工作压力、童年回忆..."
                  className="input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTag();
                  }}
                />
              </div>

              <div>
                <label className="label">标签颜色</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewTag((prev) => ({ ...prev, color }))}
                      className="w-10 h-10 rounded-xl border-2 transition-all"
                      style={{
                        backgroundColor: color,
                        borderColor: newTag.color === color ? color : 'transparent',
                        boxShadow: newTag.color === color ? `0 0 0 2px ${color}40` : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="label">描述 <span className="text-dream-400">(可选)</span></label>
                <textarea
                  value={newTag.description || ''}
                  onChange={(e) => setNewTag((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="这个标签的用途..."
                  className="input textarea min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTag}
                disabled={!newTag.name.trim()}
                className="btn btn-primary flex-1"
              >
                创建标签
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div
          className="modal-backdrop"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="modal-content p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-dream-800 mb-2">确认删除标签</h3>
              <p className="text-dream-500 mb-6">
                确定要删除这个标签吗？
                <br />
                <span className="text-sm">此操作不会删除相关的梦境记录，只是移除标签关联。</span>
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteTag(deleteConfirmId)}
                  className="btn btn-danger"
                >
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
