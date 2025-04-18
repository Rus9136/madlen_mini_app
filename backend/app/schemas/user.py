from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    telegram_id: str
    username: Optional[str] = None
    full_name: Optional[str] = None


class UserCreate(UserBase):
    role: str = "employee"


class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserInDBBase(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class User(UserInDBBase):
    pass


class NotificationBase(BaseModel):
    category: str
    title: str
    message: str


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationInDBBase(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Notification(NotificationInDBBase):
    pass


class NotificationList(BaseModel):
    notifications: List[Notification]
    total: int


class UserActionCreate(BaseModel):
    user_id: int
    action_type: str
    action_details: Optional[str] = None
    ip_address: Optional[str] = None


class UserAction(UserActionCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    telegram_id: Optional[str] = None
    role: Optional[str] = None
