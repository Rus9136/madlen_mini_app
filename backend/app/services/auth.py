from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_telegram_data(init_data: str) -> dict:
    """
    Верификация данных от Telegram Mini App.
    В реальном приложении здесь должна быть проверка подписи и валидация данных.
    """
    # TODO: Реализовать проверку данных Telegram
    # https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    
    # Для примера просто разбираем строку параметров и возвращаем словарь
    # В реальном приложении должна быть полная проверка подписи!
    params = {}
    if init_data:
        parts = init_data.split('&')
        for part in parts:
            if '=' in part:
                key, value = part.split('=', 1)
                params[key] = value
    
    return params


async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    # Всегда возвращаем некий базовый пользовательский объект, авторизация отключена
    user = db.query(User).filter(User.id == 1).first()
    
    # Если пользователя нет в базе, создаем его
    if not user:
        user = User(
            id=1,
            telegram_id="111111111",
            username="admin",
            full_name="Admin User",
            role="admin",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    # Всегда считаем пользователя активным
    return current_user


def check_user_role(required_roles: list):
    """
    Декоратор для проверки роли пользователя (авторизация отключена)
    """
    async def dependency(current_user: User = Depends(get_current_user)):
        # Всегда разрешаем доступ
        return current_user
    return dependency


# Удобные обертки для проверки ролей
get_current_admin = check_user_role(["admin"])
get_current_manager = check_user_role(["admin", "manager"])
