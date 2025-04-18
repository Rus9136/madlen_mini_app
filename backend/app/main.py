from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
from loguru import logger
import redis
import json

from app.api.api import api_router
from app.core.config import settings

# Настройка логирования
logger.add(
    "logs/app.log", 
    rotation="500 MB", 
    level="INFO", 
    format="{time} {level} {message}",
    serialize=False
)

# Создаем приложение FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Добавляем middleware для CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем кэширование через Redis, если нужно
try:
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=0,
        decode_responses=True
    )
    # Проверка соединения
    redis_client.ping()
    logger.info("Connected to Redis successfully")
except Exception as e:
    redis_client = None
    logger.warning(f"Failed to connect to Redis: {e}")


# Middleware для логирования запросов и времени выполнения
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    
    # Получаем клиентский IP
    client_host = request.client.host if request.client else "unknown"
    
    logger.info(f"Request: {request.method} {request.url.path} - Client: {client_host}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Response: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        return response
    except Exception as e:
        logger.exception(f"Error processing request: {request.method} {request.url.path} - {e}")
        return JSONResponse(
            status_code=500, 
            content={"detail": "Internal Server Error"}
        )


# Подключаем API роутеры
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {"message": "Welcome to Telegram Mini App Backend API"}


@app.get("/health")
async def health_check():
    """
    Endpoint для проверки работоспособности API
    """
    # Проверяем подключение к Redis
    redis_status = "ok" if redis_client and redis_client.ping() else "not connected"
    
    return {
        "status": "ok",
        "api_version": "1.0.0",
        "redis": redis_status
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
