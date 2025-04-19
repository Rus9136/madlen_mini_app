// Ключ для хранения токена в localStorage
const TOKEN_KEY = 'tg_mini_app_token';

// Получение токена из localStorage
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Сохранение токена в localStorage
export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

// Удаление токена из localStorage
export function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}

// Проверка наличия токена (аутентифицирован ли пользователь)
export function isAuthenticated() {
    return true; //#!!getToken();
}

// Получение заголовков с авторизацией для запросов к API
export function getAuthHeaders() {
    const token = getToken();
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Проверка срока действия токена
export function isTokenExpired() {
    const token = getToken();
    if (!token) return true;
    
    try {
        // JWT токен состоит из трех частей, разделенных точкой
        const payload = token.split('.')[1];
        
        // Декодируем payload из base64
        const decodedPayload = atob(payload);
        
        // Парсим JSON
        const data = JSON.parse(decodedPayload);
        
        // Проверяем время истечения срока действия (exp в секундах)
        const expTime = data.exp * 1000; // переводим в миллисекунды
        const currentTime = Date.now();
        
        return currentTime > expTime;
    } catch (e) {
        console.error('Ошибка при проверке токена:', e);
        return true; // В случае ошибки считаем токен истекшим
    }
}

// Выход из системы
export function logout() {
    removeToken();
    window.location.reload();
}

// Получение информации о пользователе из токена
export function getUserInfo() {
    const token = getToken();
    if (!token) return null;
    
    try {
        const payload = token.split('.')[1];
        const decodedPayload = atob(payload);
        const data = JSON.parse(decodedPayload);
        
        return {
            telegramId: data.sub,
            role: data.role
        };
    } catch (e) {
        console.error('Ошибка при получении информации о пользователе:', e);
        return null;
    }
}

// Проверка роли пользователя
export function hasRole(requiredRole) {
    const userInfo = getUserInfo();
    if (!userInfo) return false;
    
    if (requiredRole === 'admin') {
        return userInfo.role === 'admin';
    } else if (requiredRole === 'manager') {
        return userInfo.role === 'admin' || userInfo.role === 'manager';
    } else if (requiredRole === 'employee') {
        return true; // Все авторизованные пользователи - как минимум сотрудники
    }
    
    return false;
}
