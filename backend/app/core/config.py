import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SETU - Multimodal Classroom Accessibility Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SETU_SECRET_KEY", "setu_inclusivity_secret_key_2026_dev_mode_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./setu_classroom.db")
    
    # Audio & STT Settings
    STT_ENGINE: str = os.getenv("SETU_STT_ENGINE", "hybrid") # hybrid / client-stream / backend
    ALLOWED_ORIGINS: list[str] = ["*"]
    
    # Storage
    STORAGE_DIR: str = os.getenv("SETU_STORAGE_DIR", "./storage")

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
