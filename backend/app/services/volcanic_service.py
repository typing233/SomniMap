import httpx
import json
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class VolcanicArkService:
    def __init__(self, api_key: str, model_name: str = "doubao-pro-32k"):
        self.api_key = api_key
        self.model_name = model_name
        self.base_url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

    async def analyze_dream(self, dream_content: str) -> Dict[str, Any]:
        prompt = f"""你是一位专业的梦境分析师和心理学家。请对以下梦境进行深度分析，从心理学角度解析梦境的象征意义和潜在心理线索。

梦境内容：
{dream_content}

请以JSON格式返回分析结果，包含以下字段：
1. "themes": 字符串数组，提取梦境的核心主题（如："失去", "追求", "焦虑", "自我探索"等）
2. "symbols": 对象数组，每个对象包含：
   - "name": 象征物名称
   - "description": 在梦境中的表现
   - "meaning": 心理学意义解析
3. "psychological_insights": 字符串数组，深层心理洞察和潜意识线索
4. "emotions": 对象数组，每个对象包含：
   - "name": 情绪名称
   - "intensity": 强度（1-10）
   - "context": 情绪出现的情境
5. "motifs": 字符串数组，识别常见的梦境母题（如："追逐", "坠落", "考试", "迷路", "飞翔"等）
6. "detailed_analysis": 字符串，详细的心理学分析解释

请只返回JSON格式，不要有其他文字。"""

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": "你是一位专业的梦境分析师和心理学家，擅长从心理学角度解析梦境的象征意义。"},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    }
                )
                response.raise_for_status()
                result = response.json()
                
                content = result["choices"][0]["message"]["content"]
                
                try:
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    json_str = content[json_start:json_end]
                    parsed = json.loads(json_str)
                    return parsed
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON from response: {content}")
                    return {
                        "themes": ["无法解析"],
                        "symbols": [],
                        "psychological_insights": ["AI解析过程中出现格式错误"],
                        "emotions": [],
                        "motifs": [],
                        "detailed_analysis": content
                    }

        except httpx.HTTPError as e:
            logger.error(f"Volcanic Ark API error: {e}")
            raise Exception(f"API调用失败: {str(e)}")
        except Exception as e:
            logger.error(f"Dream analysis error: {e}")
            raise

    async def extract_elements(self, dream_content: str) -> Dict[str, Any]:
        prompt = f"""请从以下梦境内容中提取关键元素。

梦境内容：
{dream_content}

请以JSON格式返回提取结果，包含以下字段：
1. "characters": 对象数组，梦里出现的人物，每个对象包含：
   - "name": 人物名称
   - "description": 人物特征和行为
   - "relationship": 与梦者的关系
2. "locations": 对象数组，梦里出现的地点，每个对象包含：
   - "name": 地点名称
   - "description": 地点特征
3. "objects": 对象数组，梦里出现的重要物品，每个对象包含：
   - "name": 物品名称
   - "description": 物品特征和用途
4. "animals": 对象数组，梦里出现的动物，每个对象包含：
   - "name": 动物名称
   - "description": 动物特征和行为
5. "events": 对象数组，梦里发生的关键事件，每个对象包含：
   - "description": 事件描述
   - "order": 事件顺序（数字）
6. "colors": 字符串数组，梦里出现的重要颜色
7. "scene_changes": 字符串数组，场景变化描述

请只返回JSON格式，不要有其他文字。"""

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [
                            {"role": "system", "content": "你是一位专业的文本分析专家，擅长从文本中提取结构化信息。"},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 1500
                    }
                )
                response.raise_for_status()
                result = response.json()
                
                content = result["choices"][0]["message"]["content"]
                
                try:
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    json_str = content[json_start:json_end]
                    return json.loads(json_str)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse elements JSON: {content}")
                    return {
                        "characters": [],
                        "locations": [],
                        "objects": [],
                        "animals": [],
                        "events": [],
                        "colors": [],
                        "scene_changes": []
                    }

        except Exception as e:
            logger.error(f"Element extraction error: {e}")
            return {
                "characters": [],
                "locations": [],
                "objects": [],
                "animals": [],
                "events": [],
                "colors": [],
                "scene_changes": []
            }

    async def validate_api_key(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.base_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model_name,
                        "messages": [{"role": "user", "content": "你好"}],
                        "max_tokens": 10
                    }
                )
                return response.status_code == 200
        except:
            return False
