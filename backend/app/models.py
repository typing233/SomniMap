from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password_hash = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    dreams = relationship("Dream", back_populates="user")
    config = relationship("UserConfig", back_populates="user", uselist=False)


class UserConfig(Base):
    __tablename__ = "user_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    volcanic_api_key = Column(String(255))
    volcanic_model_name = Column(String(100), default="doubao-pro-32k")
    volcanic_base_url = Column(String(500))
    privacy_mode = Column(String(20), default="standard")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="config")


class Dream(Base):
    __tablename__ = "dreams"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    sleep_start_time = Column(DateTime)
    sleep_end_time = Column(DateTime)
    dream_date = Column(DateTime, default=datetime.utcnow)
    overall_emotion = Column(String(50))
    clarity = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="dreams")
    analysis = relationship("DreamAnalysis", back_populates="dream", uselist=False)
    elements = relationship("DreamElement", back_populates="dream")


class DreamElement(Base):
    __tablename__ = "dream_elements"
    
    id = Column(Integer, primary_key=True, index=True)
    dream_id = Column(Integer, ForeignKey("dreams.id"))
    element_type = Column(String(50))
    name = Column(String(200))
    description = Column(Text)
    importance = Column(Float, default=0.5)
    context = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    dream = relationship("Dream", back_populates="elements")


class DreamAnalysis(Base):
    __tablename__ = "dream_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    dream_id = Column(Integer, ForeignKey("dreams.id"), unique=True)
    themes = Column(JSON)
    symbols = Column(JSON)
    psychological_insights = Column(JSON)
    emotions = Column(JSON)
    motifs = Column(JSON)
    detailed_analysis = Column(Text)
    confidence_score = Column(Float, default=0.8)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    dream = relationship("Dream", back_populates="analysis")


class ThemeCluster(Base):
    __tablename__ = "theme_clusters"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    cluster_name = Column(String(100))
    keywords = Column(JSON)
    dream_count = Column(Integer, default=0)
    first_appearance = Column(DateTime)
    last_appearance = Column(DateTime)
    average_emotion = Column(String(50))
    pattern_description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserInsight(Base):
    __tablename__ = "user_insights"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    insight_type = Column(String(50))
    title = Column(String(200))
    description = Column(Text)
    supporting_dreams = Column(JSON)
    confidence = Column(Float, default=0.7)
    created_at = Column(DateTime, default=datetime.utcnow)
