import { config } from '../config';
import { IDreamAnalysis, IDreamElement, ITheme, ISymbol, IPsychologicalClue, ISceneChange } from '../types';

interface VolcengineConfig {
  accessKey: string;
  secretKey: string;
  modelEndpointId: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface VolcengineResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const DREAM_ANALYSIS_SYSTEM_PROMPT = `你是一位专业的梦境分析师和心理学家，擅长从心理学视角解析梦境的深层含义。

请分析用户的梦境文本，并以JSON格式返回结构化的分析结果。分析应包含以下维度：

1. **elements** - 识别梦境中的元素：
   - person: 人物（如家人、朋友、陌生人、虚构角色）
   - place: 地点（如家、学校、森林、海洋）
   - object: 物品（如钥匙、车、镜子）
   - animal: 动物（如狗、蛇、鸟）
   - event: 事件（如追逐、坠落、考试）
   - color: 颜色
   - emotion: 情绪

2. **scenes** - 识别场景变化，按顺序排列

3. **themes** - 提取主题，每个主题有置信度(0-1)

4. **symbols** - 识别象征意象，包含：
   - name: 象征物名称
   - meaning: 心理学含义
   - context: 在梦中的具体情境
   - significance: 重要性(0-1)

5. **psychologicalClues** - 潜在心理线索：
   - type: conflict(冲突)、desire(欲望)、fear(恐惧)、memory(记忆)、pattern(模式)
   - description: 描述
   - evidence: 支持证据列表
   - intensity: 强度(0-1)

6. **overallMood** - 整体情绪：joy, sadness, fear, anger, surprise, disgust, anticipation, trust, neutral, anxiety, confusion, peace, excitement

7. **moodIntensity** - 情绪强度(0-1)

8. **dreamQuality** - 梦境质量：
   - lucidity: 清醒梦程度(0-1)
   - vividness: 清晰度(0-1)
   - emotionalIntensity: 情绪强度(0-1)
   - narrativeCoherence: 叙事连贯性(0-1)

9. **summary** - 梦境摘要

10. **interpretation** - 心理学解读

11. **questionsForReflection** - 供用户反思的问题列表

常见梦境母题(motifs)包括但不限于：
- chase: 被追逐
- falling: 坠落
- examination: 考试
- lost: 迷路/找不到东西
- flying: 飞行
- death: 死亡
- water: 水相关
- teeth: 牙齿
- naked: 赤身裸体

请以严格的JSON格式返回，不要包含任何其他文字。`;

export class VolcengineService {
  private config: VolcengineConfig;
  private baseUrl: string;

  constructor(userConfig?: Partial<VolcengineConfig>) {
    this.config = {
      accessKey: userConfig?.accessKey || config.volcengine.accessKey,
      secretKey: userConfig?.secretKey || config.volcengine.secretKey,
      modelEndpointId: userConfig?.modelEndpointId || config.volcengine.modelEndpointId,
    };
    this.baseUrl = config.volcengine.baseUrl;
  }

  private generateAuthToken(): string {
    const credentials = `${this.config.accessKey}:${this.config.secretKey}`;
    return Buffer.from(credentials).toString('base64');
  }

  async chatCompletion(
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: { type: 'json_object' };
    } = {}
  ): Promise<VolcengineResponse> {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      responseFormat,
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.accessKey}:${this.config.modelEndpointId}`,
      },
      body: JSON.stringify({
        model: this.config.modelEndpointId,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: responseFormat,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Volcengine API error: ${response.status} - ${errorText}`);
    }

    return response.json() as Promise<VolcengineResponse>;
  }

  async analyzeDream(
    dreamContent: string,
    userId: string,
    dreamId: string
  ): Promise<Partial<IDreamAnalysis>> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: DREAM_ANALYSIS_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `请分析以下梦境：\n\n${dreamContent}`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    });

    const assistantMessage = response.choices[0]?.message?.content;
    
    if (!assistantMessage) {
      throw new Error('Failed to get analysis from Volcengine');
    }

    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(assistantMessage);
    } catch (parseError) {
      console.error('Failed to parse AI response:', assistantMessage);
      throw new Error('Failed to parse dream analysis response');
    }

    return {
      dreamId: dreamId as unknown as any,
      userId: userId as unknown as any,
      version: '1.0.0',
      modelUsed: this.config.modelEndpointId,
      elements: parsedAnalysis.elements || [],
      scenes: parsedAnalysis.scenes || [],
      themes: parsedAnalysis.themes || [],
      symbols: parsedAnalysis.symbols || [],
      psychologicalClues: parsedAnalysis.psychologicalClues || [],
      overallMood: parsedAnalysis.overallMood || 'neutral',
      moodIntensity: parsedAnalysis.moodIntensity || 0.5,
      dreamQuality: parsedAnalysis.dreamQuality || {
        lucidity: 0,
        vividness: 0.5,
        emotionalIntensity: 0.5,
        narrativeCoherence: 0.5,
      },
      summary: parsedAnalysis.summary || '',
      interpretation: parsedAnalysis.interpretation || '',
      questionsForReflection: parsedAnalysis.questionsForReflection || [],
    };
  }

  async generateDreamTitle(dreamContent: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一位善于捕捉梦境精髓的标题创作者。请根据用户的梦境内容，生成一个简洁、富有诗意且能反映梦境核心的标题。标题长度控制在5-20个汉字。只返回标题本身，不要任何其他内容。',
      },
      {
        role: 'user',
        content: `梦境内容：\n${dreamContent}`,
      },
    ];

    const response = await this.chatCompletion(messages, {
      temperature: 0.8,
      maxTokens: 50,
    });

    const title = response.choices[0]?.message?.content?.trim() || '未命名的梦';
    return title.replace(/["']/g, '').substring(0, 50);
  }
}

export const volcengineService = new VolcengineService();
