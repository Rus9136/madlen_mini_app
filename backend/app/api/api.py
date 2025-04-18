from fastapi import APIRouter

from app.api.endpoints import auth, sales, notifications, processes

api_router = APIRouter()

# Добавляем подмаршруты
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(sales.router, prefix="/sales", tags=["sales"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(processes.router, prefix="/processes", tags=["processes"])
