// Функция для создания графика продаж
export function createSalesChart(containerId, data, options = {}) {
    // Подключаем Chart.js из CDN если его еще нет
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
        script.onload = () => renderChart(containerId, data, options);
        document.head.appendChild(script);
    } else {
        renderChart(containerId, data, options);
    }
}

// Функция для рендеринга графика
function renderChart(containerId, data, options) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем canvas для графика
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Получаем метки и значения из данных
    const labels = data.map(item => item.label || '');
    const values = data.map(item => item.value || 0);
    
    // Создаем объект графика
    const chartType = options.type || 'line';
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--tg-theme-text-color') || '#000'
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--tg-theme-hint-color') || '#666'
                }
            },
            y: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--tg-theme-hint-color') || '#666'
                },
                beginAtZero: true
            }
        }
    };
    
    // Объединяем с пользовательскими настройками
    const mergedOptions = { ...chartOptions, ...options.chartOptions };
    
    // Данные для графика
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: options.label || 'Продажи',
                data: values,
                borderColor: options.lineColor || getComputedStyle(document.documentElement).getPropertyValue('--tg-theme-button-color') || '#3390ec',
                backgroundColor: options.fillColor || 'rgba(51, 144, 236, 0.2)',
                borderWidth: 2,
                fill: options.fill !== undefined ? options.fill : false,
                tension: 0.4
            }
        ]
    };
    
    // Если есть дополнительные наборы данных
    if (options.additionalDatasets && Array.isArray(options.additionalDatasets)) {
        chartData.datasets = [...chartData.datasets, ...options.additionalDatasets];
    }
    
    // Создаем график
    const chart = new window.Chart(canvas, {
        type: chartType,
        data: chartData,
        options: mergedOptions
    });
    
    // Сохраняем ссылку на объект графика, чтобы можно было обновлять его
    container.chart = chart;
    
    return chart;
}

// Функция для обновления данных графика
export function updateSalesChart(containerId, newData, options = {}) {
    const container = document.getElementById(containerId);
    if (!container || !container.chart) return;
    
    const chart = container.chart;
    
    // Обновляем метки и данные
    chart.data.labels = newData.map(item => item.label || '');
    chart.data.datasets[0].data = newData.map(item => item.value || 0);
    
    // Обновляем название, если указано
    if (options.label) {
        chart.data.datasets[0].label = options.label;
    }
    
    // Обновляем цвета, если указаны
    if (options.lineColor) {
        chart.data.datasets[0].borderColor = options.lineColor;
    }
    
    if (options.fillColor) {
        chart.data.datasets[0].backgroundColor = options.fillColor;
    }
    
    // Применяем изменения
    chart.update();
}

// Функция для форматирования данных продаж для графика
export function formatSalesDataForChart(salesData, period = 'today') {
    if (!salesData || !salesData.chart_data || !Array.isArray(salesData.chart_data)) {
        // Если нет данных для графика, возвращаем пустой массив
        return [];
    }
    
    return salesData.chart_data.map(item => ({
        label: item.label || '',
        value: item.value || 0
    }));
}
