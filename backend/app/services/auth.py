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
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        telegram_id: str = payload.get("sub")
        if telegram_id is None:
            raise credentials_exception
        token_data = TokenData(telegram_id=telegram_id, role=payload.get("role"))
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.telegram_id == token_data.telegram_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def check_user_role(required_roles: list):
    """
    Декоратор для проверки роли пользователя
    """
    async def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return dependency


# Удобные обертки для проверки ролей
get_current_admin = check_user_role(["admin"])
get_current_manager = check_user_role(["admin", "manager"])
