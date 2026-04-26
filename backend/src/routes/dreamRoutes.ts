import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createDream,
  getDreams,
  getDreamById,
  updateDream,
  deleteDream,
  reanalyzeDream,
} from '../controllers/dreamController';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getDreams)
  .post(createDream);

router.route('/:id')
  .get(getDreamById)
  .put(updateDream)
  .delete(deleteDream);

router.post('/:id/reanalyze', reanalyzeDream);

export { router as dreamRoutes };
