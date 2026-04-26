import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDashboardStats,
  getEmotionTrend,
  getPatterns,
  getMotifs,
  getThemeCloud,
  getPersonalReport,
} from '../controllers/statisticsController';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardStats);
router.get('/emotion-trend', getEmotionTrend);
router.get('/patterns', getPatterns);
router.get('/motifs', getMotifs);
router.get('/theme-cloud', getThemeCloud);
router.get('/report', getPersonalReport);

export { router as statisticsRoutes };
