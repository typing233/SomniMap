import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  username: string;
  avatar?: string;
  settings: {
    volcengineAccessKey?: string;
    volcengineSecretKey?: string;
    volcengineModelEndpointId?: string;
    defaultMood?: string;
    notificationsEnabled: boolean;
    dataEncryptionEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IDreamElement {
  name: string;
  type: 'person' | 'place' | 'object' | 'animal' | 'event' | 'color' | 'emotion';
  description?: string;
  significance?: number;
}

export interface ISceneChange {
  order: number;
  description: string;
  location?: string;
  timestamp?: string;
}

export interface ITheme {
  name: string;
  confidence: number;
  description?: string;
  category?: string;
}

export interface ISymbol {
  name: string;
  meaning: string;
  context: string;
  significance: number;
}

export interface IPsychologicalClue {
  type: 'conflict' | 'desire' | 'fear' | 'memory' | 'pattern';
  description: string;
  evidence: string[];
  intensity: number;
}

export interface IDreamAnalysis {
  _id: Types.ObjectId;
  dreamId: Types.ObjectId;
  userId: Types.ObjectId;
  version: string;
  modelUsed: string;
  elements: IDreamElement[];
  scenes: ISceneChange[];
  themes: ITheme[];
  symbols: ISymbol[];
  psychologicalClues: IPsychologicalClue[];
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
  createdAt: Date;
}

export interface IDream {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  title: string;
  dreamDate: Date;
  recordedAt: Date;
  lucidity: 'none' | 'low' | 'medium' | 'high' | 'lucid';
  overallMood: string;
  tags: Types.ObjectId[];
  isFavorite: boolean;
  isShared: boolean;
  analysisId?: Types.ObjectId;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  encryptedContent?: string;
  encryptionIv?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITag {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  color: string;
  description?: string;
  isSystem: boolean;
  dreamCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDreamPattern {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  patternType: 'character' | 'location' | 'emotion_combination' | 'theme' | 'motif';
  name: string;
  occurrences: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  relatedDreamIds: Types.ObjectId[];
  metadata: Record<string, unknown>;
  significance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDreamMotif {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  motifType: 'chase' | 'falling' | 'examination' | 'lost' | 'flying' | 'death' | 'water' | 'teeth' | 'naked' | 'other';
  customName?: string;
  occurrences: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  relatedDreamIds: Types.ObjectId[];
  averageIntensity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEmotionSnapshot {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  dominantEmotion: string;
  emotionDistribution: Record<string, number>;
  averageIntensity: number;
  dreamCount: number;
  relatedDreamIds: Types.ObjectId[];
  createdAt: Date;
}

export interface IJwtPayload {
  userId: string;
  iat: number;
  exp: number;
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
