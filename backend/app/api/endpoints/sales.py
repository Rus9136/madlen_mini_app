from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.db.base import get_db
from app.services.auth import get_current_active_user, get_current_manager
from app.models.user import User, UserAction
from app.services.onec_service import onec_service
from app.schemas.sales import (
    SalesFilter, 
    SalesResponse, 
    StoresResponse,
    WarehousesResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=SalesResponse)
async def get_sales(
    period: str = Query("today", description="Период: today, yesterday, week, month"),
    store_id: Optional[str] = Query(None, description="ID магазина"),
    warehouse_id: Optional[str] = Query(None, description="ID склада"),
    category_id: Optional[str] = Query(None, description="ID категории"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Получение данных о продажах с фильтрацией
    """
    try:
        # Создаем фильтр для получения данных из 1С
        filter_params = SalesFilter(
            period=period,
            store_id=store_id,
            warehouse_id=warehouse_id,
            category_id=category_id
        )
        
        # Логируем действие пользователя
        log_action = UserAction(
            user_id=current_user.id,
            action_type="view_sales",
            action_details=f"Просмотр продаж за период: {period}"
        )
        db.add(log_action)
        db.commit()
        
        # Запрашиваем данные из 1С
        sales_data = await onec_service.get_sales_data(filter_params)
        
        return sales_data
    
    except Exception as e:
        logger.exception(f"Error getting sales data: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/stores", response_model=StoresResponse)
async def get_stores(
    current_user: User = Depends(get_current_active_user)
):
    """
    Получение списка магазинов из 1С
    """
    try:
        stores = await onec_service.get_stores()
        return {"stores": stores}
    
    except Exception as e:
        logger.exception(f"Error getting stores: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/warehouses", response_model=WarehousesResponse)
async def get_warehouses(
    store_id: Optional[str] = Query(None, description="ID магазина для фильтрации складов"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Получение списка складов из 1С
    """
    try:
        warehouses = await onec_service.get_warehouses(store_id)
        return {"warehouses": warehouses}
    
    except Exception as e:
        logger.exception(f"Error getting warehouses: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
