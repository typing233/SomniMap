import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { errorHandler, NotFoundError } from './middleware/errorHandler';
import { authRoutes, dreamRoutes, tagRoutes, statisticsRoutes } from './routes';

const createApp = (): Application => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: config.isDevelopment 
      ? ['http://localhost:5173', 'http://127.0.0.1:5173']
      : process.env.ALLOWED_ORIGINS?.split(',') || [],
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (!config.isTest) {
    app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));
  }

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.isDevelopment ? 1000 : 100,
    message: {
      success: false,
      error: {
        message: '请求过于频繁，请稍后再试',
        code: 'TOO_MANY_REQUESTS',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', limiter);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/dreams', dreamRoutes);
  app.use('/api/tags', tagRoutes);
  app.use('/api/statistics', statisticsRoutes);

  app.use('/api/*', (_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('API端点不存在'));
  });

  app.all('*', (_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('资源不存在'));
  });

  app.use(errorHandler);

  return app;
};

export { createApp };
