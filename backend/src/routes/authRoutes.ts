import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  validateRegister,
  validateLogin,
  register,
  login,
  getCurrentUser,
  updateProfile,
  updateSettings,
  changePassword,
} from '../controllers/authController';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);
router.put('/settings', authenticate, updateSettings);
router.put('/password', authenticate, changePassword);

export { router as authRoutes };
