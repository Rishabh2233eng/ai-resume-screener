from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from app.skills_data import SKILLS
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_skills(text: str) -> set:
    text_lower = text.lower()
    return {skill for skill in SKILLS if skill in text_lower}

def generate_ai_suggestions(missing_skills: list, matched_skills: list, fit_score: float, job_text: str) -> list:
    try:
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        prompt = f"""You are a professional resume coach. A candidate has a {fit_score}% match for a job.

Matched skills: {', '.join(matched_skills[:10]) if matched_skills else 'none'}
Missing skills: {', '.join(missing_skills[:10]) if missing_skills else 'none'}
Job requires: {job_text[:500]}

Give exactly 4 specific, actionable resume improvement suggestions. Each suggestion must:
- Be specific to the missing skills or job requirements
- Tell exactly what to add, change, or highlight in the resume
- Be one sentence, direct and practical

Return ONLY a JSON array of 4 strings, nothing else. Example:
["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]"""

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        text = message.content[0].text.strip()
        suggestions = json.loads(text)
        return suggestions[:4]
    except Exception:
        # Fallback to rule-based suggestions if API fails
        suggestions = []
        for skill in missing_skills[:3]:
            suggestions.append(f"Add '{skill}' to your Skills section — it's explicitly required in this job description.")
        if fit_score < 70:
            suggestions.append("Rewrite your resume summary to mirror the job description's language and key requirements.")
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

    suggestions = generate_ai_suggestions(
        sorted(list(missing)),
        sorted(list(matched)),
        fit_score,
        job_text
    )

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