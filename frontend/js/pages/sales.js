import { 
    renderContent, 
    createElement, 
    createSelect, 
    createCard,
    createTable,
    createSpinner,
    createInfoMessage,
    createEmptyState,
    showLoader,
    hideLoader
} from '../components/ui.js';

import { getSalesData, getStores, getWarehouses } from '../services/api.js';
import { createSalesChart, formatSalesDataForChart } from '../components/salesChart.js';

// Состояние страницы продаж
const salesState = {
    period: 'today',
    storeId: null,
    warehouseId: null,
    salesData: null,
    stores: [],
    warehouses: [],
    isLoading: false
};

// Рендеринг страницы продаж
export async function renderSalesPage() {
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
        }, 'Данные о продажах'),
        createElement('p', {
            className: 'text-sm tg-hint'
        }, 'Просмотр статистики и отчетов о продажах')
    ]);
    
    container.appendChild(header);
    
    // Фильтры
    const filters = createElement('div', {
        className: 'mb-4 p-3 rounded-lg tg-secondary-bg'
    });
    
    // Селект для периода
    const periodOptions = [
        { value: 'today', label: 'Сегодня' },
        { value: 'yesterday', label: 'Вчера' },
        { value: 'week', label: 'Неделя' },
        { value: 'month', label: 'Месяц' }
    ];
    
    const periodSelect = createSelect(periodOptions, (value) => {
        salesState.period = value;
        loadSalesData();
    }, salesState.period, 'mb-2');
    
    filters.appendChild(createElement('div', { className: 'mb-2' }, [
        createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Период:'),
        periodSelect
    ]));
    
    // Загружаем список магазинов
    try {
        const storesData = await getStores();
        if (storesData && storesData.stores) {
            salesState.stores = storesData.stores;
            
            // Селект для магазинов
            const storeOptions = [
                { value: '', label: 'Все магазины' },
                ...salesState.stores.map(store => ({
                    value: store.id,
                    label: store.name
                }))
            ];
            
            const storeSelect = createSelect(storeOptions, async (value) => {
                salesState.storeId = value || null;
                // При смене магазина, сбрасываем выбранный склад
                salesState.warehouseId = null;
                // Обновляем список складов
                await loadWarehouses();
                // Обновляем данные продаж
                loadSalesData();
            }, salesState.storeId || '', 'mb-2');
            
            filters.appendChild(createElement('div', { className: 'mb-2' }, [
                createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Магазин:'),
                storeSelect
            ]));
        }
        
        // Загружаем список складов
        await loadWarehouses();
        
        // Добавляем селект для складов
        const warehouseOptions = [
            { value: '', label: 'Все склады' },
            ...salesState.warehouses.map(warehouse => ({
                value: warehouse.id,
                label: warehouse.name
            }))
        ];
        
        const warehouseSelect = createSelect(warehouseOptions, (value) => {
            salesState.warehouseId = value || null;
            loadSalesData();
        }, salesState.warehouseId || '', 'mb-2');
        
        filters.appendChild(createElement('div', { className: 'mb-2' }, [
            createElement('label', { className: 'block text-sm font-medium mb-1' }, 'Склад:'),
            warehouseSelect
        ]));
    } catch (error) {
        console.error('Ошибка при загрузке фильтров:', error);
    }
    
    container.appendChild(filters);
    
    // Контейнер для данных о продажах
    const salesDataContainer = createElement('div', {
        id: 'salesDataContainer',
        className: 'mb-4'
    }, createSpinner('lg'));
    
    container.appendChild(salesDataContainer);
    
    // Контейнер для графика
    const chartContainer = createElement('div', {
        className: 'mb-4'
    }, [
        createElement('h2', { className: 'text-lg font-bold mb-2' }, 'График продаж'),
        createElement('div', {
            id: 'salesChart',
            className: 'w-full h-64 bg-white rounded-lg p-2'
        })
    ]);
    
    container.appendChild(chartContainer);
    
    // Контейнер для таблицы с товарами
    const salesItemsContainer = createElement('div', {
        id: 'salesItemsContainer',
        className: 'mb-4'
    });
    
    container.appendChild(salesItemsContainer);
    
    // Рендерим контент
    renderContent(container);
    
    // Загружаем данные о продажах
    await loadSalesData();
    
    hideLoader();
}

