from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import spacy

# Load models once when server starts (not on every request)
model = SentenceTransformer('all-MiniLM-L6-v2')
nlp = spacy.load('en_core_web_sm')

def extract_skills(text: str) -> list[str]:
    doc = nlp(text)
    # Extract noun chunks and named entities as proxy for skills
    skills = set()
    for chunk in doc.noun_chunks:
        skills.add(chunk.text.lower().strip())
    for ent in doc.ents:
        skills.add(ent.text.lower().strip())
    return list(skills)

def match_resume_to_job(resume_text: str, job_text: str) -> dict:
    # Step 1 — semantic similarity score
    resume_vec = model.encode([resume_text])
    job_vec    = model.encode([job_text])
    score = cosine_similarity(resume_vec, job_vec)[0][0]
    fit_score = round(float(score) * 100, 2)

    # Step 2 — skill extraction
    resume_skills = set(extract_skills(resume_text))
    job_skills    = set(extract_skills(job_text))

    # Step 3 — gap analysis
    matched_skills = resume_skills & job_skills
    missing_skills = job_skills - resume_skills

    return {
        "fit_score": fit_score,
        "matched_skills": sorted(list(matched_skills)),
        "missing_skills": sorted(list(missing_skills)),
        "recommendation": (
            "Strong match" if fit_score >= 70
            else "Moderate match" if fit_score >= 50
            else "Weak match"
        )
    }