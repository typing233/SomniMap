import { Types } from 'mongoose';
import { Dream, DreamAnalysis, DreamPattern, DreamMotif, EmotionSnapshot } from '../models';
import { VolcengineService } from './volcengineService';
import { IDreamAnalysis, IDreamElement, ITheme, IDreamPattern, IDreamMotif } from '../types';

interface UserAISettings {
  accessKey?: string;
  secretKey?: string;
  modelEndpointId?: string;
}

export class DreamAnalysisService {
  private getAIService(userSettings?: UserAISettings): VolcengineService {
    if (userSettings?.accessKey && userSettings?.modelEndpointId) {
      return new VolcengineService({
        accessKey: userSettings.accessKey,
        secretKey: userSettings.secretKey,
        modelEndpointId: userSettings.modelEndpointId,
      });
    }
    return new VolcengineService();
  }

  async analyzeDream(
    dreamId: string,
    userId: string,
    content: string,
    userSettings?: UserAISettings
  ): Promise<IDreamAnalysis> {
    const aiService = this.getAIService(userSettings);

    await Dream.findByIdAndUpdate(
      dreamId,
      { analysisStatus: 'processing' },
      { new: true }
    );

    try {
      const analysisData = await aiService.analyzeDream(
        content,
        userId,
        dreamId
      );

      const analysis = await DreamAnalysis.create({
        ...analysisData,
        dreamId: new Types.ObjectId(dreamId),
        userId: new Types.ObjectId(userId),
      });

      await Dream.findByIdAndUpdate(
        dreamId,
        {
          analysisId: analysis._id,
          analysisStatus: 'completed',
          overallMood: analysis.overallMood,
        },
        { new: true }
      );

      await this.updatePatternsAndMotifs(userId, analysis);

      return analysis;
    } catch (error) {
      console.error('Dream analysis failed:', error);
      await Dream.findByIdAndUpdate(
        dreamId,
        { analysisStatus: 'failed' },
        { new: true }
      );
      throw error;
    }
  }

  async generateTitle(
    content: string,
    userSettings?: UserAISettings
  ): Promise<string> {
    const aiService = this.getAIService(userSettings);
    return aiService.generateDreamTitle(content);
  }

  private async updatePatternsAndMotifs(
    userId: string,
    analysis: IDreamAnalysis
  ): Promise<void> {
    const dreamId = analysis.dreamId;
    const dreamDate = analysis.createdAt;

    for (const element of analysis.elements) {
      if (['person', 'place', 'object', 'animal'].includes(element.type)) {
        await this.updatePattern(
          userId,
          element.type as IDreamPattern['patternType'],
          element.name,
          dreamId,
          dreamDate,
          element.significance || 0.5
        );
      }
    }

    for (const theme of analysis.themes) {
      await this.updatePattern(
        userId,
        'theme',
        theme.name,
        dreamId,
        dreamDate,
        theme.confidence
      );
    }

    const detectedMotifs = this.detectCommonMotifs(analysis);
    for (const motif of detectedMotifs) {
      await this.updateMotif(
        userId,
        motif.type,
        dreamId,
        dreamDate,
        motif.intensity
      );
    }

    await this.updateEmotionSnapshot(userId, analysis);
  }

  private async updatePattern(
    userId: string,
    patternType: IDreamPattern['patternType'],
    name: string,
    dreamId: Types.ObjectId,
    occurrenceDate: Date,
    significance: number
  ): Promise<void> {
    const existingPattern = await DreamPattern.findOne({
      userId: new Types.ObjectId(userId),
      patternType,
      name,
    });

    if (existingPattern) {
      const relatedDreamIds = existingPattern.relatedDreamIds;
      const alreadyExists = relatedDreamIds.some(
        (id) => id.toString() === dreamId.toString()
      );

      if (!alreadyExists) {
        relatedDreamIds.push(dreamId);
      }

      const newSignificance = (existingPattern.significance * existingPattern.occurrences + significance) 
        / (existingPattern.occurrences + (alreadyExists ? 0 : 1));

      await DreamPattern.findOneAndUpdate(
        { userId: new Types.ObjectId(userId), patternType, name },
        {
          occurrences: alreadyExists ? existingPattern.occurrences : existingPattern.occurrences + 1,
          lastOccurrence: occurrenceDate,
          relatedDreamIds,
          significance: newSignificance,
          updatedAt: new Date(),
        }
      );
    } else {
      await DreamPattern.create({
        userId: new Types.ObjectId(userId),
        patternType,
        name,
        occurrences: 1,
        firstOccurrence: occurrenceDate,
        lastOccurrence: occurrenceDate,
        relatedDreamIds: [dreamId],
        metadata: {},
        significance,
      });
    }
  }

  private async updateMotif(
    userId: string,
    motifType: IDreamMotif['motifType'],
    dreamId: Types.ObjectId,
    occurrenceDate: Date,
    intensity: number
  ): Promise<void> {
    const existingMotif = await DreamMotif.findOne({
      userId: new Types.ObjectId(userId),
      motifType,
    });

    if (existingMotif) {
      const relatedDreamIds = existingMotif.relatedDreamIds;
      const alreadyExists = relatedDreamIds.some(
        (id) => id.toString() === dreamId.toString()
      );

      if (!alreadyExists) {
        relatedDreamIds.push(dreamId);
      }

      const newAvgIntensity = (existingMotif.averageIntensity * existingMotif.occurrences + intensity)
        / (existingMotif.occurrences + (alreadyExists ? 0 : 1));

      await DreamMotif.findOneAndUpdate(
        { userId: new Types.ObjectId(userId), motifType },
        {
          occurrences: alreadyExists ? existingMotif.occurrences : existingMotif.occurrences + 1,
          lastOccurrence: occurrenceDate,
          relatedDreamIds,
          averageIntensity: newAvgIntensity,
          updatedAt: new Date(),
        }
      );
    } else {
      await DreamMotif.create({
        userId: new Types.ObjectId(userId),
        motifType,
        occurrences: 1,
        firstOccurrence: occurrenceDate,
        lastOccurrence: occurrenceDate,
        relatedDreamIds: [dreamId],
        averageIntensity: intensity,
      });
    }
  }

