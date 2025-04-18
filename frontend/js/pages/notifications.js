import { 
    renderContent, 
    createElement, 
    createSelect,
    createTabs,
    createCard,
    createIconButton,
    createButton,
    createEmptyState,
    createSpinner,
    showLoader,
    hideLoader,
    showNotification
} from '../components/ui.js';

import { 
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification
} from '../services/api.js';

// Состояние страницы уведомлений
const notificationsState = {
    activeTab: 'all',    // all, unread, price, stock, returns, plan
    notifications: [],
    total: 0,
    skip: 0,
    limit: 20,
    isLoading: false,
    hasMoreNotifications: false
};

// Рендеринг страницы уведомлений
export async function renderNotificationsPage() {
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
        }, 'Уведомления'),
        createElement('p', {
            className: 'text-sm tg-hint'
        }, 'Просмотр уведомлений от системы')
    ]);
    
    container.appendChild(header);
    
    // Вкладки для фильтрации уведомлений
    const tabs = [
        { id: 'all', label: 'Все' },
        { id: 'unread', label: 'Непрочитанные' },
        { id: 'price_change', label: 'Цены' },
        { id: 'stock', label: 'Остатки' },
        { id: 'returns', label: 'Возвраты' },
        { id: 'sales_plan', label: 'План продаж' }
    ];
    
    const tabsContainer = createTabs(tabs, notificationsState.activeTab, (tabId) => {
        notificationsState.activeTab = tabId;
        notificationsState.skip = 0;
        loadNotifications(true);
    });
    
    container.appendChild(tabsContainer);
    
    // Кнопка "Отметить все как прочитанные"
    const markAllAsReadButton = createButton(
        'Отметить все как прочитанные', 
        async () => {
            try {
                const category = notificationsState.activeTab !== 'all' && notificationsState.activeTab !== 'unread' 
                    ? notificationsState.activeTab 
                    : null;
                
                const result = await markAllNotificationsAsRead(category);
                
                if (result && result.success) {
                    showNotification(`Отмечено уведомлений: ${result.marked_count}`);
                    loadNotifications(true);
                }
            } catch (error) {
                console.error('Ошибка при отметке уведомлений:', error);
            }
        }, 
        'mb-4 text-sm py-1 px-3 rounded-lg'
    );
    
    container.appendChild(markAllAsReadButton);
    
    // Контейнер для списка уведомлений
    const notificationsContainer = createElement('div', {
        id: 'notificationsContainer',
        className: 'mb-4'
    }, createSpinner('lg'));
    
    container.appendChild(notificationsContainer);
    
    // Кнопка "Загрузить еще", которая появится, если есть еще уведомления
    const loadMoreContainer = createElement('div', {
        id: 'loadMoreContainer',
        className: 'text-center mb-4',
        style: 'display: none;'
    }, [
        createButton('Загрузить еще', () => {
            notificationsState.skip += notificationsState.limit;
            loadNotifications(false);
        }, 'text-sm py-2 px-4')
    ]);
    
    container.appendChild(loadMoreContainer);
    
    // Рендерим контент
    renderContent(container);
    
    // Загружаем уведомления
    await loadNotifications(true);
    
    hideLoader();
}

