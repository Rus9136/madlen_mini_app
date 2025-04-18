import { 
    renderContent, 
    createElement, 
    createButton,
    createCard,
    createSelect,
    createSpinner,
    showNotification,
    showError,
    showLoader,
    hideLoader
} from '../components/ui.js';

import { hasRole } from '../services/auth.js';
import { 
    runProcess, 
    updateStock, 
    generateReport, 
    getStores, 
    getWarehouses 
} from '../services/api.js';

// Состояние страницы обработок
const processesState = {
    stores: [],
    warehouses: [],
    selectedStoreId: null,
    selectedWarehouseId: null,
    selectedReportType: 'sales_report',
    selectedPeriod: 'today',
    isLoading: false
};

// Рендеринг страницы обработок
export async function renderProcessesPage() {
    // Проверяем, имеет ли пользователь права на доступ к этой странице
    if (!hasRole('manager')) {
        renderContent(createElement('div', {
            className: 'flex flex-col p-4'
        }, [
            createElement('h1', {
                className: 'text-xl font-bold mb-4'
            }, 'Доступ запрещен'),
            createElement('p', {}, 'У вас нет прав на доступ к этому разделу.')
        ]));
        return;
    }
    
    showLoader();
    
    const container = createElement('div', {
        className: 'flex flex-col p-4'
    });
    
    // Заголовок страницы
    const header = createElement('div', {
        className: 'mb-4'
    }, [
        createElement('h1', {
            className: 'text-xl font-bold'
        }, 'Обработки 1С'),
        createElement('p', {
            className: 'text-sm tg-hint'
        }, 'Запуск обработок и получение отчетов из 1С')
    ]);
    
    container.appendChild(header);
    
    // Карточка обновления остатков
    const updateStockCard = createCard(
        'Обновление остатков',
        createElement('div', {}, [
            createElement('p', {
                className: 'mb-3 text-sm'
            }, 'Запуск процесса обновления остатков на складах в базе 1С'),
            
            // Здесь добавим выбор склада, когда загрузим данные
            createElement('div', {
                id: 'warehouseSelectContainer',
                className: 'mb-3'
            }),
            
            // Кнопка запуска обработки
            createButton('Обновить остатки', async () => {
                await runUpdateStock();
            }, 'w-full')
        ])
    );
    
    container.appendChild(updateStockCard);
    
    // Карточка генерации отчетов
    const reportsCard = createCard(
        'Отчеты',
        createElement('div', {}, [
            createElement('p', {
                className: 'mb-3 text-sm'
            }, 'Формирование отчетов из базы 1С'),
            
            // Выбор типа отчета
            createElement('div', {
                className: 'mb-3'
            }, [
                createElement('label', {
                    className: 'block text-sm font-medium mb-1'
                }, 'Тип отчета:'),
                
                createSelect([
                    { value: 'sales_report', label: 'Отчет по продажам' },
                    { value: 'inventory_report', label: 'Отчет по остаткам' },
                    { value: 'returns_report', label: 'Отчет по возвратам' },
                    { value: 'financial_report', label: 'Финансовый отчет' }
                ], (value) => {
                    processesState.selectedReportType = value;
                }, processesState.selectedReportType)
            ]),
            
            // Выбор периода
            createElement('div', {
                className: 'mb-3'
            }, [
                createElement('label', {
                    className: 'block text-sm font-medium mb-1'
                }, 'Период:'),
                
                createSelect([
                    { value: 'today', label: 'Сегодня' },
                    { value: 'yesterday', label: 'Вчера' },
                    { value: 'week', label: 'Неделя' },
                    { value: 'month', label: 'Месяц' }
                ], (value) => {
                    processesState.selectedPeriod = value;
                }, processesState.selectedPeriod)
            ]),
            
            // Здесь добавим выбор магазина, когда загрузим данные
            createElement('div', {
                id: 'storeSelectContainer',
                className: 'mb-3'
            }),
            
            // Кнопка генерации отчета
            createButton('Сформировать отчет', async () => {
                await runGenerateReport();
            }, 'w-full')
        ])
    );
    
    container.appendChild(reportsCard);
    
    // Карточка "Другие обработки"
    const otherProcessesCard = createCard(
        'Другие обработки',
        createElement('div', {
            className: 'grid grid-cols-1 gap-3'
        }, [
            createButton('Выгрузить прайс-лист', async () => {
                await runCustomProcess('ExportPriceList');
            }, '', 'fa-file-export'),
            
            createButton('Загрузить данные контрагентов', async () => {
                await runCustomProcess('ImportCustomers');
            }, '', 'fa-users'),
            
            createButton('Переоценка товаров', async () => {
                await runCustomProcess('RevaluateProducts');
            }, '', 'fa-tags')
        ])
    );
    
    container.appendChild(otherProcessesCard);
    
    // Рендерим контент
    renderContent(container);
    
    // Загружаем данные для селектов
    await loadSelectData();
    
    hideLoader();
}

