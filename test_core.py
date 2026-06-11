from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer('all-MiniLM-L6-v2')

# Simulate a resume summary and 3 job descriptions
resume = "Python developer with experience in machine learning, FastAPI, React, and SQL databases"

jobs = [
    "Looking for a Python ML engineer with FastAPI and SQL skills",
    "Frontend React developer, JavaScript, CSS, Node.js required",
    "Data analyst role needing Excel, Power BI, and SQL",
]

# Encode all text into vectors
resume_vec = model.encode([resume])
job_vecs   = model.encode(jobs)

# Compute cosine similarity for each job
scores = cosine_similarity(resume_vec, job_vecs)[0]

for i, (job, score) in enumerate(zip(jobs, scores)):
    print(f"Job {i+1}: {score:.2f} → {job[:50]}...")