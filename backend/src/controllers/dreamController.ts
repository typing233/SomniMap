import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Dream, DreamAnalysis, Tag, User } from '../models';
import { dreamAnalysisService } from '../services/dreamAnalysisService';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from '../middleware/errorHandler';

interface CreateDreamRequest {
  content: string;
  title?: string;
  dreamDate?: string;
  lucidity?: 'none' | 'low' | 'medium' | 'high' | 'lucid';
  overallMood?: string;
  tags?: string[];
}

interface UpdateDreamRequest {
  content?: string;
  title?: string;
  dreamDate?: string;
  lucidity?: 'none' | 'low' | 'medium' | 'high' | 'lucid';
  overallMood?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export const createDream = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const {
      content,
      title,
      dreamDate,
      lucidity = 'none',
      overallMood = 'neutral',
      tags = [],
    } = req.body as CreateDreamRequest;

    if (!content || content.trim().length === 0) {
      throw new BadRequestError('梦境内容不能为空');
    }

    const user = await User.findById(req.user.id)
      .select('+settings.volcengineAccessKey +settings.volcengineSecretKey +settings.volcengineModelEndpointId');

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    let finalTitle = title;
    if (!finalTitle) {
      try {
        finalTitle = await dreamAnalysisService.generateTitle(
          content,
          {
            accessKey: user.settings.volcengineAccessKey || undefined,
            secretKey: user.settings.volcengineSecretKey || undefined,
            modelEndpointId: user.settings.volcengineModelEndpointId || undefined,
          }
        );
      } catch {
        finalTitle = '未命名的梦';
      }
    }

    const dream = new Dream({
      userId: new Types.ObjectId(req.user.id),
      content: content.trim(),
      title: finalTitle,
      dreamDate: dreamDate ? new Date(dreamDate) : new Date(),
      recordedAt: new Date(),
      lucidity,
      overallMood,
      tags: tags.map((tagId) => new Types.ObjectId(tagId)),
      isFavorite: false,
      isShared: false,
      analysisStatus: 'pending',
    });

    await dream.save();

