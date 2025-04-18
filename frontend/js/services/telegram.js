// Импортируем мок для локальной разработки
import './telegram_mock.js';

// Инициализация Telegram WebApp
export function initTelegramApp() {
    // Инициализируем мок для локальной разработки
    if (typeof setupTelegramMock === 'function') {
        setupTelegramMock();
    }
    
    // Получаем экземпляр WebApp из глобальной переменной
    const tg = window.Telegram?.WebApp;
    
    if (!tg) {
        console.error('Telegram WebApp не обнаружен. Переходим в тестовый режим.');
        
        // Возвращаем заглушку для тестирования
        return {
            expand: () => console.log('mock: expand'),
            setHeaderColor: () => console.log('mock: setHeaderColor'),
            disableSwipeToClose: () => console.log('mock: disableSwipeToClose'),
            ready: () => console.log('mock: ready'),
            BackButton: {
                show: () => console.log('mock: BackButton.show'),
                hide: () => console.log('mock: BackButton.hide'),
                onClick: (callback) => {
                    console.log('mock: BackButton.onClick');
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape') callback();
                    });
                },
                offClick: () => console.log('mock: BackButton.offClick')
            },
            MainButton: {
                show: () => console.log('mock: MainButton.show'),
                hide: () => console.log('mock: MainButton.hide'),
                setText: () => console.log('mock: MainButton.setText'),
                setBackgroundColor: () => console.log('mock: MainButton.setBackgroundColor'),
                setTextColor: () => console.log('mock: MainButton.setTextColor'),
                onClick: () => console.log('mock: MainButton.onClick'),
                offClick: () => console.log('mock: MainButton.offClick'),
                showProgress: () => console.log('mock: MainButton.showProgress'),
                hideProgress: () => console.log('mock: MainButton.hideProgress')
            },
            initData: 'mock_init_data&id=555299761&first_name=Rus&last_name=Daurenov&username=rususer&language=ru'
        };
    }
    
    try {
        // Включаем расширение интерфейса приложения
        tg.expand();
        
        // Устанавливаем цвет шапки для iOS устройств
        tg.setHeaderColor('secondary_bg_color');
        
        // Отключаем свайп назад на iOS, чтобы управлять навигацией через кнопку "Назад" в Telegram
        tg.disableSwipeToClose();
        
        // Уведомляем Telegram, что приложение готово к работе (уберет прелоадер)
        tg.ready();
    } catch (e) {
        console.warn('Ошибка при инициализации Telegram WebApp:', e);
    }
    
    return tg;
}

// Получение цветов темы из Telegram WebApp
export function getThemeColors() {
    // Если Telegram WebApp не инициализирован, возвращаем значения по умолчанию
    if (!window.App || !window.App.tg) {
        return {
            bg_color: '#ffffff',
            text_color: '#222222',
            hint_color: '#999999',
            link_color: '#3390ec',
            button_color: '#3390ec',
            button_text_color: '#ffffff',
            secondary_bg_color: '#f0f0f0'
        };
    }
    
    return window.App.tg.themeParams;
}

// Отображение всплывающего сообщения в Telegram
export function showTelegramAlert(message) {
    if (window.App && window.App.tg) {
        window.App.tg.showAlert(message);
    } else {
        alert(message);
    }
}

// Отображение модального диалога подтверждения в Telegram
export function showTelegramConfirm(message, callback) {
    if (window.App && window.App.tg) {
        window.App.tg.showConfirm(message, callback);
    } else {
        const result = confirm(message);
        callback(result);
    }
}

// Отображение всплывающего уведомления в Telegram (для поддерживаемых платформ)
export function showTelegramPopup(message, duration = 3000) {
    if (window.App && window.App.tg && window.App.tg.showPopup) {
        window.App.tg.showPopup({
            message,
            duration
        });
    } else {
        // Создаем временное уведомление, если нативный метод не поддерживается
        const popup = document.createElement('div');
        popup.className = 'fixed top-4 left-0 right-0 mx-auto p-3 rounded-lg shadow-lg text-center max-w-xs z-50 tg-secondary-bg';
        popup.textContent = message;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => {
                popup.remove();
            }, 300);
        }, duration);
    }
}

// Настройка основной кнопки в интерфейсе Telegram
export function setupMainButton(text, color, textColor, onClick) {
    if (!window.App || !window.App.mainButton) return;
    
    const mainButton = window.App.mainButton;
    
    // Очищаем предыдущие обработчики
    mainButton.offClick();
    
    // Устанавливаем новые параметры
    mainButton.setText(text);
    
    if (color) {
        mainButton.setBackgroundColor(color);
    }
    
    if (textColor) {
        mainButton.setTextColor(textColor);
    }
    
    // Устанавливаем новый обработчик
    mainButton.onClick(onClick);
    
    // Показываем кнопку
    mainButton.show();
}

// Скрытие основной кнопки
export function hideMainButton() {
    if (window.App && window.App.mainButton) {
        window.App.mainButton.hide();
    }
}

// Переключение загрузчика на основной кнопке
export function toggleMainButtonLoader(isLoading) {
    if (!window.App || !window.App.mainButton) return;
    
    if (isLoading) {
        window.App.mainButton.showProgress();
    } else {
        window.App.mainButton.hideProgress();
    }
}

// Закрытие мини-приложения
export function closeApp() {
    if (window.App && window.App.tg) {
        window.App.tg.close();
    }
}
