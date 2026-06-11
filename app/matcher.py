from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from app.skills_data import SKILLS

# Load once when server starts
model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_skills(text: str) -> set:
    text_lower = text.lower()
    found = set()
    for skill in SKILLS:
        # Match whole word/phrase — avoid partial matches
        if skill in text_lower:
            found.add(skill)
    return found

def match_resume_to_job(resume_text: str, job_text: str) -> dict:
    # Step 1 — semantic similarity
    resume_vec = model.encode([resume_text])
    job_vec    = model.encode([job_text])
    semantic_score = float(cosine_similarity(resume_vec, job_vec)[0][0])

    # Step 2 — skill extraction
    resume_skills = extract_skills(resume_text)
    job_skills    = extract_skills(job_text)

    # Step 3 — skill match score
    if len(job_skills) > 0:
        matched = resume_skills & job_skills
        skill_score = len(matched) / len(job_skills)
    else:
        matched = set()
        skill_score = 0.0

    missing = job_skills - resume_skills

    # Step 4 — combined fit score (60% semantic, 40% skill match)
    fit_score = round((semantic_score * 0.6 + skill_score * 0.4) * 100, 2)

    return {
        "fit_score": fit_score,
        "semantic_score": round(semantic_score * 100, 2),
        "skill_match_score": round(skill_score * 100, 2),
        "matched_skills": sorted(list(matched)),
        "missing_skills": sorted(list(missing)),
        "total_job_skills": len(job_skills),
        "recommendation": (
            "Strong match 🟢" if fit_score >= 70
            else "Moderate match 🟡" if fit_score >= 50
            else "Weak match 🔴"
        )
    }