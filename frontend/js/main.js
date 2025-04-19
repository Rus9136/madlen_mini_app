import { initTelegramApp } from './services/telegram.js';
import { getToken, setToken, isAuthenticated } from './services/auth.js';
import { renderHomePage } from './pages/home.js';
import { renderSalesPage } from './pages/sales.js';
import { renderNotificationsPage } from './pages/notifications.js';
import { renderProcessesPage } from './pages/processes.js';
import { showError, hideLoader, showLoader } from './components/ui.js';

// Глобальный объект приложения
window.App = {
    currentPage: null,
    tg: null,
    backButton: null,
    mainButton: null,
    user: null,
    // Устанавливаем путь к API
    // Используем относительный URL для API, чтобы он работал через nginx
    apiBaseUrl: '/api/v1',
    routes: {
        'home': renderHomePage,
        'sales': renderSalesPage,
        'notifications': renderNotificationsPage,
        'processes': renderProcessesPage
    }
};

// Инициализация приложения
async function initApp() {
    try {
        // Инициализируем Telegram WebApp
        const tg = initTelegramApp();
        window.App.tg = tg;
        window.App.backButton = tg.BackButton;
        window.App.mainButton = tg.MainButton;
        
        // Пропускаем авторизацию, чтобы приложение было доступно для всех
        // Устанавливаем тестовый токен для всех
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTUyOTk3NjEiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE5OTk5OTk5OTl9.HG7oZFS2UuFd1yzL_RwJI5jK5zMC92F4-Ru72r_D';
        setToken(testToken);
        
        // Настраиваем маршрутизацию
        setupRouting();
        
        // Рендерим главную страницу по умолчанию
        navigateTo('home');
        
        // Скрываем загрузчик
        hideLoader();
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        showError('Ошибка инициализации приложения. Пожалуйста, перезапустите.');
    }
}

// Настройка маршрутизации
function setupRouting() {
    // Обработка клика по внутренним ссылкам
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a[data-route]');
        if (target) {
            e.preventDefault();
            const route = target.getAttribute('data-route');
            navigateTo(route);
        }
    });
    
    // Обработка кнопки "Назад" в Telegram
    window.App.backButton.onClick(() => {
        if (window.App.currentPage !== 'home') {
            navigateTo('home');
        }
    });
}

// Навигация по маршрутам
function navigateTo(route, params = {}) {
    // Проверяем, существует ли маршрут
    if (!window.App.routes[route]) {
        console.error(`Маршрут ${route} не найден`);
        return;
    }
    
    // Обновляем текущую страницу
    window.App.currentPage = route;
    
    // Управляем видимостью кнопки "Назад"
    if (route === 'home') {
        window.App.backButton.hide();
    } else {
        window.App.backButton.show();
    }
    
    // Очищаем MainButton
    window.App.mainButton.hide();
    window.App.mainButton.setText('');
    window.App.mainButton.offClick();
    
    // Рендерим страницу
    window.App.routes[route](params);
}

// Экспортируем функцию навигации, чтобы она была доступна из других модулей
window.navigateTo = navigateTo;

// Запускаем приложение после загрузки DOM
document.addEventListener('DOMContentLoaded', initApp);
