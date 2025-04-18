import sys
import os
import asyncio
import json

# Добавляем родительскую директорию в путь
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.onec_service import onec_service
from app.schemas.sales import SalesFilter, OneCProcessRequest

async def test_sales_data():
    """
    Тестирование получения данных о продажах из 1С
    """
    print("Тестирование получения данных о продажах...")
    
    # Создаем фильтр
    filter_params = SalesFilter(
        period="today",
        store_id=None,
        warehouse_id=None
    )
    
    try:
        # Запрашиваем данные
        result = await onec_service.get_sales_data(filter_params)
        print(f"Результат запроса данных о продажах: {json.dumps(result, indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"Ошибка при запросе данных о продажах: {e}")

async def test_run_process():
    """
    Тестирование запуска обработки в 1С
    """
    print("\nТестирование запуска обработки...")
    
    # Создаем запрос
    process_request = OneCProcessRequest(
        process_name="UpdateStock",
        parameters={"warehouseId": None}
    )
    
    try:
        # Запускаем процесс
        result = await onec_service.run_process(process_request)
        print(f"Результат запуска обработки: {json.dumps(result, indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"Ошибка при запуске обработки: {e}")

async def main():
    print("Тестирование интеграции с 1С...\n")
    
    # Проверяем конфигурацию 1С
    print(f"API URL: {onec_service.api_url}")
    print(f"FTP Host: {onec_service.ftp_host}\n")
    
    # Запускаем тесты
    await test_sales_data()
    await test_run_process()
    
    print("\nТестирование завершено!")

if __name__ == "__main__":
    asyncio.run(main())
