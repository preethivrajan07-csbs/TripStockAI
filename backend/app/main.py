from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.connection import engine, Base, SessionLocal
from app.database.seed_data import seed_database_if_empty
from app.api.routes import router as api_router

# Create DB tables
Base.metadata.create_all(bind=engine)

# Auto-seed on startup
with SessionLocal() as db:
    seed_database_if_empty(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Travel Inventory & Budget Optimization Platform for TBO.com"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "online", "platform": "TripStock AI", "version": settings.VERSION}
