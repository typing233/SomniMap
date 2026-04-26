from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        orm_mode = True


class UserConfigUpdate(BaseModel):
    volcanic_api_key: Optional[str] = None
    volcanic_model_name: Optional[str] = None
    privacy_mode: Optional[str] = None


class UserConfigResponse(BaseModel):
    id: int
    user_id: int
    volcanic_model_name: str
    privacy_mode: str
    has_api_key: bool

    class Config:
        orm_mode = True


class DreamCreate(BaseModel):
    content: str
    sleep_start_time: Optional[datetime] = None
    sleep_end_time: Optional[datetime] = None
    dream_date: Optional[datetime] = None
    overall_emotion: Optional[str] = None
    clarity: Optional[int] = None


class DreamElementResponse(BaseModel):
    id: int
    element_type: str
    name: str
    description: Optional[str]
    importance: float
    context: Optional[str]

    class Config:
        orm_mode = True


class DreamAnalysisResponse(BaseModel):
    id: int
    dream_id: int
    themes: Optional[List[str]]
    symbols: Optional[List[Dict[str, Any]]]
    psychological_insights: Optional[List[str]]
    emotions: Optional[List[Dict[str, Any]]]
    motifs: Optional[List[str]]
    detailed_analysis: Optional[str]
    confidence_score: float

    class Config:
        orm_mode = True


class DreamResponse(BaseModel):
    id: int
    user_id: int
    content: str
    sleep_start_time: Optional[datetime]
    sleep_end_time: Optional[datetime]
    dream_date: datetime
    overall_emotion: Optional[str]
    clarity: Optional[int]
    created_at: datetime
    elements: List[DreamElementResponse] = []
    analysis: Optional[DreamAnalysisResponse] = None

    class Config:
        orm_mode = True


class ThemeClusterResponse(BaseModel):
    id: int
    cluster_name: str
    keywords: List[str]
    dream_count: int
    first_appearance: Optional[datetime]
    last_appearance: Optional[datetime]
    average_emotion: Optional[str]
    pattern_description: Optional[str]

    class Config:
        orm_mode = True


class EmotionTrendItem(BaseModel):
    date: str
    dominant_emotion: str
    average_intensity: float
    emotions: List[Dict[str, Any]]


class StatisticsResponse(BaseModel):
    total_dreams: int
    emotion_distribution: Dict[str, int]
    most_common_emotion: Optional[str]
    recurring_motifs: List[Dict[str, Any]]
    recurring_keywords: List[Dict[str, Any]]
    pattern_strength: int
    analysis: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
