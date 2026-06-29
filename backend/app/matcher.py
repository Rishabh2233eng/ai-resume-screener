from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from app.skills_data import SKILLS
import anthropic
import os
import json
from dotenv import load_dotenv

load_dotenv()

model = SentenceTransformer('all-MiniLM-L6-v2')

def extract_skills(text: str) -> set:
    text_lower = text.lower()
    return {skill for skill in SKILLS if skill in text_lower}

def generate_ai_suggestions(missing_skills: list, matched_skills: list, fit_score: float, job_text: str, resume_text: str) -> list:
    try:
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        prompt = f"""You are an expert career coach who has reviewed thousands of resumes against job descriptions. A candidate scored {fit_score}% fit for this role.

JOB DESCRIPTION:
{job_text[:1200]}

CANDIDATE'S RESUME (excerpt):
{resume_text[:1200]}

MATCHED SKILLS: {', '.join(matched_skills) if matched_skills else 'none'}
MISSING SKILLS: {', '.join(missing_skills) if missing_skills else 'none'}

Give exactly 5 suggestions that would genuinely move the needle on this candidate's chances. Be specific to THIS resume and THIS job, not generic advice. Each suggestion must:
- Reference something specific from the resume or job description
- Tell the candidate exactly what to change, add, reword, or emphasize
- Explain briefly WHY it matters for this specific role
- Be 1-2 sentences, direct, no fluff

Avoid suggestions like "add X skill" unless you also explain how to demonstrate it through a project or bullet point. Prioritize highest-impact changes.

Return ONLY a JSON array of exactly 5 strings, nothing else, no markdown formatting, no code fences."""

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=900,
            messages=[{"role": "user", "content": prompt}]
        )
        text = message.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1].replace("json", "", 1).strip()
        suggestions = json.loads(text)
        return suggestions[:5]
    except Exception:
        suggestions = []
        for skill in missing_skills[:3]:
            suggestions.append(f"Add a project or bullet point demonstrating '{skill}' — listing it alone carries less weight than showing applied experience.")
        if fit_score < 70:
            suggestions.append("Rework your resume summary to mirror the exact terminology used in this job description.")
        if len(missing_skills) > 3:
            suggestions.append("Focus on closing your top 2-3 skill gaps first through a small project rather than trying to cover everything.")
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
        job_text,
        resume_text
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