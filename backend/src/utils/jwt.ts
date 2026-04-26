import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IJwtPayload } from '../types';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

export const verifyToken = (token: string): IJwtPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as IJwtPayload;
    return decoded;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): IJwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as IJwtPayload;
    return decoded;
  } catch {
    return null;
  }
};
