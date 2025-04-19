import { getAuthHeaders, isTokenExpired, logout } from './auth.js';
import { showError } from '../components/ui.js';

// Базовый URL API
const API_BASE_URL = window.App?.apiBaseUrl || '/miniapp/api/v1';

// Обертка для fetch с обработкой ошибок (авторизация отключена)
async function fetchWithAuth(url, options = {}) {
    try {
        // Не проверяем срок действия токена, авторизация отключена
        
        // Добавляем заголовки с тестовым токеном
        const headers = {
            ...options.headers,
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTUyOTk3NjEiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE5OTk5OTk5OTl9.HG7oZFS2UuFd1yzL_RwJI5jK5zMC92F4-Ru72r_D',
            'Content-Type': 'application/json'
        };
        
        // Выполняем запрос
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        // Проверяем статус ответа
        if (!response.ok) {
            // Для ошибок пытаемся получить информацию об ошибке из ответа
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.detail || `Ошибка ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        
        // Проверяем, есть ли данные в ответе
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        
        return await response.text();
    } catch (error) {
        console.error('API error:', error);
        showError(error.message || 'Произошла ошибка при обращении к API');
        return null;
    }
}

// Получение данных о продажах
export async function getSalesData(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Добавляем параметры в URL, если они указаны
    if (params.period) queryParams.append('period', params.period);
    if (params.store_id) queryParams.append('store_id', params.store_id);
    if (params.warehouse_id) queryParams.append('warehouse_id', params.warehouse_id);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    
    const url = `${API_BASE_URL}/sales/?${queryParams.toString()}`;
    return await fetchWithAuth(url);
}

// Получение списка магазинов
export async function getStores() {
    const url = `${API_BASE_URL}/sales/stores`;
    return await fetchWithAuth(url);
}

// Получение списка складов
export async function getWarehouses(storeId = null) {
    let url = `${API_BASE_URL}/sales/warehouses`;
    if (storeId) {
        url += `?store_id=${storeId}`;
    }
    return await fetchWithAuth(url);
}

// Получение уведомлений с фильтрацией
export async function getNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Настройки пагинации и фильтрации
    if (params.skip !== undefined) queryParams.append('skip', params.skip);
    if (params.limit !== undefined) queryParams.append('limit', params.limit);
    if (params.category) queryParams.append('category', params.category);
    if (params.is_read !== undefined) queryParams.append('is_read', params.is_read);
    
    const url = `${API_BASE_URL}/notifications/?${queryParams.toString()}`;
    return await fetchWithAuth(url);
}

// Пометка уведомления как прочитанного
export async function markNotificationAsRead(notificationId) {
    const url = `${API_BASE_URL}/notifications/mark-read/${notificationId}`;
    return await fetchWithAuth(url, { method: 'POST' });
}

// Пометка всех уведомлений как прочитанных
export async function markAllNotificationsAsRead(category = null) {
    let url = `${API_BASE_URL}/notifications/mark-all-read`;
    if (category) {
        url += `?category=${category}`;
    }
    return await fetchWithAuth(url, { method: 'POST' });
}

// Удаление уведомления
export async function deleteNotification(notificationId) {
    const url = `${API_BASE_URL}/notifications/${notificationId}`;
    return await fetchWithAuth(url, { method: 'DELETE' });
}

// Запуск процесса в 1С
export async function runProcess(processName, parameters = {}) {
    const url = `${API_BASE_URL}/processes/run`;
    return await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify({
            process_name: processName,
            parameters: parameters
        })
    });
}

// Обновление остатков на складе
export async function updateStock(warehouseId = null) {
    const url = `${API_BASE_URL}/processes/update-stock`;
    return await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify({
            warehouse_id: warehouseId
        })
    });
}

// Генерация отчета
export async function generateReport(reportType, period = 'today', storeId = null, warehouseId = null) {
    const url = `${API_BASE_URL}/processes/generate-report`;
    return await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify({
            report_type: reportType,
            period: period,
            store_id: storeId,
            warehouse_id: warehouseId
        })
    });
}
