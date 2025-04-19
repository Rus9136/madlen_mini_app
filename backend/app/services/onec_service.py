import requests
from loguru import logger
from app.core.config import settings

class OneCService:
    def __init__(self):
        self.base_url = settings.ONEC_API_URL
        self.username = settings.ONEC_API_USER
        self.password = settings.ONEC_API_PASSWORD
        self.auth = (self.username, self.password)
        
    async def get_sales_data(self, period="today", store_id=None, warehouse_id=None, category_id=None):
        """
        Получение данных о продажах из 1С
        """
        logger.info(f"Запрос данных о продажах: период={period}, магазин={store_id}, склад={warehouse_id}")
        try:
            # В демонстрационных целях возвращаем тестовые данные
            return {
                "sales": [
                    {"date": "2025-04-18", "amount": 15000, "items_count": 45},
                    {"date": "2025-04-17", "amount": 12500, "items_count": 38},
                    {"date": "2025-04-16", "amount": 18200, "items_count": 52}
                ],
                "total": {
                    "amount": 45700,
                    "items_count": 135
                }
            }
        except Exception as e:
            logger.error(f"Ошибка получения данных о продажах: {str(e)}")
            return {"error": str(e)}
            
    async def get_stores(self):
        """
        Получение списка магазинов из 1С
        """
        logger.info("Запрос списка магазинов")
        try:
            # В демонстрационных целях возвращаем тестовые данные
            return [
                {"id": "1", "name": "Магазин на Невском"},
                {"id": "2", "name": "Магазин в ТЦ Галерея"},
                {"id": "3", "name": "Магазин на Московском"}
            ]
        except Exception as e:
            logger.error(f"Ошибка получения списка магазинов: {str(e)}")
            return {"error": str(e)}
            
    async def get_warehouses(self, store_id=None):
        """
        Получение списка складов из 1С
        """
        logger.info(f"Запрос списка складов для магазина {store_id}")
        try:
            # В демонстрационных целях возвращаем тестовые данные
            warehouses = [
                {"id": "1", "name": "Основной склад", "store_id": "1"},
                {"id": "2", "name": "Запасной склад", "store_id": "1"},
                {"id": "3", "name": "Основной склад", "store_id": "2"},
                {"id": "4", "name": "Основной склад", "store_id": "3"}
            ]
            
            if store_id:
                warehouses = [w for w in warehouses if w["store_id"] == store_id]
                
            return warehouses
        except Exception as e:
            logger.error(f"Ошибка получения списка складов: {str(e)}")
            return {"error": str(e)}
            
    async def update_stock(self, warehouse_id=None):
        """
        Обновление данных остатков в 1С
        """
        logger.info(f"Запрос на обновление остатков для склада {warehouse_id}")
        try:
            # В демонстрационных целях просто возвращаем успешный результат
            return {"status": "success", "message": "Остатки успешно обновлены"}
        except Exception as e:
            logger.error(f"Ошибка обновления остатков: {str(e)}")
            return {"error": str(e)}
            
    async def generate_report(self, report_type, period="today", store_id=None, warehouse_id=None):
        """
        Генерация отчета в 1С
        """
        logger.info(f"Запрос на генерацию отчета {report_type}")
        try:
            # В демонстрационных целях просто возвращаем успешный результат
            return {
                "status": "success", 
                "message": f"Отчет {report_type} успешно сгенерирован",
                "report_url": f"/reports/{report_type}_{period}.xlsx"
            }
        except Exception as e:
            logger.error(f"Ошибка генерации отчета: {str(e)}")
            return {"error": str(e)}

# Singleton instance
onec_service = OneCService()