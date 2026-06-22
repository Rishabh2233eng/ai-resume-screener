from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routes.match import router as match_router
from app.routes.users import router as users_router
from app.routes.payment import router as payment_router
from app.database import engine
from app import models

models.Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="ResumeIQ")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS lockdown — only allow your frontend domains
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://resumeiq.vercel.app",  # update this after Vercel deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(match_router, prefix="/api")
app.include_router(users_router, prefix="/api/users")
app.include_router(payment_router, prefix="/api/payment")

@app.get("/")
def root():
    return {"status": "ResumeIQ API running"}