import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

interface IUserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  avatar: {
    type: String,
    default: null,
  },
  settings: {
    volcengineAccessKey: {
      type: String,
      default: null,
      select: false,
    },
    volcengineSecretKey: {
      type: String,
      default: null,
      select: false,
    },
    volcengineModelEndpointId: {
      type: String,
      default: null,
      select: false,
    },
    defaultMood: {
      type: String,
      default: null,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    dataEncryptionEnabled: {
      type: Boolean,
      default: false,
    },
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    if (ret.settings) {
      delete ret.settings.volcengineAccessKey;
      delete ret.settings.volcengineSecretKey;
      delete ret.settings.volcengineModelEndpointId;
    }
    return ret;
  },
});

export const User = model<IUserDocument>('User', userSchema);
