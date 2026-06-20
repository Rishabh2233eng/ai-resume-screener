from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# ── Auth schemas ──
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# ── Analysis schemas ──
class AnalysisOut(BaseModel):
    id: int
    fit_score: float
    semantic_score: float
    skill_match_score: float
    matched_skills: str
    missing_skills: str
    recommendation: str
    created_at: datetime

    class Config:
        from_attributes = True