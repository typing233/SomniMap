export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  settings: {
    defaultMood?: string;
    notificationsEnabled: boolean;
    dataEncryptionEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface DreamElement {
  name: string;
  type: 'person' | 'place' | 'object' | 'animal' | 'event' | 'color' | 'emotion';
  description?: string;
  significance?: number;
}

export interface SceneChange {
  order: number;
  description: string;
  location?: string;
  timestamp?: string;
}

export interface Theme {
  name: string;
  confidence: number;
  description?: string;
  category?: string;
}

export interface Symbol {
  name: string;
  meaning: string;
  context: string;
  significance: number;
}

export interface PsychologicalClue {
  type: 'conflict' | 'desire' | 'fear' | 'memory' | 'pattern';
  description: string;
  evidence: string[];
  intensity: number;
}

export interface DreamAnalysis {
  id: string;
  dreamId: string;
  userId: string;
  version: string;
  modelUsed: string;
  elements: DreamElement[];
  scenes: SceneChange[];
  themes: Theme[];
  symbols: Symbol[];
  psychologicalClues: PsychologicalClue[];
  overallMood: string;
  moodIntensity: number;
  dreamQuality: {
    lucidity: number;
    vividness: number;
    emotionalIntensity: number;
    narrativeCoherence: number;
  };
  summary: string;
  interpretation: string;
  questionsForReflection: string[];
  createdAt: string;
}

export interface Dream {
  id: string;
  userId: string;
  content: string;
  title: string;
  dreamDate: string;
  recordedAt: string;
  lucidity: 'none' | 'low' | 'medium' | 'high' | 'lucid';
  overallMood: string;
  tags: Tag[];
  isFavorite: boolean;
  isShared: boolean;
  analysisId?: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  analysis?: DreamAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  description?: string;
  isSystem: boolean;
  dreamCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PatternSummary {
  type: string;
  name: string;
  occurrences: number;
  lastOccurrence: string;
  significance: number;
}

export interface MotifSummary {
  type: string;
  occurrences: number;
  averageIntensity: number;
  firstOccurrence: string;
  lastOccurrence: string;
}

export interface EmotionTrend {
  date: string;
  dominantEmotion: string;
  distribution: Record<string, number>;
  dreamCount: number;
}

export interface DreamStatistics {
  totalDreams: number;
  totalAnalyzed: number;
  averageDreamLength: number;
  mostCommonMood: string;
  lucidityDistribution: Record<string, number>;
  recordingStreak: number;
}

export interface ThemeCloudItem {
  name: string;
  count: number;
}

export interface PersonalReport {
  summary: DreamStatistics;
  emotionTrend: EmotionTrend[];
  topPatterns: PatternSummary[];
  commonMotifs: MotifSummary[];
  themeCloud: ThemeCloudItem[];
  psychologicalInsights: string[];
}

export interface DashboardData {
  summary: DreamStatistics;
  emotionTrend: EmotionTrend[];
  topPatterns: PatternSummary[];
  commonMotifs: MotifSummary[];
  themeCloud: ThemeCloudItem[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateDreamRequest {
  content: string;
  title?: string;
  dreamDate?: string;
  lucidity?: 'none' | 'low' | 'medium' | 'high' | 'lucid';
  overallMood?: string;
  tags?: string[];
}

export interface UpdateDreamRequest {
  content?: string;
  title?: string;
  dreamDate?: string;
  lucidity?: 'none' | 'low' | 'medium' | 'high' | 'lucid';
  overallMood?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
  description?: string;
}

export interface UpdateTagRequest {
  name?: string;
  color?: string;
  description?: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatar?: string;
}

export interface UpdateSettingsRequest {
  volcengineAccessKey?: string;
  volcengineSecretKey?: string;
  volcengineModelEndpointId?: string;
  defaultMood?: string;
  notificationsEnabled?: boolean;
  dataEncryptionEnabled?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
