import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models';
import { generateToken } from '../utils/jwt';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../middleware/errorHandler';

export const validateRegister = [
  body('email').isEmail().withMessage('请提供有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
  body('username').isLength({ min: 1, max: 50 }).withMessage('用户名长度应在1-50个字符之间'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('请提供有效的邮箱地址'),
  body('password').notEmpty().withMessage('请输入密码'),
];

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError(errors.array()[0].msg);
    }

    const { email, password, username } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('该邮箱已被注册');
    }

    const user = new User({
      email,
      password,
      username,
      settings: {
        notificationsEnabled: true,
        dataEncryptionEnabled: false,
      },
    });

    await user.save();

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError(errors.array()[0].msg);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthorizedError('邮箱或密码错误');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('邮箱或密码错误');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const { username, avatar } = req.body;

    const updateData: Record<string, unknown> = {};
    if (username !== undefined) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const {
      volcengineAccessKey,
      volcengineSecretKey,
      volcengineModelEndpointId,
      defaultMood,
      notificationsEnabled,
      dataEncryptionEnabled,
    } = req.body;

    const updateData: Record<string, unknown> = {};
    if (volcengineAccessKey !== undefined) {
      updateData['settings.volcengineAccessKey'] = volcengineAccessKey;
    }
    if (volcengineSecretKey !== undefined) {
      updateData['settings.volcengineSecretKey'] = volcengineSecretKey;
    }
    if (volcengineModelEndpointId !== undefined) {
      updateData['settings.volcengineModelEndpointId'] = volcengineModelEndpointId;
    }
    if (defaultMood !== undefined) {
      updateData['settings.defaultMood'] = defaultMood;
    }
    if (notificationsEnabled !== undefined) {
      updateData['settings.notificationsEnabled'] = notificationsEnabled;
    }
    if (dataEncryptionEnabled !== undefined) {
      updateData['settings.dataEncryptionEnabled'] = dataEncryptionEnabled;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError('请提供当前密码和新密码');
    }

    if (newPassword.length < 6) {
      throw new BadRequestError('新密码至少需要6个字符');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError('当前密码错误');
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      data: {
        message: '密码修改成功',
      },
    });
  } catch (error) {
    next(error);
  }
};
