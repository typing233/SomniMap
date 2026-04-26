from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, Dream, DreamElement, DreamAnalysis, UserConfig
from app.schemas import DreamCreate, DreamResponse
from app.routers.auth import get_current_user
from app.services.volcanic_service import VolcanicArkService
from app.services.analysis_service import DreamPatternAnalyzer
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/dreams", tags=["dreams"])


def get_user_config(db: Session, user_id: int) -> Optional[UserConfig]:
    return db.query(UserConfig).filter(UserConfig.user_id == user_id).first()


@router.post("/", response_model=DreamResponse)
async def create_dream(
    dream_data: DreamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_dream = Dream(
        user_id=current_user.id,
        content=dream_data.content,
        sleep_start_time=dream_data.sleep_start_time,
        sleep_end_time=dream_data.sleep_end_time,
        dream_date=dream_data.dream_date or datetime.utcnow(),
        overall_emotion=dream_data.overall_emotion,
        clarity=dream_data.clarity
    )
    
    db.add(new_dream)
    db.commit()
    db.refresh(new_dream)
    
    return new_dream


@router.post("/{dream_id}/analyze", response_model=DreamResponse)
async def analyze_dream(
    dream_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dream = db.query(Dream).filter(
        Dream.id == dream_id,
        Dream.user_id == current_user.id
    ).first()
    
    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="梦境不存在"
        )
    
    if dream.analysis:
        return dream
    
    config = get_user_config(db, current_user.id)
    
    if not config or not config.volcanic_api_key:
        return await analyze_with_local_rules(dream, db)
    
    try:
        volcanic_service = VolcanicArkService(
            api_key=config.volcanic_api_key,
            model_name=config.volcanic_model_name or "doubao-pro-32k"
        )
        
        elements_data = await volcanic_service.extract_elements(dream.content)
        
        for char in elements_data.get("characters", []):
            element = DreamElement(
                dream_id=dream.id,
                element_type="character",
                name=char.get("name", ""),
                description=char.get("description"),
                context=char.get("relationship")
            )
            db.add(element)
        
        for loc in elements_data.get("locations", []):
            element = DreamElement(
                dream_id=dream.id,
                element_type="location",
                name=loc.get("name", ""),
                description=loc.get("description")
            )
            db.add(element)
        
        for obj in elements_data.get("objects", []):
            element = DreamElement(
                dream_id=dream.id,
                element_type="object",
                name=obj.get("name", ""),
                description=obj.get("description")
            )
            db.add(element)
        
        for animal in elements_data.get("animals", []):
            element = DreamElement(
                dream_id=dream.id,
                element_type="animal",
                name=animal.get("name", ""),
                description=animal.get("description")
            )
            db.add(element)
        
        for color in elements_data.get("colors", []):
            element = DreamElement(
                dream_id=dream.id,
                element_type="color",
                name=color
            )
            db.add(element)
        
        analysis_data = await volcanic_service.analyze_dream(dream.content)
        
        motifs = analysis_data.get("motifs", [])
        if not motifs:
            motifs = DreamPatternAnalyzer.detect_motifs(dream.content)
        
        analysis = DreamAnalysis(
            dream_id=dream.id,
            themes=analysis_data.get("themes", []),
            symbols=analysis_data.get("symbols", []),
            psychological_insights=analysis_data.get("psychological_insights", []),
            emotions=analysis_data.get("emotions", []),
            motifs=motifs,
            detailed_analysis=analysis_data.get("detailed_analysis", ""),
            confidence_score=0.85
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(dream)
        
        return dream
        
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        return await analyze_with_local_rules(dream, db)


async def analyze_with_local_rules(dream: Dream, db: Session) -> Dream:
    keywords = DreamPatternAnalyzer.extract_keywords(dream.content)
    
    if keywords:
        for keyword in keywords[:5]:
            element = DreamElement(
                dream_id=dream.id,
                element_type="keyword",
                name=keyword
            )
            db.add(element)
    
    emotions = DreamPatternAnalyzer.detect_emotions(dream.content)
    motifs = DreamPatternAnalyzer.detect_motifs(dream.content)
    
    themes = []
    if "恐惧" in [e.get("name") for e in emotions]:
        themes.append("焦虑与恐惧")
    if "追逐" in motifs or "被攻击" in motifs:
        themes.append("压力与逃避")
    if not themes:
        themes.append("自我探索")
    
    analysis = DreamAnalysis(
        dream_id=dream.id,
        themes=themes,
        symbols=[],
        psychological_insights=[
            f"梦境中出现了{len(motifs)}种典型的梦境母题：{', '.join(motifs)}" if motifs else "未识别到典型梦境母题",
            f"主要情绪为：{', '.join([e.get('name') for e in emotions])}" if emotions else "未识别到明确的情绪倾向"
        ],
        emotions=emotions,
        motifs=motifs,
        detailed_analysis=generate_basic_analysis(dream.content, motifs, emotions),
        confidence_score=0.6
    )
    
    db.add(analysis)
    db.commit()
    db.refresh(dream)
    
    return dream


def generate_basic_analysis(content: str, motifs: List[str], emotions: List[dict]) -> str:
    parts = ["这是一个基础分析结果（未使用AI高级解析）。"]
    
    if motifs:
        parts.append(f"梦境包含以下典型母题：{', '.join(motifs)}。")
    
    if emotions:
        emotion_names = [e.get('name') for e in emotions]
        parts.append(f"识别到的主要情绪包括：{', '.join(emotion_names)}。")
    
    if "坠落" in motifs:
        parts.append("坠落的梦境可能暗示生活中感到失控或正在经历某些不确定的变化。")
    if "追逐" in motifs:
        parts.append("被追逐的梦境可能反映现实中感到压力、被要求或逃避某些问题。")
    if "考试" in motifs:
        parts.append("考试相关的梦境常与自我评估、焦虑或对表现的担忧相关。")
    if "迷路" in motifs:
        parts.append("迷路的梦境可能表示生活中感到迷茫或不确定方向。")
    
    parts.append("建议配置火山方舟API Key以获取更深度的心理学解析。")
    
    return " ".join(parts)


@router.get("/", response_model=List[DreamResponse])
async def get_dreams(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dreams = db.query(Dream).filter(
        Dream.user_id == current_user.id
    ).order_by(Dream.dream_date.desc()).offset(skip).limit(limit).all()
    
    return dreams


@router.get("/{dream_id}", response_model=DreamResponse)
async def get_dream(
    dream_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dream = db.query(Dream).filter(
        Dream.id == dream_id,
        Dream.user_id == current_user.id
    ).first()
    
    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="梦境不存在"
        )
    
    return dream


@router.delete("/{dream_id}")
async def delete_dream(
    dream_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dream = db.query(Dream).filter(
        Dream.id == dream_id,
        Dream.user_id == current_user.id
    ).first()
    
    if not dream:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="梦境不存在"
        )
    
    db.query(DreamElement).filter(DreamElement.dream_id == dream_id).delete()
    db.query(DreamAnalysis).filter(DreamAnalysis.dream_id == dream_id).delete()
    db.delete(dream)
    db.commit()
    
    return {"message": "梦境已删除"}
