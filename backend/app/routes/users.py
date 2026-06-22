from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token, get_current_user
from app.limiter import limiter

router = APIRouter()

@router.post("/register", response_model=schemas.Token)
@limiter.limit("5/minute")
def register(request: Request, user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    if len(user_data.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters.")
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    existing = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    user = models.User(
        name=user_data.name.strip(),
        email=user_data.email.lower().strip(),
        hashed_password=hash_password(user_data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=schemas.Token)
@limiter.limit("10/minute")
def login(request: Request, user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        models.User.email == user_data.email.lower().strip()
    ).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user=Depends(get_current_user)):
    return current_user

@router.get("/history", response_model=list[schemas.AnalysisOut])
def get_history(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Analysis)\
        .filter(models.Analysis.user_id == current_user.id)\
        .order_by(models.Analysis.created_at.desc())\
        .all()