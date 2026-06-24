from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from app.skills_data import SKILLS

model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_skills(text: str) -> set:
    text_lower = text.lower()
    return {skill for skill in SKILLS if skill in text_lower}

def generate_suggestions(missing_skills: list, fit_score: float) -> list:
    suggestions = []
    for skill in missing_skills[:5]:
        suggestions.append(f"Add '{skill}' to your skills section to improve your match score.")
    if fit_score < 50:
        suggestions.append("Consider rewriting your resume summary to better reflect the job requirements.")
    if fit_score < 70:
        suggestions.append("Highlight relevant projects that demonstrate the required technical skills.")
    if len(missing_skills) > 3:
        suggestions.append("Focus on acquiring the top missing skills through online courses or projects.")
    return suggestions

def match_resume_to_job(resume_text: str, job_text: str) -> dict:
    resume_vec = model.encode([resume_text])
    job_vec    = model.encode([job_text])
    semantic_score = float(cosine_similarity(resume_vec, job_vec)[0][0])

    resume_skills = extract_skills(resume_text)
    job_skills    = extract_skills(job_text)

    if len(job_skills) > 0:
        matched = resume_skills & job_skills
        skill_score = len(matched) / len(job_skills)
    else:
        matched = set()
        skill_score = 0.0

    missing = job_skills - resume_skills
    fit_score = round((semantic_score * 0.6 + skill_score * 0.4) * 100, 2)

    suggestions = generate_suggestions(sorted(list(missing)), fit_score)

    return {
        "fit_score": fit_score,
        "semantic_score": round(semantic_score * 100, 2),
        "skill_match_score": round(skill_score * 100, 2),
        "matched_skills": sorted(list(matched)),
        "missing_skills": sorted(list(missing)),
        "total_job_skills": len(job_skills),
        "suggestions": suggestions,
        "recommendation": (
            "Strong match 🟢" if fit_score >= 70
            else "Moderate match 🟡" if fit_score >= 50
            else "Weak match 🔴"
        )
    }