from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # Общие настройки
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Telegram Mini App API"
    
    # Настройки БД PostgreSQL
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "db")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "tg_mini_app")
    DATABASE_URI: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"
    
    # Настройки Redis для кэширования
    REDIS_HOST: str = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))
    
    # Настройки JWT для аутентификации
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 дней
    
    # Настройки для 1С
    ONEC_API_URL: str = os.getenv("ONEC_API_URL", "http://1c-server:8080/api")
    ONEC_API_USER: str = os.getenv("ONEC_API_USER", "api_user")
    ONEC_API_PASSWORD: str = os.getenv("ONEC_API_PASSWORD", "api_password")
    
    # FTP настройки для обмена с 1С
    FTP_HOST: Optional[str] = os.getenv("FTP_HOST")
    FTP_USER: Optional[str] = os.getenv("FTP_USER")
    FTP_PASSWORD: Optional[str] = os.getenv("FTP_PASSWORD")
    FTP_DIR: Optional[str] = os.getenv("FTP_DIR", "/exchange")
    
    # CORS настройки
    CORS_ORIGINS: List[str] = [
        "https://t.me",
        "http://localhost",
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    
    # Telegram Bot API токен
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    
    class Config:
        env_file = ".env"


settings = Settings()
