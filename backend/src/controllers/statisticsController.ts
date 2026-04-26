import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../middleware/errorHandler';
import { statisticsService } from '../services/statisticsService';

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const [statistics, emotionTrend, topPatterns, commonMotifs, themeCloud] = await Promise.all([
      statisticsService.getDreamStatistics(req.user.id),
      statisticsService.getEmotionTrend(req.user.id, 30),
      statisticsService.getTopPatterns(req.user.id, 10),
      statisticsService.getCommonMotifs(req.user.id),
      statisticsService.getThemeCloud(req.user.id, 20),
    ]);

    res.json({
      success: true,
      data: {
        summary: statistics,
        emotionTrend,
        topPatterns,
        commonMotifs,
        themeCloud,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEmotionTrend = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const { days = '30' } = req.query;
    const daysNum = Math.min(Math.max(parseInt(days as string, 10), 7), 365);

    const emotionTrend = await statisticsService.getEmotionTrend(req.user.id, daysNum);

    res.json({
      success: true,
      data: {
        emotionTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatterns = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const { type, limit = '20' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10), 100);

    let patterns = await statisticsService.getTopPatterns(req.user.id, limitNum);

    if (type) {
      patterns = patterns.filter((p) => p.type === type);
    }

    res.json({
      success: true,
      data: {
        patterns,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMotifs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const motifs = await statisticsService.getCommonMotifs(req.user.id);

    res.json({
      success: true,
      data: {
        motifs,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getThemeCloud = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const { limit = '50' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10), 100);

    const themeCloud = await statisticsService.getThemeCloud(req.user.id, limitNum);

    res.json({
      success: true,
      data: {
        themeCloud,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPersonalReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const report = await statisticsService.generatePersonalReport(req.user.id);

    res.json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};
