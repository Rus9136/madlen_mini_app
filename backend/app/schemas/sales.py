from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import date, datetime


class SalesFilter(BaseModel):
    period: str = "today"  # today, yesterday, week, month
    store_id: Optional[str] = None
    warehouse_id: Optional[str] = None
    category_id: Optional[str] = None


class SalesItem(BaseModel):
    product_id: str
    product_name: str
    quantity: float
    price: float
    total: float
    store_id: Optional[str] = None
    store_name: Optional[str] = None


class SalesSummary(BaseModel):
    period: str
    total_sales: float
    total_items: int
    avg_check: float
    comparison_prev_period: Optional[float] = None  # процент изменения по сравнению с прошлым периодом


class SalesResponse(BaseModel):
    summary: SalesSummary
    items: List[SalesItem]
    chart_data: Optional[List[Dict[str, Any]]] = None


class OneCProcessRequest(BaseModel):
    process_name: str
    parameters: Optional[Dict[str, Any]] = None


class OneCProcessResponse(BaseModel):
    success: bool
    message: str
    result: Optional[Dict[str, Any]] = None
    process_id: Optional[str] = None


class StoreInfo(BaseModel):
    id: str
    name: str
    address: Optional[str] = None


class WarehouseInfo(BaseModel):
    id: str
    name: str
    store_id: Optional[str] = None


class StoresResponse(BaseModel):
    stores: List[StoreInfo]


class WarehousesResponse(BaseModel):
    warehouses: List[WarehouseInfo]
