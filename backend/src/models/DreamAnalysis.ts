import { Schema, model, Document } from 'mongoose';
import { IDreamAnalysis } from '../types';

interface IDreamAnalysisDocument extends Omit<IDreamAnalysis, '_id'>, Document {}

const dreamElementSchema = new Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['person', 'place', 'object', 'animal', 'event', 'color', 'emotion'],
    required: true,
  },
  description: String,
  significance: { type: Number, default: 0.5, min: 0, max: 1 },
}, { _id: false });

const sceneChangeSchema = new Schema({
  order: { type: Number, required: true },
  description: { type: String, required: true },
  location: String,
  timestamp: String,
}, { _id: false });

const themeSchema = new Schema({
  name: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  description: String,
  category: String,
}, { _id: false });

const symbolSchema = new Schema({
  name: { type: String, required: true },
  meaning: { type: String, required: true },
  context: { type: String, required: true },
  significance: { type: Number, required: true, min: 0, max: 1 },
}, { _id: false });

const psychologicalClueSchema = new Schema({
  type: {
    type: String,
    enum: ['conflict', 'desire', 'fear', 'memory', 'pattern'],
    required: true,
  },
  description: { type: String, required: true },
  evidence: [{ type: String }],
  intensity: { type: Number, required: true, min: 0, max: 1 },
}, { _id: false });

const dreamQualitySchema = new Schema({
  lucidity: { type: Number, default: 0, min: 0, max: 1 },
  vividness: { type: Number, default: 0.5, min: 0, max: 1 },
  emotionalIntensity: { type: Number, default: 0.5, min: 0, max: 1 },
  narrativeCoherence: { type: Number, default: 0.5, min: 0, max: 1 },
}, { _id: false });

const dreamAnalysisSchema = new Schema<IDreamAnalysisDocument>({
  dreamId: {
    type: Schema.Types.ObjectId,
    ref: 'Dream',
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  version: {
    type: String,
    default: '1.0.0',
  },
  modelUsed: {
    type: String,
    required: true,
  },
  elements: [dreamElementSchema],
  scenes: [sceneChangeSchema],
  themes: [themeSchema],
  symbols: [symbolSchema],
  psychologicalClues: [psychologicalClueSchema],
  overallMood: {
    type: String,
    required: true,
  },
  moodIntensity: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  dreamQuality: dreamQualitySchema,
  summary: {
    type: String,
    required: true,
  },
  interpretation: {
    type: String,
    required: true,
  },
  questionsForReflection: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

dreamAnalysisSchema.index({ userId: 1, createdAt: -1 });

dreamAnalysisSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const DreamAnalysis = model<IDreamAnalysisDocument>('DreamAnalysis', dreamAnalysisSchema);