    if (tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: tags.map((id) => new Types.ObjectId(id)) } },
        { $inc: { dreamCount: 1 } }
      );
    }

    setImmediate(async () => {
      try {
        await dreamAnalysisService.analyzeDream(
          dream._id.toString(),
          req.user!.id,
          content,
          {
            accessKey: user.settings.volcengineAccessKey || undefined,
            secretKey: user.settings.volcengineSecretKey || undefined,
            modelEndpointId: user.settings.volcengineModelEndpointId || undefined,
          }
        );
      } catch (error) {
        console.error('Background dream analysis failed:', error);
      }
    });

    const populatedDream = await dream.populate('tags');

    res.status(201).json({
      success: true,
      data: {
        dream: populatedDream.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDreams = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('未授权访问');
    }

    const {
      page = 1,
      limit = 20,
      search,
      tag,
      mood,
      lucidity,
      isFavorite,
      startDate,
      endDate,
      sortBy = 'dreamDate',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(req.user.id),
    };

    if (search) {
      filter.$text = { $search: search as string };
    }

    if (tag) {
      filter.tags = new Types.ObjectId(tag as string);
    }

    if (mood) {
      filter.overallMood = mood;
    }

    if (lucidity) {
      filter.lucidity = lucidity;
    }

    if (isFavorite !== undefined) {
      filter.isFavorite = isFavorite === 'true';
    }

    if (startDate || endDate) {
      filter.dreamDate = {};
      if (startDate) {
        (filter.dreamDate as Record<string, unknown>).$gte = new Date(startDate as string);
      }
      if (endDate) {
        (filter.dreamDate as Record<string, unknown>).$lte = new Date(endDate as string);
      }
    }

    const sort: Record<string, unknown> = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const [dreams, total] = await Promise.all([
      Dream.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('tags')
        .populate({
          path: 'analysisId',
          select: 'overallMood moodIntensity themes symbols createdAt',
        }),
      Dream.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        dreams: dreams.map((d) => d.toJSON()),
      },
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDreamById = async (
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
      throw new BadRequestError('无效的梦境ID');
    }

    const dream = await Dream.findById(id)
      .populate('tags')
      .populate('analysisId');

    if (!dream) {
      throw new NotFoundError('梦境不存在');
    }

    if (dream.userId.toString() !== req.user.id) {
      throw new ForbiddenError('无权访问此梦境');
    }

    res.json({
      success: true,
      data: {
        dream: dream.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDream = async (
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
      throw new BadRequestError('无效的梦境ID');
    }

    const {
      content,
      title,
      dreamDate,
      lucidity,
      overallMood,
      tags,
      isFavorite,
    } = req.body as UpdateDreamRequest;

    const dream = await Dream.findById(id);

    if (!dream) {
      throw new NotFoundError('梦境不存在');
    }

    if (dream.userId.toString() !== req.user.id) {
      throw new ForbiddenError('无权修改此梦境');
    }

    const oldTags = dream.tags.map((t) => t.toString());

    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content.trim();
    if (title !== undefined) updateData.title = title;
    if (dreamDate !== undefined) updateData.dreamDate = new Date(dreamDate);
    if (lucidity !== undefined) updateData.lucidity = lucidity;
    if (overallMood !== undefined) updateData.overallMood = overallMood;
    if (tags !== undefined) {
      updateData.tags = tags.map((tagId) => new Types.ObjectId(tagId));
    }
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const updatedDream = await Dream.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('tags');

    if (tags !== undefined) {
      const newTags = tags;
      const removedTags = oldTags.filter((t) => !newTags.includes(t));
      const addedTags = newTags.filter((t) => !oldTags.includes(t));

      if (removedTags.length > 0) {
        await Tag.updateMany(
          { _id: { $in: removedTags.map((id) => new Types.ObjectId(id)) } },
          { $inc: { dreamCount: -1 } }
        );
      }

      if (addedTags.length > 0) {
        await Tag.updateMany(
          { _id: { $in: addedTags.map((id) => new Types.ObjectId(id)) } },
          { $inc: { dreamCount: 1 } }
        );
      }
    }

    res.json({
      success: true,
      data: {
        dream: updatedDream!.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDream = async (
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
      throw new BadRequestError('无效的梦境ID');
    }

    const dream = await Dream.findById(id);

    if (!dream) {
      throw new NotFoundError('梦境不存在');
    }

    if (dream.userId.toString() !== req.user.id) {
      throw new ForbiddenError('无权删除此梦境');
    }

    if (dream.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: dream.tags } },
        { $inc: { dreamCount: -1 } }
      );
    }

    if (dream.analysisId) {
      await DreamAnalysis.findByIdAndDelete(dream.analysisId);
    }

    await Dream.findByIdAndDelete(id);

    res.json({
      success: true,
      data: {
        message: '梦境已删除',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reanalyzeDream = async (
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
      throw new BadRequestError('无效的梦境ID');
    }

    const dream = await Dream.findById(id);

    if (!dream) {
      throw new NotFoundError('梦境不存在');
    }

    if (dream.userId.toString() !== req.user.id) {
      throw new ForbiddenError('无权操作此梦境');
    }

    const user = await User.findById(req.user.id)
      .select('+settings.volcengineAccessKey +settings.volcengineSecretKey +settings.volcengineModelEndpointId');

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    await Dream.findByIdAndUpdate(
      id,
      { analysisStatus: 'processing' },
      { new: true }
    );

    setImmediate(async () => {
      try {
        if (dream.analysisId) {
          await DreamAnalysis.findByIdAndDelete(dream.analysisId);
        }

        const analysis = await dreamAnalysisService.analyzeDream(
          dream._id.toString(),
          req.user!.id,
          dream.content,
          {
            accessKey: user.settings.volcengineAccessKey || undefined,
            secretKey: user.settings.volcengineSecretKey || undefined,
            modelEndpointId: user.settings.volcengineModelEndpointId || undefined,
          }
        );

        await Dream.findByIdAndUpdate(
          id,
          {
            analysisId: analysis._id,
            analysisStatus: 'completed',
            overallMood: analysis.overallMood,
          },
          { new: true }
        );
      } catch (error) {
        console.error('Reanalysis failed:', error);
        await Dream.findByIdAndUpdate(
          id,
          { analysisStatus: 'failed' },
          { new: true }
        );
      }
    });

    res.json({
      success: true,
      data: {
        message: '分析已开始，完成后将自动更新',
      },
    });
  } catch (error) {
    next(error);
  }
};
