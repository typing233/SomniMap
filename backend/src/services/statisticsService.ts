import { Types } from 'mongoose';
import { Dream, DreamAnalysis, DreamPattern, DreamMotif, EmotionSnapshot, Tag } from '../models';

interface DreamStatistics {
  totalDreams: number;
  totalAnalyzed: number;
  averageDreamLength: number;
  mostCommonMood: string;
  lucidityDistribution: Record<string, number>;
  recordingStreak: number;
}

interface EmotionTrend {
  date: string;
  dominantEmotion: string;
  distribution: Record<string, number>;
  dreamCount: number;
}

interface PatternSummary {
  type: string;
  name: string;
  occurrences: number;
  lastOccurrence: Date;
  significance: number;
}

interface MotifSummary {
  type: string;
  occurrences: number;
  averageIntensity: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
}

interface PersonalReport {
  summary: DreamStatistics;
  emotionTrend: EmotionTrend[];
  topPatterns: PatternSummary[];
  commonMotifs: MotifSummary[];
  themeCloud: Array<{ name: string; count: number }>;
  psychologicalInsights: string[];
}

export class StatisticsService {
  async getDreamStatistics(userId: string): Promise<DreamStatistics> {
    const userIdObj = new Types.ObjectId(userId);

    const totalDreams = await Dream.countDocuments({ userId: userIdObj });
    const totalAnalyzed = await Dream.countDocuments({
      userId: userIdObj,
      analysisStatus: 'completed',
    });

    const dreamsWithLength = await Dream.find(
      { userId: userIdObj },
      { content: 1 }
    );

    const averageDreamLength = dreamsWithLength.length > 0
      ? Math.round(
          dreamsWithLength.reduce((sum, dream) => sum + dream.content.length, 0) /
            dreamsWithLength.length
        )
      : 0;

    const moodAggregation = await Dream.aggregate([
      { $match: { userId: userIdObj, overallMood: { $ne: null } } },
      { $group: { _id: '$overallMood', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const mostCommonMood = moodAggregation[0]?._id || 'neutral';

    const lucidityAggregation = await Dream.aggregate([
      { $match: { userId: userIdObj } },
      { $group: { _id: '$lucidity', count: { $sum: 1 } } },
    ]);

    const lucidityDistribution: Record<string, number> = {};
    for (const item of lucidityAggregation) {
      lucidityDistribution[item._id] = item.count;
    }

    const recordingStreak = await this.calculateStreak(userId);

    return {
      totalDreams,
      totalAnalyzed,
      averageDreamLength,
      mostCommonMood,
      lucidityDistribution,
      recordingStreak,
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const userIdObj = new Types.ObjectId(userId);
    
    const dreams = await Dream.find(
      { userId: userIdObj },
      { dreamDate: 1 }
    ).sort({ dreamDate: -1 });

    if (dreams.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dream of dreams) {
      const dreamDate = new Date(dream.dreamDate);
      dreamDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - dreamDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak || (diffDays === streak + 1 && streak === 0)) {
        streak++;
      } else if (diffDays > streak + 1) {
        break;
      }
    }

    return streak;
  }

  async getEmotionTrend(
    userId: string,
    days: number = 30
  ): Promise<EmotionTrend[]> {
    const userIdObj = new Types.ObjectId(userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const snapshots = await EmotionSnapshot.find({
      userId: userIdObj,
      date: { $gte: startDate },
    }).sort({ date: 1 });

    return snapshots.map((snapshot) => ({
      date: snapshot.date.toISOString().split('T')[0],
      dominantEmotion: snapshot.dominantEmotion,
      distribution: snapshot.emotionDistribution as Record<string, number>,
      dreamCount: snapshot.dreamCount,
    }));
  }

  async getTopPatterns(
    userId: string,
    limit: number = 10
  ): Promise<PatternSummary[]> {
    const userIdObj = new Types.ObjectId(userId);

    const patterns = await DreamPattern.find({ userId: userIdObj })
      .sort({ occurrences: -1, significance: -1 })
      .limit(limit);

    return patterns.map((pattern) => ({
      type: pattern.patternType,
      name: pattern.name,
      occurrences: pattern.occurrences,
      lastOccurrence: pattern.lastOccurrence,
      significance: pattern.significance,
    }));
  }

  async getCommonMotifs(userId: string): Promise<MotifSummary[]> {
    const userIdObj = new Types.ObjectId(userId);

    const motifs = await DreamMotif.find({ userId: userIdObj })
      .sort({ occurrences: -1 });

    return motifs.map((motif) => ({
      type: motif.motifType,
      occurrences: motif.occurrences,
      averageIntensity: motif.averageIntensity,
      firstOccurrence: motif.firstOccurrence,
      lastOccurrence: motif.lastOccurrence,
    }));
  }

  async getThemeCloud(
    userId: string,
    limit: number = 20
  ): Promise<Array<{ name: string; count: number }>> {
    const userIdObj = new Types.ObjectId(userId);

    const analyses = await DreamAnalysis.find(
      { userId: userIdObj },
      { themes: 1 }
    );

    const themeCounts: Record<string, number> = {};

    for (const analysis of analyses) {
      for (const theme of analysis.themes) {
        const name = theme.name.toLowerCase();
        themeCounts[name] = (themeCounts[name] || 0) + 1;
      }
    }

    const themeArray = Object.entries(themeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return themeArray;
  }

  async generatePersonalReport(userId: string): Promise<PersonalReport> {
    const [
      statistics,
      emotionTrend,
      topPatterns,
      commonMotifs,
      themeCloud,
    ] = await Promise.all([
      this.getDreamStatistics(userId),
      this.getEmotionTrend(userId, 30),
      this.getTopPatterns(userId, 10),
      this.getCommonMotifs(userId),
      this.getThemeCloud(userId, 20),
    ]);

    const psychologicalInsights = this.generateInsights(
      statistics,
      emotionTrend,
      topPatterns,
      commonMotifs
    );

    return {
      summary: statistics,
      emotionTrend,
      topPatterns,
      commonMotifs,
      themeCloud,
      psychologicalInsights,
    };
  }

  private generateInsights(
    statistics: DreamStatistics,
    emotionTrend: EmotionTrend[],
    topPatterns: PatternSummary[],
    commonMotifs: MotifSummary[]
  ): string[] {
    const insights: string[] = [];

    if (statistics.recordingStreak >= 7) {
      insights.push(`太棒了！你已经连续记录梦境 ${statistics.recordingStreak} 天。保持这个习惯，你会发现更多潜意识的模式。`);
    } else if (statistics.recordingStreak >= 3) {
      insights.push(`你正在建立良好的梦境记录习惯，连续 ${statistics.recordingStreak} 天的记录。继续保持！`);
    }

    if (statistics.totalDreams > 10) {
      insights.push(`你已经记录了 ${statistics.totalDreams} 个梦境，这是一个很好的开始来了解你的潜意识世界。`);
    }

    const recentEmotions = emotionTrend.slice(-7);
    if (recentEmotions.length > 0) {
      const lastWeekEmotions = recentEmotions.map((e) => e.dominantEmotion);
      const emotionCounts: Record<string, number> = {};
      for (const emotion of lastWeekEmotions) {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }

      const sortedEmotions = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
      if (sortedEmotions.length > 0) {
        const topEmotion = sortedEmotions[0];
        if (topEmotion[1] >= 4) {
          const emotionDescriptions: Record<string, string> = {
            joy: '愉悦',
            sadness: '悲伤',
            fear: '恐惧',
            anger: '愤怒',
            anxiety: '焦虑',
            peace: '平静',
            excitement: '兴奋',
            confusion: '困惑',
            neutral: '平静',
          };
          insights.push(`过去一周里，${emotionDescriptions[topEmotion[0]] || topEmotion[0]}的情绪出现了 ${topEmotion[1]} 次。这可能反映了你近期的心理状态。`);
        }
      }
    }

    if (commonMotifs.length > 0) {
      const topMotif = commonMotifs[0];
      const motifDescriptions: Record<string, string> = {
        chase: '被追逐',
        falling: '坠落',
        examination: '考试',
        lost: '迷路',
        flying: '飞行',
        death: '死亡',
        water: '水相关',
        teeth: '牙齿',
        naked: '赤身裸体',
        other: '其他',
      };
      
      if (topMotif.occurrences >= 3) {
        insights.push(`你多次梦见${motifDescriptions[topMotif.type] || topMotif.type}的场景（共 ${topMotif.occurrences} 次）。这种梦境母题常常与特定的心理压力或愿望相关。`);
      }
    }

    if (topPatterns.length > 0 && topPatterns[0].occurrences >= 3) {
      const topPattern = topPatterns[0];
      const typeDescriptions: Record<string, string> = {
        character: '人物',
        location: '地点',
        object: '物品',
        animal: '动物',
        theme: '主题',
        motif: '母题',
      };
      insights.push(`"${topPattern.name}"这个${typeDescriptions[topPattern.type] || topPattern.type}在你的梦境中出现了 ${topPattern.occurrences} 次。这可能是一个重要的潜意识象征。`);
    }

    if (insights.length === 0) {
      insights.push('继续记录梦境，随着数据积累，系统将为你生成更深入的心理洞察。');
    }

    return insights;
  }
}

export const statisticsService = new StatisticsService();
