import crypto from 'crypto';
import { config } from '../config';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const getEncryptionKey = (): Buffer => {
  const key = config.encryption.key;
  if (key.length < 32) {
    throw new Error('Encryption key must be at least 32 characters long');
  }
  return Buffer.from(key.substring(0, 32), 'utf8');
};

export const encrypt = (text: string): { encryptedData: string; iv: string; authTag: string } => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag,
  };
};

export const decrypt = (encryptedData: string, iv: string, authTag: string): string => {
  const key = getEncryptionKey();
  const ivBuffer = Buffer.from(iv, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
  decipher.setAuthTag(authTagBuffer);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

export const hash = (text: string): string => {
  return crypto
    .createHash('sha256')
    .update(text + config.jwt.secret)
    .digest('hex');
};

export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};
