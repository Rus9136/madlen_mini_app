import sys
import os
from datetime import datetime

# Добавляем родительскую директорию в путь
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.db.base import SessionLocal, engine, Base
from app.models.user import User, Notification

def init_db():
    """
    Инициализация базы данных тестовыми данными
    """
    db = SessionLocal()
    try:
        # Проверяем, есть ли уже пользователи в базе
        admin_exists = db.query(User).filter(User.role == "admin").first()
        
        if not admin_exists:
            print("Создание тестового администратора...")
            # Создаем администратора
            admin = User(
                telegram_id="12345678",
                username="admin",
                full_name="Администратор",
                role="admin",
                is_active=True,
                created_at=datetime.now()
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            
            # Создаем тестовое уведомление для администратора
            notification = Notification(
                user_id=admin.id,
                category="system",
                title="Добро пожаловать в систему",
                message="Система успешно инициализирована. Вы можете начать работу.",
                is_read=False,
                created_at=datetime.now()
            )
            db.add(notification)
            db.commit()
            
            print(f"Тестовый администратор создан с telegram_id: {admin.telegram_id}")
        else:
            print("Администратор уже существует. Пропускаем создание.")
            
    except Exception as e:
        print(f"Ошибка при инициализации данных: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("Инициализация базы данных...")
    # Base.metadata.create_all(bind=engine)  # Уже должно быть выполнено через Alembic
    init_db()
    print("Инициализация завершена!")
