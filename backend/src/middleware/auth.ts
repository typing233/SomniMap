import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          message: '未提供认证令牌',
          code: 'MISSING_TOKEN',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: {
          message: '令牌无效或已过期',
          code: 'INVALID_TOKEN',
        },
      });
      return;
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: '用户不存在',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: '认证过程中发生错误',
        code: 'AUTH_ERROR',
      },
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      next();
      return;
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      next();
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    };

    next();
  } catch {
    next();
  }
};
