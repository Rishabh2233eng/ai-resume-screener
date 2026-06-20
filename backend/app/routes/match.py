from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.extractor import extract_text_from_pdf
from app.matcher import match_resume_to_job
from app.database import get_db
from app.auth import get_current_user
from app import models

router = APIRouter()

FREE_MONTHLY_LIMIT = 3

@router.post("/match")
async def match(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Reset monthly usage if a new month has started
    now = datetime.utcnow()
    if current_user.usage_reset_date.month != now.month or current_user.usage_reset_date.year != now.year:
        current_user.analyses_this_month = 0
        current_user.usage_reset_date = now
        db.commit()

    # Enforce free tier limit
    if not current_user.is_premium and current_user.analyses_this_month >= FREE_MONTHLY_LIMIT:
        raise HTTPException(
            status_code=403,
            detail=f"Free tier limit reached ({FREE_MONTHLY_LIMIT}/month). Upgrade to Premium for unlimited analyses."
        )

    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)
    result = match_resume_to_job(resume_text, job_description)

    analysis = models.Analysis(
        user_id=current_user.id,
        job_description=job_description,
        fit_score=result["fit_score"],
        semantic_score=result["semantic_score"],
        skill_match_score=result["skill_match_score"],
        matched_skills=", ".join(result["matched_skills"]),
        missing_skills=", ".join(result["missing_skills"]),
        recommendation=result["recommendation"]
    )
    db.add(analysis)

    # Increment usage count
    current_user.analyses_this_month += 1
    db.commit()

    result["analyses_used"] = current_user.analyses_this_month
    result["analyses_limit"] = "unlimited" if current_user.is_premium else FREE_MONTHLY_LIMIT
    result["is_premium"] = current_user.is_premium

    return result