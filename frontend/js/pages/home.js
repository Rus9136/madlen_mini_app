import { renderContent, createElement, createButton, createCard } from '../components/ui.js';
import { hasRole } from '../services/auth.js';

// Рендеринг главной страницы
export function renderHomePage() {
    const container = createElement('div', {
        className: 'flex flex-col p-4'
    });
    
    // Заголовок страницы
    const header = createElement('div', {
        className: 'mb-6 text-center'
    }, [
        createElement('h1', {
            className: 'text-2xl font-bold mb-2'
        }, 'Корпоративное приложение'),
        createElement('p', {
            className: 'text-sm tg-hint'
        }, 'Информационная система для сотрудников компании')
    ]);
    
    container.appendChild(header);
    
    // Секция с кнопками быстрого доступа
    const quickActions = createElement('div', {
        className: 'grid grid-cols-2 gap-3 mb-6'
    });
    
    // Кнопка "Продажи"
    const salesButton = createButton('Продажи', () => {
        window.navigateTo('sales');
    }, 'w-full flex flex-col items-center justify-center p-5 h-28', 'fa-chart-line');
    
    // Кнопка "Уведомления"
    const notificationsButton = createButton('Уведомления', () => {
        window.navigateTo('notifications');
    }, 'w-full flex flex-col items-center justify-center p-5 h-28', 'fa-bell');
    
    quickActions.appendChild(createElement('div', {}, salesButton));
    quickActions.appendChild(createElement('div', {}, notificationsButton));
    
    // Если пользователь менеджер или админ, добавляем кнопку "Обработки"
    if (hasRole('manager')) {
        const processesButton = createButton('Обработки', () => {
            window.navigateTo('processes');
        }, 'w-full flex flex-col items-center justify-center p-5 h-28', 'fa-cogs');
        
        // Добавляем в новую строку
        const processesRow = createElement('div', {
            className: 'grid grid-cols-2 gap-3'
        });
        
        processesRow.appendChild(createElement('div', {}, processesButton));
        
        // Дополнительная пустая ячейка для баланса
        processesRow.appendChild(createElement('div', {}));
        
        container.appendChild(quickActions);
        container.appendChild(processesRow);
    } else {
        container.appendChild(quickActions);
    }
    
    // Информационная карточка
    const infoCard = createCard(
        'Информация',
        createElement('div', {}, [
            createElement('p', {
                className: 'mb-2'
            }, 'Добро пожаловать в корпоративное приложение для сотрудников компании.'),
            createElement('p', {}, 'Используйте меню выше для доступа к различным разделам системы.')
        ])
    );
    
    container.appendChild(infoCard);
    
    // Рендерим содержимое
    renderContent(container);
}
