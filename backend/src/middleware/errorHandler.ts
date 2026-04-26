import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { config } from '../config';

export const errorHandler: ErrorRequestHandler = (
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  const errorResponse = {
    success: false,
    error: {
      message: err.message || '服务器内部错误',
      code: errorCode,
      ...(config.isDevelopment && { stack: err.stack }),
    },
  };

  console.error('Error:', {
    message: err.message,
    code: errorCode,
    status: statusCode,
    ...(config.isDevelopment && { stack: err.stack }),
  });

  res.status(statusCode).json(errorResponse);
};

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误', code: string = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问', code: string = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '禁止访问', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在', code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突', code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = '请求过于频繁', code: string = 'TOO_MANY_REQUESTS') {
    super(message, 429, code);
  }
}
