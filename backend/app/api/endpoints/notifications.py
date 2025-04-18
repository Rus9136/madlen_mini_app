from fastapi import APIRouter, Depends, HTTPException, Query, Path, status
from sqlalchemy.orm import Session
from typing import Optional, List

from app.db.base import get_db
from app.services.auth import get_current_active_user, get_current_admin
from app.models.user import User
from app.services.notification_service import notification_service
from app.schemas.user import Notification, NotificationList, NotificationCreate, NotificationUpdate

router = APIRouter()


@router.get("/", response_model=NotificationList)
async def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None, description="Фильтр по категории уведомлений"),
    is_read: Optional[bool] = Query(None, description="Фильтр по статусу прочтения"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Получение списка уведомлений для текущего пользователя
    """
    result = await notification_service.get_notifications(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        category=category,
        is_read=is_read
    )
    
    return result


@router.post("/mark-read/{notification_id}", response_model=Notification)
async def mark_notification_as_read(
    notification_id: int = Path(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Пометка уведомления как прочитанного
    """
    notification = await notification_service.mark_notification_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return notification


@router.post("/mark-all-read", response_model=dict)
async def mark_all_notifications_as_read(
    category: Optional[str] = Query(None, description="Категория уведомлений для пометки (все, если не указана)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Пометка всех уведомлений как прочитанных
    """
    count = await notification_service.mark_all_as_read(
        db=db,
        user_id=current_user.id,
        category=category
    )
    
    return {"success": True, "marked_count": count}


@router.delete("/{notification_id}", response_model=dict)
async def delete_notification(
    notification_id: int = Path(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Удаление уведомления
    """
    success = await notification_service.delete_notification(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"success": True}


@router.post("/create", response_model=Notification, dependencies=[Depends(get_current_admin)])
async def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):
    """
    Создание нового уведомления (только для администраторов)
    """
    db_notification = await notification_service.create_notification(
        db=db,
        notification=notification
    )
    
    return db_notification


@router.post("/create-for-role", response_model=dict, dependencies=[Depends(get_current_admin)])
async def create_notifications_for_role(
    role: str = Query(..., description="Роль пользователей (employee, manager, admin)"),
    category: str = Query(..., description="Категория уведомления"),
    title: str = Query(..., description="Заголовок уведомления"),
    message: str = Query(..., description="Текст уведомления"),
    db: Session = Depends(get_db)
):
    """
    Создание уведомлений для всех пользователей с определенной ролью (только для администраторов)
    """
    notifications = await notification_service.create_notifications_for_role(
        db=db,
        role=role,
        category=category,
        title=title,
        message=message
    )
    
    return {"success": True, "created_count": len(notifications)}