  private async updateEmotionSnapshot(
    userId: string,
    analysis: IDreamAnalysis
  ): Promise<void> {
    const date = new Date(analysis.createdAt);
    date.setHours(0, 0, 0, 0);

    const existingSnapshot = await EmotionSnapshot.findOne({
      userId: new Types.ObjectId(userId),
      date,
    });

    const emotionType = analysis.overallMood;
    const intensity = analysis.moodIntensity;

    if (existingSnapshot) {
      const relatedDreamIds = existingSnapshot.relatedDreamIds;
      const alreadyExists = relatedDreamIds.some(
        (id) => id.toString() === analysis.dreamId.toString()
      );

      if (!alreadyExists) {
        relatedDreamIds.push(analysis.dreamId);
      }

      const newDistribution = { ...existingSnapshot.emotionDistribution };
      newDistribution[emotionType] = (newDistribution[emotionType] || 0) + 1;

      const totalIntensity = existingSnapshot.averageIntensity * existingSnapshot.dreamCount + intensity;
      const newDreamCount = existingSnapshot.dreamCount + (alreadyExists ? 0 : 1);

      let maxCount = 0;
      let dominantEmotion = existingSnapshot.dominantEmotion;
      for (const [emotion, count] of Object.entries(newDistribution)) {
        if ((count as number) > maxCount) {
          maxCount = count as number;
          dominantEmotion = emotion;
        }
      }

      await EmotionSnapshot.findOneAndUpdate(
        { userId: new Types.ObjectId(userId), date },
        {
          dominantEmotion,
          emotionDistribution: newDistribution,
          averageIntensity: totalIntensity / newDreamCount,
          dreamCount: newDreamCount,
          relatedDreamIds,
        }
      );
    } else {
      await EmotionSnapshot.create({
        userId: new Types.ObjectId(userId),
        date,
        dominantEmotion: emotionType,
        emotionDistribution: { [emotionType]: 1 },
        averageIntensity: intensity,
        dreamCount: 1,
        relatedDreamIds: [analysis.dreamId],
      });
    }
  }

  private detectCommonMotifs(analysis: IDreamAnalysis): Array<{
    type: IDreamMotif['motifType'];
    intensity: number;
  }> {
    const motifs: Array<{ type: IDreamMotif['motifType']; intensity: number }> = [];

    const chaseKeywords = ['追', '追逐', '逃跑', '追赶', '逃', '被追'];
    const fallingKeywords = ['坠落', '掉', '落', '掉下去', '往下掉', '摔'];
    const examKeywords = ['考试', '测验', '考场', '答题', '没复习', '忘带'];
    const lostKeywords = ['迷路', '找不到', '丢失', '丢了', '找不到路', '迷失'];
    const flyingKeywords = ['飞', '飞行', '飘', '飘浮', '在空中'];
    const deathKeywords = ['死', '死亡', '去世', '棺材', '葬礼'];
    const waterKeywords = ['水', '海', '河', '湖', '游泳', '淹', '溺水', '洪水'];
    const teethKeywords = ['牙齿', '牙', '掉牙', '牙齿掉'];
    const nakedKeywords = ['裸体', '赤身', '没穿衣服', '光着'];

    const content = analysis.summary + ' ' + 
      analysis.elements.map((e) => e.name).join(' ') + ' ' +
      analysis.themes.map((t) => t.name).join(' ');

    const checkKeywords = (keywords: string[]): boolean => {
      return keywords.some((keyword) => content.includes(keyword));
    };

    if (checkKeywords(chaseKeywords)) {
      motifs.push({ type: 'chase', intensity: analysis.moodIntensity });
    }
    if (checkKeywords(fallingKeywords)) {
      motifs.push({ type: 'falling', intensity: analysis.moodIntensity });
    }
    if (checkKeywords(examKeywords)) {
      motifs.push({ type: 'examination', intensity: analysis.moodIntensity });
    }
    if (checkKeywords(lostKeywords)) {
      motifs.push({ type: 'lost', intensity: analysis.moodIntensity });
    }
    if (checkKeywords(flyingKeywords)) {
      motifs.push({ type: 'flying', intensity: analysis.moodIntensity });
    }
    if (checkKeywords(deathKeywords)) {
      motifs.push({ type: 'death', intensity: analysis.moodIntensity });
    }
    if (checkKeywords(waterKeywords)) {
      motifs.push({ type: 'water', intensity: analysis.moodIntensity });
    }
    if (checkKeywords(teethKeywords)) {
      motifs.push({ type: 'teeth', intensity: analysis.moodIntensity });
    }
    if (checkKeywords(nakedKeywords)) {
      motifs.push({ type: 'naked', intensity: analysis.moodIntensity });
    }

    return motifs;
  }
}

export const dreamAnalysisService = new DreamAnalysisService();
