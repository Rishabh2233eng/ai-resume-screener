from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime
from app.extractor import extract_text_from_pdf
from app.matcher import match_resume_to_job
from app.database import get_db
from app.auth import get_current_user
from app.limiter import limiter
from app import models

router = APIRouter()

FREE_MONTHLY_LIMIT = 3
MAX_JD_LENGTH = 5000
MAX_FILE_SIZE = 5 * 1024 * 1024

@router.post("/match")
@limiter.limit("20/minute")
async def match(
    request: Request,
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
    file_bytes = await resume.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size must be under 5MB.")
    if not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description cannot be empty.")
    if len(job_description) > MAX_JD_LENGTH:
        raise HTTPException(status_code=400, detail=f"Job description must be under {MAX_JD_LENGTH} characters.")

    now = datetime.utcnow()
    if current_user.usage_reset_date.month != now.month or \
       current_user.usage_reset_date.year != now.year:
        current_user.analyses_this_month = 0
        current_user.usage_reset_date = now
        db.commit()

    if not current_user.is_premium and current_user.analyses_this_month >= FREE_MONTHLY_LIMIT:
        raise HTTPException(
            status_code=403,
            detail=f"Free tier limit reached ({FREE_MONTHLY_LIMIT}/month). Upgrade to Premium for unlimited analyses."
        )

    resume_text = extract_text_from_pdf(file_bytes)
    if len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Could not extract enough text from the PDF. Make sure it's not a scanned image.")

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
    current_user.analyses_this_month += 1
    db.commit()

    result["analyses_used"] = current_user.analyses_this_month
    result["analyses_limit"] = "unlimited" if current_user.is_premium else FREE_MONTHLY_LIMIT
    result["is_premium"] = current_user.is_premium
    return result