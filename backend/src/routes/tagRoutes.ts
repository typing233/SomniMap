import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '../controllers/tagController';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getTags)
  .post(createTag);

router.route('/:id')
  .put(updateTag)
  .delete(deleteTag);

export { router as tagRoutes };