// Загрузка уведомлений
async function loadNotifications(reset = false) {
    const notificationsContainer = document.getElementById('notificationsContainer');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    if (!notificationsContainer) return;
    
    // Если это сброс (новый запрос), очищаем контейнер
    if (reset) {
        notificationsContainer.innerHTML = '';
        notificationsContainer.appendChild(createSpinner('lg'));
        notificationsState.notifications = [];
        notificationsState.skip = 0;
    }
    
    notificationsState.isLoading = true;
    
    try {
        // Определяем параметры запроса
        const params = {
            skip: notificationsState.skip,
            limit: notificationsState.limit
        };
        
        // Добавляем фильтр по категории, если выбрана конкретная категория
        if (notificationsState.activeTab !== 'all' && notificationsState.activeTab !== 'unread') {
            params.category = notificationsState.activeTab;
        }
        
        // Добавляем фильтр по статусу прочтения, если выбрана вкладка "Непрочитанные"
        if (notificationsState.activeTab === 'unread') {
            params.is_read = false;
        }
        
        // Загружаем уведомления
        const data = await getNotifications(params);
        
        if (data) {
            // Если это сброс, заменяем массив уведомлений
            if (reset) {
                notificationsState.notifications = data.notifications || [];
            } else {
                // Иначе добавляем новые уведомления к существующим
                notificationsState.notifications = [
                    ...notificationsState.notifications,
                    ...(data.notifications || [])
                ];
            }
            
            notificationsState.total = data.total || 0;
            
            // Определяем, есть ли еще уведомления для загрузки
            notificationsState.hasMoreNotifications = 
                notificationsState.notifications.length < notificationsState.total;
            
            // Обновляем UI
            updateNotificationsList(notificationsContainer);
            
            // Показываем или скрываем кнопку "Загрузить еще"
            if (loadMoreContainer) {
                loadMoreContainer.style.display = 
                    notificationsState.hasMoreNotifications ? 'block' : 'none';
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке уведомлений:', error);
        
        if (reset) {
            notificationsContainer.innerHTML = '';
            notificationsContainer.appendChild(
                createEmptyState('Ошибка при загрузке уведомлений', 'fa-exclamation-circle')
            );
        }
    } finally {
        notificationsState.isLoading = false;
        
        // Убираем спиннер, если он еще есть
        const spinner = notificationsContainer.querySelector('.loader');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Обновление списка уведомлений
function updateNotificationsList(container) {
    // Убираем спиннер загрузки
    container.innerHTML = '';
    
    // Если нет уведомлений, показываем соответствующее сообщение
    if (!notificationsState.notifications.length) {
        container.appendChild(
            createEmptyState('У вас нет уведомлений', 'fa-bell-slash')
        );
        return;
    }
    
    // Создаем и добавляем карточки для каждого уведомления
    notificationsState.notifications.forEach(notification => {
        const notificationCard = createNotificationCard(notification);
        container.appendChild(notificationCard);
    });
}

// Создание карточки уведомления
function createNotificationCard(notification) {
    // Определяем иконку в зависимости от категории
    const categoryIcons = {
        'price_change': 'fa-tag',
        'stock': 'fa-box',
        'returns': 'fa-undo',
        'sales_plan': 'fa-chart-line',
        'default': 'fa-bell'
    };
    
    const icon = categoryIcons[notification.category] || categoryIcons.default;
    
    // Определяем цвет в зависимости от статуса прочтения
    const cardClass = notification.is_read ? 'bg-gray-100' : 'tg-secondary-bg';
    
    // Создаем карточку
    const card = createElement('div', {
        className: `mb-3 p-3 rounded-lg ${cardClass}`
    });
    
    // Заголовок с иконкой и кнопками
    const header = createElement('div', {
        className: 'flex items-center justify-between mb-2'
    }, [
        createElement('div', {
            className: 'flex items-center'
        }, [
            createElement('i', {
                className: `fas ${icon} mr-2 tg-link`
            }),
            createElement('h3', {
                className: 'font-semibold'
            }, notification.title)
        ]),
        createElement('div', {
            className: 'flex'
        }, [
            // Кнопка "Отметить как прочитанное"
            !notification.is_read && createIconButton('fa-check', async () => {
                try {
                    await markNotificationAsRead(notification.id);
                    notification.is_read = true;
                    updateNotificationCard(card, notification);
                } catch (error) {
                    console.error('Ошибка при отметке уведомления:', error);
                }
            }, 'text-green-600 mr-2', 'Отметить как прочитанное'),
            
            // Кнопка удаления
            createIconButton('fa-trash', async () => {
                try {
                    const result = await deleteNotification(notification.id);
                    if (result && result.success) {
                        // Удаляем уведомление из списка
                        notificationsState.notifications = notificationsState.notifications.filter(
                            n => n.id !== notification.id
                        );
                        
                        // Удаляем карточку из DOM
                        card.remove();
                        
                        // Если список пуст, обновляем UI
                        const notificationsContainer = document.getElementById('notificationsContainer');
                        if (notificationsContainer && !notificationsState.notifications.length) {
                            updateNotificationsList(notificationsContainer);
                        }
                    }
                } catch (error) {
                    console.error('Ошибка при удалении уведомления:', error);
                }
            }, 'text-red-600', 'Удалить')
        ])
    ]);
    
    // Текст уведомления
    const content = createElement('div', {
        className: 'text-sm'
    }, notification.message);
    
    // Дата создания
    const date = new Date(notification.created_at);
    const footer = createElement('div', {
        className: 'text-xs tg-hint mt-2'
    }, date.toLocaleString());
    
    // Добавляем все элементы в карточку
    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(footer);
    
    return card;
}

// Обновление карточки уведомления
function updateNotificationCard(card, notification) {
    // Определяем цвет в зависимости от статуса прочтения
    const newCardClass = notification.is_read ? 'bg-gray-100' : 'tg-secondary-bg';
    
    // Обновляем класс карточки
    card.className = `mb-3 p-3 rounded-lg ${newCardClass}`;
    
    // Обновляем кнопки (удаляем кнопку "Отметить как прочитанное")
    const buttonContainer = card.querySelector('.flex:last-child');
    if (buttonContainer) {
        const readButton = buttonContainer.querySelector('[title="Отметить как прочитанное"]');
        if (readButton && notification.is_read) {
            readButton.remove();
        }
    }
}
