import { Schema, model, Document, Types } from 'mongoose';
import { IDream } from '../types';

interface IDreamDocument extends Omit<IDream, '_id'>, Document {}

const dreamSchema = new Schema<IDreamDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  dreamDate: {
    type: Date,
    required: true,
    index: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
  },
  lucidity: {
    type: String,
    enum: ['none', 'low', 'medium', 'high', 'lucid'],
    default: 'none',
  },
  overallMood: {
    type: String,
    default: 'neutral',
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  isFavorite: {
    type: Boolean,
    default: false,
    index: true,
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  analysisId: {
    type: Schema.Types.ObjectId,
    ref: 'DreamAnalysis',
    default: null,
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  encryptedContent: {
    type: String,
    default: null,
    select: false,
  },
  encryptionIv: {
    type: String,
    default: null,
    select: false,
  },
}, {
  timestamps: true,
});

dreamSchema.index({ userId: 1, dreamDate: -1 });
dreamSchema.index({ userId: 1, isFavorite: 1 });
dreamSchema.index({ userId: 1, analysisStatus: 1 });
dreamSchema.index({ userId: 1, title: 'text', content: 'text' });

dreamSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    delete ret.encryptedContent;
    delete ret.encryptionIv;
    return ret;
  },
});

export const Dream = model<IDreamDocument>('Dream', dreamSchema);
