from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from app.database import get_db
from app.models import User, Dream, DreamAnalysis, DreamElement
from app.schemas import StatisticsResponse
from app.routers.auth import get_current_user
from app.services.analysis_service import StatisticsService, ThemeClusterService

router = APIRouter(prefix="/api/statistics", tags=["statistics"])


@router.get("/overview", response_model=StatisticsResponse)
async def get_statistics_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dreams = db.query(Dream).filter(Dream.user_id == current_user.id).all()
    
    if not dreams:
        return StatisticsResponse(
            total_dreams=0,
            emotion_distribution={},
            most_common_emotion=None,
            recurring_motifs=[],
            recurring_keywords=[],
            pattern_strength=0,
            analysis="暂无梦境记录，请开始记录你的第一个梦境。"
        )
    
    dreams_data = []
    for dream in dreams:
        dreams_data.append({
            "id": dream.id,
            "content": dream.content,
            "dream_date": dream.dream_date
        })
    
    emotion_trend = StatisticsService.calculate_emotion_trend(dreams_data)
    patterns = StatisticsService.analyze_recurring_patterns(dreams_data)
    
    summary = emotion_trend.get("summary", {})
    
    return StatisticsResponse(
        total_dreams=summary.get("total_dreams", 0),
        emotion_distribution=summary.get("emotion_distribution", {}),
        most_common_emotion=summary.get("most_common_emotion"),
        recurring_motifs=patterns.get("recurring_motifs", []),
        recurring_keywords=patterns.get("recurring_keywords", []),
        pattern_strength=patterns.get("pattern_strength", 0),
        analysis=patterns.get("analysis", "")
    )


@router.get("/emotion-trend")
async def get_emotion_trend(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dreams = db.query(Dream).filter(Dream.user_id == current_user.id).all()
    
    if not dreams:
        return {"trend": [], "summary": {}}
    
    dreams_data = []
    for dream in dreams:
        dreams_data.append({
            "id": dream.id,
            "content": dream.content,
            "dream_date": dream.dream_date
        })
    
    return StatisticsService.calculate_emotion_trend(dreams_data, days)


@router.get("/theme-clusters")
async def get_theme_clusters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dreams = db.query(Dream).filter(Dream.user_id == current_user.id).all()
    
    if not dreams:
        return {"clusters": [], "message": "暂无足够的梦境进行主题聚类"}
    
    if len(dreams) < 3:
        dreams_data = []
        for dream in dreams:
            dreams_data.append({
                "id": dream.id,
                "content": dream.content,
                "dream_date": dream.dream_date
            })
        
        cluster_service = ThemeClusterService()
        clusters = cluster_service.cluster_dreams(dreams_data)
        
        return {
            "clusters": clusters,
            "message": f"仅{len(dreams)}条梦境，建议继续记录更多梦境以获得更准确的主题分析"
        }
    
    dreams_data = []
    for dream in dreams:
        dreams_data.append({
            "id": dream.id,
            "content": dream.content,
            "dream_date": dream.dream_date
        })
    
    cluster_service = ThemeClusterService()
    clusters = cluster_service.cluster_dreams(dreams_data)
    
    return {"clusters": clusters}


@router.get("/insights")
async def get_personal_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dreams = db.query(Dream).filter(Dream.user_id == current_user.id).all()
    
    if not dreams:
        return {"insights": [], "message": "记录更多梦境后将生成个性化洞察"}
    
    dreams_data = []
    for dream in dreams:
        dreams_data.append({
            "id": dream.id,
            "content": dream.content,
            "dream_date": dream.dream_date
        })
    
    patterns = StatisticsService.analyze_recurring_patterns(dreams_data)
    emotion_trend = StatisticsService.calculate_emotion_trend(dreams_data)
    
    insights = []
    
    recurring_motifs = patterns.get("recurring_motifs", [])
    if recurring_motifs:
        top_motif = recurring_motifs[0]
        insights.append({
            "type": "pattern",
            "title": f"最常出现的梦境母题：{top_motif['name']}",
            "description": f"该母题在你的{top_motif['count']}条梦境中出现，占比{top_motif['percentage']}%。这可能反映了你潜意识中反复关注的主题。",
            "supporting_dreams": [d.get("id") for d in dreams_data][:5],
            "confidence": 0.85
        })
    
    emotion_dist = emotion_trend.get("summary", {}).get("emotion_distribution", {})
    if emotion_dist:
        sorted_emotions = sorted(emotion_dist.items(), key=lambda x: x[1], reverse=True)
        if sorted_emotions:
            top_emotion, count = sorted_emotions[0]
            insights.append({
                "type": "emotion",
                "title": f"主导情绪：{top_emotion}",
                "description": f"在你的梦境中，{top_emotion}是出现频率最高的情绪，共出现{count}次。这可能反映了你近期的整体心理状态。",
                "supporting_dreams": [d.get("id") for d in dreams_data][:5],
                "confidence": 0.8
            })
    
    dream_count = len(dreams)
    if dream_count >= 7:
        insights.append({
            "type": "activity",
            "title": "梦境记录习惯分析",
            "description": f"你已经记录了{dream_count}条梦境。持续记录梦境有助于发现更深层的心理模式和潜意识变化。建议保持这个习惯。",
            "supporting_dreams": [],
            "confidence": 0.9
        })
    
    if patterns.get("pattern_strength", 0) >= 40:
        insights.append({
            "type": "analysis",
            "title": "梦境模式识别",
            "description": f"你的梦境表现出较强的模式性（模式强度：{patterns.get('pattern_strength')}%）。这意味着你的潜意识活动有较为明显的主题和关注点。",
            "supporting_dreams": [],
            "confidence": 0.75
        })
    
    return {"insights": insights}
