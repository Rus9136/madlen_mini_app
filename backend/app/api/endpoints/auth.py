from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import logging

from app.db.base import get_db
from app.core.config import settings
from app.services.auth import create_access_token, verify_telegram_data
from app.models.user import User, UserAction
from app.schemas.user import User as UserSchema, TokenData, Token, UserCreate

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/telegram-auth", response_model=Token)
async def login_with_telegram(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Аутентификация через Telegram Mini App.
    """
    try:
        # Получаем данные из Telegram WebApp
        form_data = await request.form()
        init_data = form_data.get("_auth")
        
        if not init_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid authentication data"
            )
        
        # Проверяем данные от Telegram
        telegram_data = verify_telegram_data(init_data)
        
        # Получаем Telegram ID пользователя
        telegram_id = telegram_data.get("id")
        if not telegram_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID not found in Telegram data"
            )
        
        # Проверяем, есть ли пользователь в базе
        user = db.query(User).filter(User.telegram_id == telegram_id).first()
        
        # Если пользователя нет, создаем его с ролью employee
        if not user:
            new_user = User(
                telegram_id=telegram_id,
                username=telegram_data.get("username", ""),
                full_name=telegram_data.get("first_name", "") + " " + telegram_data.get("last_name", ""),
                role="employee"
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user
        
        # Логируем действие пользователя
        log_action = UserAction(
            user_id=user.id,
            action_type="login",
            action_details="Telegram Mini App login",
            ip_address=request.client.host if request.client else None
        )
        db.add(log_action)
        db.commit()
        
        # Создаем JWT токен
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.telegram_id, "role": user.role},
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    except Exception as e:
        logger.exception(f"Error during Telegram authentication: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error"
        )


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Получение токена через логин/пароль (для внутреннего использования)
    В основном используется для тестирования и доступа к API из других систем
    """
    # В данном примере ищем пользователя по telegram_id, который используется как username
    user = db.query(User).filter(User.telegram_id == form_data.username).first()
    
    # В реальном приложении здесь должна быть проверка пароля
    # Для примера просто проверяем, что пользователь существует и активен
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.telegram_id, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}
