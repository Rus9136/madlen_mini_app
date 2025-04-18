from typing import List, Dict, Any, Optional
import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.user import Notification, User
from app.schemas.user import NotificationCreate, NotificationUpdate

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Сервис для работы с уведомлениями пользователей
    """
    
    @staticmethod
    async def get_notifications(
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100, 
        category: Optional[str] = None, 
        is_read: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Получение списка уведомлений для пользователя с фильтрацией
        """
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        # Применяем фильтры, если они указаны
        if category:
            query = query.filter(Notification.category == category)
            
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
        
        # Получаем общее количество уведомлений
        total = query.count()
        
        # Применяем пагинацию и сортировку по дате (сначала новые)
        notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
        
        return {
            "notifications": notifications,
            "total": total
        }
    
    @staticmethod
    async def create_notification(db: Session, notification: NotificationCreate) -> Notification:
        """
        Создание нового уведомления
        """
        db_notification = Notification(
            user_id=notification.user_id,
            category=notification.category,
            title=notification.title,
            message=notification.message
        )
        
        db.add(db_notification)
        db.commit()
        db.refresh(db_notification)
        
        return db_notification
    
    @staticmethod
    async def create_notifications_for_role(
        db: Session,
        role: str,
        category: str,
        title: str,
        message: str
    ) -> List[Notification]:
        """
        Создание уведомлений для всех пользователей с определенной ролью
        """
        users = db.query(User).filter(User.role == role, User.is_active == True).all()
        
        notifications = []
        for user in users:
            notification = Notification(
                user_id=user.id,
                category=category,
                title=title,
                message=message
            )
            db.add(notification)
            notifications.append(notification)
        
        db.commit()
        for notification in notifications:
            db.refresh(notification)
        
        return notifications
    
    @staticmethod
    async def mark_notification_as_read(
        db: Session, 
        notification_id: int, 
        user_id: int
    ) -> Optional[Notification]:
        """
        Пометка уведомления как прочитанного
        """
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
            
        return notification
    
    @staticmethod
    async def mark_all_as_read(db: Session, user_id: int, category: Optional[str] = None) -> int:
        """
        Пометка всех уведомлений пользователя как прочитанных
        Возвращает количество обновленных уведомлений
        """
        query = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        )
        
        if category:
            query = query.filter(Notification.category == category)
        
        count = query.count()
        
        if count > 0:
            query.update({"is_read": True})
            db.commit()
        
        return count
    
    @staticmethod
    async def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """
        Удаление уведомления
        """
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            db.delete(notification)
            db.commit()
            return True
        
        return False
    
    @staticmethod
    async def delete_old_notifications(db: Session, days: int = 30) -> int:
        """
        Удаление старых прочитанных уведомлений
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Удаляем прочитанные уведомления старше указанного срока
        result = db.query(Notification).filter(
            Notification.is_read == True,
            Notification.created_at < cutoff_date
        ).delete()
        
        db.commit()
        
        return result


# Создаем экземпляр сервиса для уведомлений
notification_service = NotificationService()
