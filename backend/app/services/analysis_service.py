from typing import List, Dict, Any, Optional
from collections import Counter
from datetime import datetime, timedelta
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.preprocessing import normalize
import logging

logger = logging.getLogger(__name__)


class DreamPatternAnalyzer:
    COMMON_MOTIFS = {
        "追逐": ["追", "跑", "逃离", "躲避", "追捕", "追赶"],
        "坠落": ["坠", "落", "掉", "下降", "失重", "摔倒"],
        "考试": ["考试", "测验", "答题", "试卷", "考场", "复习"],
        "迷路": ["迷路", "找不到", "迷失", "方向"],
        "飞翔": ["飞", "飘", "浮", "在空中", "飞翔"],
        "裸体": ["裸体", "没穿衣服", "赤裸", "裸露"],
        "牙齿脱落": ["牙掉", "牙齿脱落", "掉牙"],
        "怀孕": ["怀孕", "生孩子", "孕妇"],
        "死亡": ["死", "死亡", "去世", "葬礼"],
        "水": ["游泳", "溺水", "大海", "河流", "洪水", "雨"],
        "车": ["开车", "坐车", "车祸", "火车", "飞机"],
        "被攻击": ["打架", "攻击", "受伤", "杀", "暴力"]
    }

    EMOTION_KEYWORDS = {
        "恐惧": ["害怕", "恐惧", "惊恐", "恐慌", "吓人", "恐怖"],
        "焦虑": ["紧张", "焦虑", "担心", "不安", "着急", "压力"],
        "悲伤": ["难过", "悲伤", "哭泣", "伤心", "失落", "绝望"],
        "快乐": ["开心", "快乐", "高兴", "愉快", "幸福", "笑"],
        "愤怒": ["生气", "愤怒", "恼火", "发火", "气愤"],
        "惊讶": ["惊讶", "惊奇", "震惊", "意外", "突然"],
        "厌恶": ["讨厌", "恶心", "厌恶", "反感"],
        "平静": ["平静", "宁静", "放松", "安心", "舒服"]
    }

    @staticmethod
    def detect_motifs(dream_content: str) -> List[str]:
        detected_motifs = []
        for motif, keywords in DreamPatternAnalyzer.COMMON_MOTIFS.items():
            for keyword in keywords:
                if keyword in dream_content:
                    detected_motifs.append(motif)
                    break
        return list(set(detected_motifs))

    @staticmethod
    def detect_emotions(dream_content: str) -> List[Dict[str, Any]]:
        emotions = []
        for emotion, keywords in DreamPatternAnalyzer.EMOTION_KEYWORDS.items():
            count = 0
            for keyword in keywords:
                count += dream_content.count(keyword)
            if count > 0:
                intensity = min(count * 2, 10)
                emotions.append({
                    "name": emotion,
                    "intensity": intensity,
                    "context": f"梦境中出现{count}次与{emotion}相关的描述"
                })
        return emotions

    @staticmethod
    def extract_keywords(text: str, top_n: int = 20) -> List[str]:
        text = re.sub(r'[^\w\s]', '', text)
        stopwords = set(['的', '了', '是', '在', '我', '有', '和', '就', 
                         '不', '人', '都', '一', '一个', '上', '也', '很', 
                         '到', '说', '要', '去', '你', '会', '着', '没有',
                         '看', '好', '自己', '这', '那', '他', '她', '它'])
        
        words = text.split()
        word_freq = Counter(w for w in words if w not in stopwords and len(w) > 1)
        
        return [word for word, _ in word_freq.most_common(top_n)]


