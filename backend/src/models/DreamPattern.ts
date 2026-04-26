import { Schema, model, Document } from 'mongoose';
import { IDreamPattern, IDreamMotif, IEmotionSnapshot } from '../types';

interface IDreamPatternDocument extends Omit<IDreamPattern, '_id'>, Document {}
interface IDreamMotifDocument extends Omit<IDreamMotif, '_id'>, Document {}
interface IEmotionSnapshotDocument extends Omit<IEmotionSnapshot, '_id'>, Document {}

const dreamPatternSchema = new Schema<IDreamPatternDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  patternType: {
    type: String,
    enum: ['character', 'location', 'emotion_combination', 'theme', 'motif'],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  occurrences: {
    type: Number,
    default: 1,
    min: 1,
  },
  firstOccurrence: {
    type: Date,
    default: Date.now,
  },
  lastOccurrence: {
    type: Date,
    default: Date.now,
  },
  relatedDreamIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Dream',
  }],
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  significance: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1,
  },
}, {
  timestamps: true,
});

dreamPatternSchema.index({ userId: 1, patternType: 1, name: 1 }, { unique: true });
dreamPatternSchema.index({ userId: 1, occurrences: -1 });

dreamPatternSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const dreamMotifSchema = new Schema<IDreamMotifDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  motifType: {
    type: String,
    enum: ['chase', 'falling', 'examination', 'lost', 'flying', 'death', 'water', 'teeth', 'naked', 'other'],
    required: true,
  },
  customName: {
    type: String,
    default: null,
    trim: true,
  },
  occurrences: {
    type: Number,
    default: 1,
    min: 1,
  },
  firstOccurrence: {
    type: Date,
    default: Date.now,
  },
  lastOccurrence: {
    type: Date,
    default: Date.now,
  },
  relatedDreamIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Dream',
  }],
  averageIntensity: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1,
  },
}, {
  timestamps: true,
});

dreamMotifSchema.index({ userId: 1, motifType: 1 });

dreamMotifSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const emotionSnapshotSchema = new Schema<IEmotionSnapshotDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
  },
  dominantEmotion: {
    type: String,
    required: true,
  },
  emotionDistribution: {
    type: Schema.Types.Mixed,
    default: {},
  },
  averageIntensity: {
    type: Number,
    default: 0.5,
    min: 0,
    max: 1,
  },
  dreamCount: {
    type: Number,
    default: 1,
    min: 1,
  },
  relatedDreamIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Dream',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

emotionSnapshotSchema.index({ userId: 1, date: -1 });

emotionSnapshotSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const DreamPattern = model<IDreamPatternDocument>('DreamPattern', dreamPatternSchema);
export const DreamMotif = model<IDreamMotifDocument>('DreamMotif', dreamMotifSchema);
export const EmotionSnapshot = model<IEmotionSnapshotDocument>('EmotionSnapshot', emotionSnapshotSchema);