// Загрузка списка складов
async function loadWarehouses() {
    try {
        const warehousesData = await getWarehouses(salesState.storeId);
        if (warehousesData && warehousesData.warehouses) {
            salesState.warehouses = warehousesData.warehouses;
            
            // Обновляем селект складов, если он уже есть на странице
            const warehouseSelectContainer = document.querySelector('label:contains("Склад:")');
            if (warehouseSelectContainer) {
                const warehouseOptions = [
                    { value: '', label: 'Все склады' },
                    ...salesState.warehouses.map(warehouse => ({
                        value: warehouse.id,
                        label: warehouse.name
                    }))
                ];
                
                const warehouseSelect = createSelect(warehouseOptions, (value) => {
                    salesState.warehouseId = value || null;
                    loadSalesData();
                }, salesState.warehouseId || '', 'mb-2');
                
                // Заменяем старый селект на новый
                const oldSelect = warehouseSelectContainer.querySelector('select');
                if (oldSelect) {
                    oldSelect.parentNode.replaceChild(warehouseSelect, oldSelect);
                }
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке складов:', error);
    }
}

// Загрузка данных о продажах
async function loadSalesData() {
    const salesDataContainer = document.getElementById('salesDataContainer');
    const salesItemsContainer = document.getElementById('salesItemsContainer');
    
    if (!salesDataContainer || !salesItemsContainer) return;
    
    // Показываем индикатор загрузки
    salesState.isLoading = true;
    salesDataContainer.innerHTML = '';
    salesDataContainer.appendChild(createSpinner('lg'));
    salesItemsContainer.innerHTML = '';
    
    try {
        // Загружаем данные о продажах с учетом фильтров
        const data = await getSalesData({
            period: salesState.period,
            store_id: salesState.storeId,
            warehouse_id: salesState.warehouseId
        });
        
        salesState.salesData = data;
        
        // Обновляем контейнер с данными о продажах
        updateSalesSummary(salesDataContainer, data);
        
        // Обновляем график
        updateSalesChart(data);
        
        // Обновляем таблицу с товарами
        updateSalesItemsTable(salesItemsContainer, data);
    } catch (error) {
        console.error('Ошибка при загрузке данных о продажах:', error);
        salesDataContainer.innerHTML = '';
        salesDataContainer.appendChild(
            createInfoMessage('Ошибка при загрузке данных о продажах. Пожалуйста, попробуйте позже.', 'error')
        );
    } finally {
        salesState.isLoading = false;
    }
}

// Обновление сводки по продажам
function updateSalesSummary(container, data) {
    container.innerHTML = '';
    
    if (!data || !data.summary) {
        container.appendChild(createEmptyState('Нет данных о продажах за выбранный период', 'fa-chart-bar'));
        return;
    }
    
    const summary = data.summary;
    
    // Форматируем периоды для отображения
    const periodLabels = {
        'today': 'сегодня',
        'yesterday': 'вчера',
        'week': 'за неделю',
        'month': 'за месяц'
    };
    
    const periodText = periodLabels[summary.period] || summary.period;
    
    // Создаем карточку с информацией о продажах
    const summaryCard = createElement('div', {
        className: 'p-4 rounded-lg tg-secondary-bg'
    }, [
        createElement('h2', {
            className: 'text-lg font-bold mb-2'
        }, `Итоги продаж ${periodText}`),
        createElement('div', {
            className: 'grid grid-cols-2 gap-4'
        }, [
            createElement('div', {
                className: 'p-3 bg-white rounded-lg'
            }, [
                createElement('div', {
                    className: 'text-sm tg-hint'
                }, 'Общая сумма'),
                createElement('div', {
                    className: 'text-xl font-bold'
                }, `${summary.total_sales.toLocaleString()} ₽`)
            ]),
            createElement('div', {
                className: 'p-3 bg-white rounded-lg'
            }, [
                createElement('div', {
                    className: 'text-sm tg-hint'
                }, 'Количество товаров'),
                createElement('div', {
                    className: 'text-xl font-bold'
                }, summary.total_items.toLocaleString())
            ]),
            createElement('div', {
                className: 'p-3 bg-white rounded-lg'
            }, [
                createElement('div', {
                    className: 'text-sm tg-hint'
                }, 'Средний чек'),
                createElement('div', {
                    className: 'text-xl font-bold'
                }, `${summary.avg_check.toLocaleString()} ₽`)
            ]),
            createElement('div', {
                className: 'p-3 bg-white rounded-lg'
            }, [
                createElement('div', {
                    className: 'text-sm tg-hint'
                }, 'Изменение'),
                createElement('div', {
                    className: `text-xl font-bold ${summary.comparison_prev_period > 0 ? 'text-green-600' : summary.comparison_prev_period < 0 ? 'text-red-600' : ''}`
                }, summary.comparison_prev_period !== null ? `${summary.comparison_prev_period > 0 ? '+' : ''}${summary.comparison_prev_period}%` : 'Н/Д')
            ])
        ])
    ]);
    
    container.appendChild(summaryCard);
}

// Обновление графика продаж
function updateSalesChart(data) {
    const chartContainer = document.getElementById('salesChart');
    if (!chartContainer) return;
    
    if (!data || !data.chart_data || data.chart_data.length === 0) {
        chartContainer.innerHTML = '';
        chartContainer.appendChild(createEmptyState('Нет данных для построения графика', 'fa-chart-line'));
        return;
    }
    
    // Форматируем данные для графика
    const chartData = formatSalesDataForChart(data, salesState.period);
    
    // Создаем или обновляем график
    createSalesChart('salesChart', chartData, {
        label: 'Продажи',
        type: 'line',
        fill: true
    });
}

// Обновление таблицы с товарами
function updateSalesItemsTable(container, data) {
    container.innerHTML = '';
    
    if (!data || !data.items || data.items.length === 0) {
        container.appendChild(createEmptyState('Нет данных о проданных товарах', 'fa-box-open'));
        return;
    }
    
    // Создаем заголовок
    const header = createElement('h2', {
        className: 'text-lg font-bold mb-2'
    }, 'Проданные товары');
    
    container.appendChild(header);
    
    // Формируем данные для таблицы
    const headers = ['Товар', 'Количество', 'Цена', 'Сумма'];
    const rows = data.items.map(item => [
        item.product_name,
        item.quantity.toLocaleString(),
        `${item.price.toLocaleString()} ₽`,
        `${item.total.toLocaleString()} ₽`
    ]);
    
    // Создаем таблицу
    const table = createTable(headers, rows, 'tg-secondary-bg p-3 rounded-lg');
    
    container.appendChild(table);
}