class ThemeClusterService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words=['的', '了', '是', '在', '我', '有', '和', '就']
        )

    def cluster_dreams(self, dreams: List[Dict[str, Any]], 
                       n_clusters: Optional[int] = None) -> List[Dict[str, Any]]:
        if len(dreams) < 3:
            return self._single_cluster_analysis(dreams)

        texts = [dream.get("content", "") for dream in dreams]
        
        try:
            tfidf_matrix = self.vectorizer.fit_transform(texts)
            tfidf_normalized = normalize(tfidf_matrix)
            
            if n_clusters is None:
                n_clusters = min(5, len(dreams) // 3 + 1)
            
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = kmeans.fit_predict(tfidf_normalized)
            
            clusters = []
            for i in range(n_clusters):
                cluster_dreams = [
                    dreams[j] for j, label in enumerate(cluster_labels) if label == i
                ]
                
                if cluster_dreams:
                    cluster_info = self._analyze_cluster(cluster_dreams, i)
                    clusters.append(cluster_info)
            
            return clusters
            
        except Exception as e:
            logger.error(f"Clustering error: {e}")
            return self._single_cluster_analysis(dreams)

    def _single_cluster_analysis(self, dreams: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not dreams:
            return []
        
        cluster_info = self._analyze_cluster(dreams, 0)
        cluster_info["cluster_name"] = "梦境合集"
        return [cluster_info]

    def _analyze_cluster(self, dreams: List[Dict[str, Any]], 
                        cluster_id: int) -> Dict[str, Any]:
        all_content = " ".join([dream.get("content", "") for dream in dreams])
        
        keywords = DreamPatternAnalyzer.extract_keywords(all_content, top_n=15)
        
        all_motifs = []
        all_emotions = []
        for dream in dreams:
            content = dream.get("content", "")
            all_motifs.extend(DreamPatternAnalyzer.detect_motifs(content))
            all_emotions.extend([e.get("name") for e in DreamPatternAnalyzer.detect_emotions(content)])
        
        motif_counts = Counter(all_motifs)
        emotion_counts = Counter(all_emotions)
        
        dates = []
        for dream in dreams:
            if dream.get("dream_date"):
                if isinstance(dream["dream_date"], str):
                    dates.append(datetime.fromisoformat(dream["dream_date"].replace('Z', '+00:00')))
                else:
                    dates.append(dream["dream_date"])
        
        cluster_name = self._generate_cluster_name(keywords, motif_counts, emotion_counts)
        
        return {
            "cluster_id": cluster_id,
            "cluster_name": cluster_name,
            "dream_count": len(dreams),
            "keywords": keywords[:10],
            "top_motifs": [motif for motif, _ in motif_counts.most_common(5)],
            "top_emotions": [emotion for emotion, _ in emotion_counts.most_common(3)],
            "first_appearance": min(dates).isoformat() if dates else None,
            "last_appearance": max(dates).isoformat() if dates else None,
            "dream_ids": [dream.get("id") for dream in dreams],
            "pattern_description": self._generate_pattern_description(
                keywords, motif_counts, emotion_counts, len(dreams)
            )
        }

    def _generate_cluster_name(self, keywords: List[str], 
                               motif_counts: Counter, 
                               emotion_counts: Counter) -> str:
        if motif_counts:
            top_motif = motif_counts.most_common(1)[0][0]
            if emotion_counts:
                top_emotion = emotion_counts.most_common(1)[0][0]
                return f"{top_emotion}的{top_motif}"
            return f"{top_motif}主题"
        
        if emotion_counts:
            top_emotion = emotion_counts.most_common(1)[0][0]
            return f"{top_emotion}相关"
        
        if keywords:
            return f"{keywords[0]}相关梦境"
        
        return "梦境主题"

    def _generate_pattern_description(self, keywords: List[str], 
                                       motif_counts: Counter, 
                                       emotion_counts: Counter,
                                       dream_count: int) -> str:
        parts = []
        
        if motif_counts:
            motifs_list = [m for m, _ in motif_counts.most_common(3)]
            parts.append(f"包含{len(motifs_list)}种典型梦境母题：{', '.join(motifs_list)}")
        
        if emotion_counts:
            emotions_list = [e for e, _ in emotion_counts.most_common(3)]
            parts.append(f"主要情绪为{', '.join(emotions_list)}")
        
        if keywords:
            key_keywords = keywords[:5]
            parts.append(f"高频关键词包括{', '.join(key_keywords)}")
        
        if parts:
            return f"该主题包含{dream_count}条梦境记录，{'; '.join(parts)}。"
        return f"该主题包含{dream_count}条梦境记录。"


class StatisticsService:
    @staticmethod
    def calculate_emotion_trend(dreams: List[Dict[str, Any]], 
                                 days: int = 30) -> Dict[str, Any]:
        if not dreams:
            return {"trend": [], "summary": {}}
        
        dream_emotions = []
        for dream in dreams:
            content = dream.get("content", "")
            emotions = DreamPatternAnalyzer.detect_emotions(content)
            
            date_str = dream.get("dream_date")
            if isinstance(date_str, str):
                date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            else:
                date = date_str or datetime.utcnow()
            
            dream_emotions.append({
                "date": date,
                "emotions": emotions
            })
        
        if not dream_emotions:
            return {"trend": [], "summary": {}}
        
        dream_emotions.sort(key=lambda x: x["date"])
        
        grouped_by_date = {}
        for item in dream_emotions:
            date_key = item["date"].strftime("%Y-%m-%d")
            if date_key not in grouped_by_date:
                grouped_by_date[date_key] = []
            grouped_by_date[date_key].extend(item["emotions"])
        
        trend_data = []
        for date_key, emotions_list in grouped_by_date.items():
            if emotions_list:
                avg_intensity = sum(e.get("intensity", 5) for e in emotions_list) / len(emotions_list)
                dominant_emotion = Counter(e.get("name") for e in emotions_list).most_common(1)[0][0]
                
                trend_data.append({
                    "date": date_key,
                    "dominant_emotion": dominant_emotion,
                    "average_intensity": round(avg_intensity, 2),
                    "emotions": [
                        {"name": e.get("name"), "intensity": e.get("intensity")}
                        for e in emotions_list
                    ]
                })
        
        all_emotions = []
        for item in dream_emotions:
            all_emotions.extend([e.get("name") for e in item["emotions"]])
        
        emotion_counts = Counter(all_emotions)
        
        summary = {
            "total_dreams": len(dreams),
            "emotion_distribution": dict(emotion_counts),
            "most_common_emotion": emotion_counts.most_common(1)[0][0] if emotion_counts else None,
            "date_range": {
                "start": dream_emotions[0]["date"].strftime("%Y-%m-%d"),
                "end": dream_emotions[-1]["date"].strftime("%Y-%m-%d")
            }
        }
        
        return {
            "trend": trend_data,
            "summary": summary
        }

    @staticmethod
    def analyze_recurring_patterns(dreams: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not dreams:
            return {}
        
        all_motifs = []
        all_keywords = []
        
        for dream in dreams:
            content = dream.get("content", "")
            all_motifs.extend(DreamPatternAnalyzer.detect_motifs(content))
            all_keywords.extend(DreamPatternAnalyzer.extract_keywords(content, top_n=5))
        
        motif_counts = Counter(all_motifs)
        keyword_counts = Counter(all_keywords)
        
        recurring_motifs = [
            {"name": motif, "count": count, "percentage": round(count / len(dreams) * 100, 1)}
            for motif, count in motif_counts.most_common(10)
            if count >= 2
        ]
        
        recurring_keywords = [
            {"word": word, "count": count}
            for word, count in keyword_counts.most_common(20)
            if count >= 2
        ]
        
        dream_count = len(dreams)
        pattern_strength = len(recurring_motifs) * 10 + min(len(recurring_keywords) // 2, 30)
        
        return {
            "recurring_motifs": recurring_motifs,
            "recurring_keywords": recurring_keywords,
            "pattern_strength": min(pattern_strength, 100),
            "analysis": StatisticsService._generate_pattern_analysis(
                recurring_motifs, dream_count
            )
        }

    @staticmethod
    def _generate_pattern_analysis(recurring_motifs: List[Dict], 
                                    dream_count: int) -> str:
        if not recurring_motifs:
            return f"根据{dream_count}条梦境记录，尚未发现明显的重复梦境模式。继续记录更多梦境可以帮助发现潜在的心理模式。"
        
        top_motif = recurring_motifs[0]
        parts = [f"根据{dream_count}条梦境记录分析："]
        
        parts.append(f"最常出现的梦境母题是「{top_motif['name']}」，共出现{top_motif['count']}次，占比{top_motif['percentage']}%。")
        
        if len(recurring_motifs) > 1:
            other_motifs = [m['name'] for m in recurring_motifs[1:3]]
            parts.append(f"此外，「{'、'.join(other_motifs)}」也是反复出现的主题。")
        
        psychological_notes = {
            "追逐": "追逐的梦境可能反映生活中感到被追赶或逃避某些问题",
            "坠落": "坠落的梦境可能与失控感或焦虑相关",
            "考试": "考试相关的梦境可能反映自我评估或压力感受",
            "迷路": "迷路的梦境可能表示生活中感到迷茫或不确定方向",
            "飞翔": "飞翔的梦境通常与自由感或突破限制相关",
            "水": "水相关的梦境可能与情绪状态或潜意识有关"
        }
        
        for motif in recurring_motifs[:3]:
            if motif['name'] in psychological_notes:
                parts.append(f"心理解读：{psychological_notes[motif['name']]}。")
                break
        
        return " ".join(parts)
