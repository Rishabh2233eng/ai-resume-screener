from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id                  = Column(Integer, primary_key=True, index=True)
    name                = Column(String, nullable=False)
    email               = Column(String, unique=True, index=True, nullable=False)
    hashed_password     = Column(String, nullable=False)
    is_premium          = Column(Boolean, default=False)
    analyses_this_month = Column(Integer, default=0)
    usage_reset_date    = Column(DateTime, default=datetime.utcnow)
    created_at          = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("Analysis", back_populates="user")

class Analysis(Base):
    __tablename__ = "analyses"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"))
    job_description   = Column(Text, nullable=False)
    fit_score         = Column(Float)
    semantic_score    = Column(Float)
    skill_match_score = Column(Float)
    matched_skills    = Column(Text)
    missing_skills    = Column(Text)
    recommendation    = Column(String)
    created_at        = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analyses")