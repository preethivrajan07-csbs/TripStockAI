import os

class Settings:
    PROJECT_NAME: str = "TripStock AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tripstock.db")
    DEMO_USER_EMAIL: str = "inventory.director@tbo.com"
    DEMO_USER_PASSWORD: str = "TripStock@2026"
    CORS_ORIGINS: list = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

settings = Settings()
