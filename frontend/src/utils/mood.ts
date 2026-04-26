import type { Theme } from '@/types';

export const moodToColor: Record<string, string> = {
  joy: '#fbbf24',
  sadness: '#60a5fa',
  fear: '#f87171',
  anger: '#ef4444',
  anxiety: '#fb923c',
  peace: '#4ade80',
  excitement: '#f472b6',
  confusion: '#a78bfa',
  neutral: '#94a3b8',
  anticipation: '#22d3ee',
  trust: '#a3e635',
  disgust: '#a78bfa',
  surprise: '#facc15',
};

export const moodToName: Record<string, string> = {
  joy: '愉悦',
  sadness: '悲伤',
  fear: '恐惧',
  anger: '愤怒',
  anxiety: '焦虑',
  peace: '平静',
  excitement: '兴奋',
  confusion: '困惑',
  neutral: '平静',
  anticipation: '期待',
  trust: '信任',
  disgust: '厌恶',
  surprise: '惊讶',
};

export const moodToEmoji: Record<string, string> = {
  joy: '😊',
  sadness: '😢',
  fear: '😨',
  anger: '😠',
  anxiety: '😰',
  peace: '😌',
  excitement: '🤩',
  confusion: '😕',
  neutral: '😐',
  anticipation: '🤔',
  trust: '🤝',
  disgust: '🤢',
  surprise: '😮',
};

export const lucidityToName: Record<string, string> = {
  none: '无记忆',
  low: '模糊',
  medium: '部分清晰',
  high: '清晰',
  lucid: '清醒梦',
};

export const lucidityToLevel: Record<string, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  lucid: 4,
};

export const motifTypeToName: Record<string, string> = {
  chase: '被追逐',
  falling: '坠落',
  examination: '考试',
  lost: '迷路',
  flying: '飞行',
  death: '死亡',
  water: '水相关',
  teeth: '牙齿',
  naked: '赤身裸体',
  other: '其他',
};

export const motifTypeToDescription: Record<string, string> = {
  chase: '被追逐或追赶的梦境通常表示你在现实生活中感到压力或逃避某些事情。',
  falling: '坠落的梦境可能反映你对生活失控的担忧，或是对未知的恐惧。',
  examination: '考试梦境常常与焦虑、自我怀疑和对表现的担忧相关。',
  lost: '迷路的梦境可能表示你在人生方向上感到迷茫，或在寻找真实的自我。',
  flying: '飞行的梦境通常象征自由、超越限制和个人成长。',
  death: '死亡的梦境不一定是负面的，它可能代表转变、结束和新的开始。',
  water: '水相关的梦境常常与情绪、潜意识和情感状态有关。',
  teeth: '牙齿的梦境可能反映对自我形象的担忧或对失去控制的恐惧。',
  naked: '赤身裸体的梦境通常与脆弱感、暴露和自我意识有关。',
  other: '其他类型的梦境母题。',
};

export const elementTypeToName: Record<string, string> = {
  person: '人物',
  place: '地点',
  object: '物品',
  animal: '动物',
  event: '事件',
  color: '颜色',
  emotion: '情绪',
};

export const elementTypeToIcon: Record<string, string> = {
  person: '👤',
  place: '📍',
  object: '📦',
  animal: '🐾',
  event: '📅',
  color: '🎨',
  emotion: '💭',
};

export const psychologicalClueTypeToName: Record<string, string> = {
  conflict: '心理冲突',
  desire: '内心欲望',
  fear: '深层恐惧',
  memory: '记忆关联',
  pattern: '行为模式',
};

export const psychologicalClueTypeToDescription: Record<string, string> = {
  conflict: '梦境中可能反映了你内心的矛盾和挣扎。',
  desire: '这个梦境可能揭示了你未被满足的愿望或深层渴望。',
  fear: '梦境中的元素可能与你潜意识中的恐惧或焦虑相关。',
  memory: '某些元素可能唤起了你过去的记忆或情感体验。',
  pattern: '这种梦境模式可能反映了你特定的思维或行为习惯。',
};

export const getMoodColor = (mood: string): string => {
  return moodToColor[mood] || moodToColor.neutral;
};

export const getMoodName = (mood: string): string => {
  return moodToName[mood] || mood;
};

export const getMoodEmoji = (mood: string): string => {
  return moodToEmoji[mood] || '😐';
};

export const getLucidityName = (lucidity: string): string => {
  return lucidityToName[lucidity] || lucidity;
};

export const getMotifName = (type: string): string => {
  return motifTypeToName[type] || type;
};

export const getElementTypeName = (type: string): string => {
  return elementTypeToName[type] || type;
};

export const getPsychologicalClueTypeName = (type: string): string => {
  return psychologicalClueTypeToName[type] || type;
};

export const generateTagColor = (): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#E11D48', '#A855F7', '#22C55E', '#EA580C',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getThemesByCategory = (themes: Theme[]): Record<string, Theme[]> => {
  const categories: Record<string, Theme[]> = {};
  for (const theme of themes) {
    const category = theme.category || '其他';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(theme);
  }
  return categories;
};
