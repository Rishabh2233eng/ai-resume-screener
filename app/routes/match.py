from fastapi import APIRouter, UploadFile, File, Form
from app.extractor import extract_text_from_pdf
from app.matcher import match_resume_to_job

router = APIRouter()

@router.post("/match")
async def match(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)
    result = match_resume_to_job(resume_text, job_description)
    return result