import { Schema, model, Document } from 'mongoose';
import { ITag } from '../types';

interface ITagDocument extends Omit<ITag, '_id'>, Document {}

const tagSchema = new Schema<ITagDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30,
  },
  color: {
    type: String,
    default: '#6B7280',
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  description: {
    type: String,
    default: null,
    maxlength: 200,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  dreamCount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

tagSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Tag = model<ITagDocument>('Tag', tagSchema);
