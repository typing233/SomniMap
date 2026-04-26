import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Tag } from '../models';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError, ConflictError } from '../middleware/errorHandler';

const DEFAULT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const tags = await Tag.find({
      userId: new Types.ObjectId(req.user.id),
    }).sort({ dreamCount: -1, createdAt: -1 });

    res.json({
      success: true,
      data: {
        tags: tags.map((t) => t.toJSON()),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const { name, color, description } = req.body;

    if (!name || name.trim().length === 0) {
      throw new BadRequestError('标签名称不能为空');
    }

    const trimmedName = name.trim();

    const existingTag = await Tag.findOne({
      userId: new Types.ObjectId(req.user.id),
      name: trimmedName,
    });

    if (existingTag) {
      throw new ConflictError('该标签已存在');
    }

    const tagColor = color || DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];

    const tag = new Tag({
      userId: new Types.ObjectId(req.user.id),
      name: trimmedName,
      color: tagColor,
      description: description?.trim() || null,
      isSystem: false,
      dreamCount: 0,
    });

    await tag.save();

    res.status(201).json({
      success: true,
      data: {
        tag: tag.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('无效的标签ID');
    }

    const { name, color, description } = req.body;

    const tag = await Tag.findById(id);

    if (!tag) {
      throw new NotFoundError('标签不存在');
    }

    if (tag.userId.toString() !== req.user.id) {
      throw new ForbiddenError('无权修改此标签');
    }

    if (tag.isSystem) {
      throw new ForbiddenError('无法修改系统标签');
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description?.trim() || null;

    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: {
        tag: updatedTag!.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('无效的标签ID');
    }

    const tag = await Tag.findById(id);

    if (!tag) {
      throw new NotFoundError('标签不存在');
    }

    if (tag.userId.toString() !== req.user.id) {
      throw new ForbiddenError('无权删除此标签');
    }

    if (tag.isSystem) {
      throw new ForbiddenError('无法删除系统标签');
    }

    await Tag.findByIdAndDelete(id);

    res.json({
      success: true,
      data: {
        message: '标签已删除',
      },
    });
  } catch (error) {
    next(error);
  }
};
