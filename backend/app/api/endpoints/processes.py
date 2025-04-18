from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import logging

from app.db.base import get_db
from app.services.auth import get_current_active_user, get_current_manager
from app.models.user import User, UserAction
from app.services.onec_service import onec_service
from app.schemas.sales import OneCProcessRequest, OneCProcessResponse

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/run", response_model=OneCProcessResponse)
async def run_process(
    process_request: OneCProcessRequest,
    current_user: User = Depends(get_current_manager),  # Только менеджеры и админы
    db: Session = Depends(get_db)
):
    """
    Запуск обработки в 1С
    """
    try:
        # Логируем действие пользователя
        log_action = UserAction(
            user_id=current_user.id,
            action_type="run_process",
            action_details=f"Запуск обработки: {process_request.process_name}"
        )
        db.add(log_action)
        db.commit()
        
        # Запускаем процесс в 1С
        result = await onec_service.run_process(process_request)
        
        return result
    
    except Exception as e:
        logger.exception(f"Error running 1C process: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/update-stock", response_model=OneCProcessResponse)
async def update_stock(
    warehouse_id: str = Body(None, embed=True),
    current_user: User = Depends(get_current_manager),  # Только менеджеры и админы
    db: Session = Depends(get_db)
):
    """
    Обновление остатков на складе
    """
    try:
        # Создаем запрос для 1С
        process_request = OneCProcessRequest(
            process_name="UpdateStock",
            parameters={"warehouseId": warehouse_id} if warehouse_id else {}
        )
        
        # Логируем действие пользователя
        log_action = UserAction(
            user_id=current_user.id,
            action_type="update_stock",
            action_details=f"Обновление остатков на складе: {warehouse_id if warehouse_id else 'все склады'}"
        )
        db.add(log_action)
        db.commit()
        
        # Запускаем процесс в 1С
        result = await onec_service.run_process(process_request)
        
        return result
    
    except Exception as e:
        logger.exception(f"Error updating stock: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/generate-report", response_model=OneCProcessResponse)
async def generate_report(
    report_type: str = Body(..., embed=True),
    period: str = Body("today", embed=True),
    store_id: str = Body(None, embed=True),
    warehouse_id: str = Body(None, embed=True),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Генерация отчета в 1С
    """
    try:
        # Создаем запрос для 1С
        process_request = OneCProcessRequest(
            process_name="GenerateReport",
            parameters={
                "reportType": report_type,
                "period": period,
                "storeId": store_id,
                "warehouseId": warehouse_id
            }
        )
        
        # Логируем действие пользователя
        log_action = UserAction(
            user_id=current_user.id,
            action_type="generate_report",
            action_details=f"Генерация отчета: {report_type}, период: {period}"
        )
        db.add(log_action)
        db.commit()
        
        # Запускаем процесс в 1С
        result = await onec_service.run_process(process_request)
        
        return result
    
    except Exception as e:
        logger.exception(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
