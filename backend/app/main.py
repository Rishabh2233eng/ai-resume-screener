from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.match import router as match_router
from app.routes.users import router as users_router
from app.database import engine
from app import models

# Create all tables in Neon on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Resume Screener")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match_router, prefix="/api")
app.include_router(users_router, prefix="/api/users")

@app.get("/")
def root():
    return {"status": "AI Resume Screener running"}