// Загрузка данных для селектов
async function loadSelectData() {
    try {
        // Загружаем список магазинов
        const storesData = await getStores();
        if (storesData && storesData.stores) {
            processesState.stores = storesData.stores;
            
            // Находим контейнер для селекта магазинов
            const storeSelectContainer = document.getElementById('storeSelectContainer');
            if (storeSelectContainer) {
                storeSelectContainer.innerHTML = '';
                storeSelectContainer.appendChild(
                    createElement('label', {
                        className: 'block text-sm font-medium mb-1'
                    }, 'Магазин:')
                );
                
                // Создаем селект магазинов
                const storeOptions = [
                    { value: '', label: 'Все магазины' },
                    ...processesState.stores.map(store => ({
                        value: store.id,
                        label: store.name
                    }))
                ];
                
                const storeSelect = createSelect(storeOptions, async (value) => {
                    processesState.selectedStoreId = value || null;
                    // При смене магазина обновляем список складов
                    await loadWarehouses();
                }, processesState.selectedStoreId || '');
                
                storeSelectContainer.appendChild(storeSelect);
            }
        }
        
        // Загружаем список складов
        await loadWarehouses();
        
    } catch (error) {
        console.error('Ошибка при загрузке данных для селектов:', error);
        showError('Не удалось загрузить данные для фильтров');
    }
}

// Загрузка списка складов
async function loadWarehouses() {
    try {
        const warehousesData = await getWarehouses(processesState.selectedStoreId);
        if (warehousesData && warehousesData.warehouses) {
            processesState.warehouses = warehousesData.warehouses;
            
            // Находим контейнер для селекта складов
            const warehouseSelectContainer = document.getElementById('warehouseSelectContainer');
            if (warehouseSelectContainer) {
                warehouseSelectContainer.innerHTML = '';
                warehouseSelectContainer.appendChild(
                    createElement('label', {
                        className: 'block text-sm font-medium mb-1'
                    }, 'Склад:')
                );
                
                // Создаем селект складов
                const warehouseOptions = [
                    { value: '', label: 'Все склады' },
                    ...processesState.warehouses.map(warehouse => ({
                        value: warehouse.id,
                        label: warehouse.name
                    }))
                ];
                
                const warehouseSelect = createSelect(warehouseOptions, (value) => {
                    processesState.selectedWarehouseId = value || null;
                }, processesState.selectedWarehouseId || '');
                
                warehouseSelectContainer.appendChild(warehouseSelect);
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке списка складов:', error);
    }
}

// Запуск обработки обновления остатков
async function runUpdateStock() {
    if (processesState.isLoading) return;
    
    try {
        processesState.isLoading = true;
        showNotification('Запуск обработки...');
        
        const result = await updateStock(processesState.selectedWarehouseId);
        
        if (result && result.success) {
            showNotification(result.message || 'Обновление остатков выполнено успешно');
        } else {
            throw new Error(result?.message || 'Ошибка при обновлении остатков');
        }
    } catch (error) {
        console.error('Ошибка при обновлении остатков:', error);
        showError(error.message || 'Ошибка при обновлении остатков');
    } finally {
        processesState.isLoading = false;
    }
}

// Запуск обработки генерации отчета
async function runGenerateReport() {
    if (processesState.isLoading) return;
    
    try {
        processesState.isLoading = true;
        showNotification('Формирование отчета...');
        
        const result = await generateReport(
            processesState.selectedReportType,
            processesState.selectedPeriod,
            processesState.selectedStoreId,
            processesState.selectedWarehouseId
        );
        
        if (result && result.success) {
            showNotification(result.message || 'Отчет сформирован успешно');
            
            // Если в результате есть URL для скачивания отчета
            if (result.result && result.result.download_url) {
                // Открываем ссылку для скачивания
                window.open(result.result.download_url, '_blank');
            }
        } else {
            throw new Error(result?.message || 'Ошибка при формировании отчета');
        }
    } catch (error) {
        console.error('Ошибка при формировании отчета:', error);
        showError(error.message || 'Ошибка при формировании отчета');
    } finally {
        processesState.isLoading = false;
    }
}

// Запуск произвольной обработки
async function runCustomProcess(processName) {
    if (processesState.isLoading) return;
    
    try {
        processesState.isLoading = true;
        showNotification(`Запуск обработки "${processName}"...`);
        
        const result = await runProcess(processName, {
            storeId: processesState.selectedStoreId,
            warehouseId: processesState.selectedWarehouseId
        });
        
        if (result && result.success) {
            showNotification(result.message || 'Обработка выполнена успешно');
        } else {
            throw new Error(result?.message || 'Ошибка при выполнении обработки');
        }
    } catch (error) {
        console.error(`Ошибка при запуске обработки ${processName}:`, error);
        showError(error.message || 'Ошибка при выполнении обработки');
    } finally {
        processesState.isLoading = false;
    }
}
