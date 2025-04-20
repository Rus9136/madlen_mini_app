// Скрипт для прямого рендеринга интерфейса без ожидания модулей
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting direct rendering');
    
    // Функция для создания полноценного интерфейса
    function renderDirectInterface() {
        console.log('Rendering direct interface');
        
        // Найдем элемент приложения
        const appElement = document.getElementById('app');
        if (!appElement) {
            console.error('App element not found!');
            return;
        }
        
        // Скрываем загрузчик
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Создаем основной контейнер
        const container = document.createElement('div');
        container.className = 'flex flex-col p-4';
        
        // Заголовок страницы
        const header = document.createElement('div');
        header.className = 'mb-6 text-center';
        header.innerHTML = `
            <h1 class="text-2xl font-bold mb-2">Корпоративное приложение</h1>
            <p class="text-sm tg-hint">Информационная система для сотрудников компании</p>
        `;
        
        // Секция с кнопками быстрого доступа
        const quickActions = document.createElement('div');
        quickActions.className = 'grid grid-cols-2 gap-3 mb-6';
        
        // Кнопка "Продажи"
        const salesButtonContainer = document.createElement('div');
        const salesButton = document.createElement('button');
        salesButton.className = 'tg-button w-full flex flex-col items-center justify-center p-5 h-28';
        salesButton.innerHTML = '<i class="fas fa-chart-line mb-2"></i>Продажи';
        salesButton.onclick = function() {
            alert('Функция продаж временно недоступна');
        };
        salesButtonContainer.appendChild(salesButton);
        
        // Кнопка "Уведомления"
        const notificationsButtonContainer = document.createElement('div');
        const notificationsButton = document.createElement('button');
        notificationsButton.className = 'tg-button w-full flex flex-col items-center justify-center p-5 h-28';
        notificationsButton.innerHTML = '<i class="fas fa-bell mb-2"></i>Уведомления';
        notificationsButton.onclick = function() {
            alert('Функция уведомлений временно недоступна');
        };
        notificationsButtonContainer.appendChild(notificationsButton);
        
        // Добавляем кнопки в контейнер
        quickActions.appendChild(salesButtonContainer);
        quickActions.appendChild(notificationsButtonContainer);
        
        // Создаем кнопку "Обработки"
        const processesRow = document.createElement('div');
        processesRow.className = 'grid grid-cols-2 gap-3';
        
        const processesButtonContainer = document.createElement('div');
        const processesButton = document.createElement('button');
        processesButton.className = 'tg-button w-full flex flex-col items-center justify-center p-5 h-28';
        processesButton.innerHTML = '<i class="fas fa-cogs mb-2"></i>Обработки';
        processesButton.onclick = function() {
            alert('Функция обработок временно недоступна');
        };
        processesButtonContainer.appendChild(processesButton);
        
        // Добавляем в строку
        processesRow.appendChild(processesButtonContainer);
        processesRow.appendChild(document.createElement('div')); // Пустая ячейка для баланса
        
        // Информационная карточка
        const infoCard = document.createElement('div');
        infoCard.className = 'p-3 mb-3 rounded-lg tg-secondary-bg';
        infoCard.innerHTML = `
            <h3 class="text-lg font-bold mb-2">Информация</h3>
            <div>
                <p class="mb-2">Добро пожаловать в корпоративное приложение для сотрудников компании.</p>
                <p>Используйте меню выше для доступа к различным разделам системы.</p>
            </div>
        `;
        
        // Собираем все компоненты
        container.appendChild(header);
        container.appendChild(quickActions);
        container.appendChild(processesRow);
        container.appendChild(infoCard);
        
        // Очищаем и добавляем в DOM
        appElement.innerHTML = '';
        appElement.appendChild(container);
        
        console.log('Direct interface rendered successfully');
    }
    
    // Проверим, не загрузился ли уже основной интерфейс
    const checkInterval = setInterval(function() {
        // Если загрузчик уже скрыт, и есть контент кроме загрузчика, значит интерфейс уже отрисован
        const loadingElement = document.getElementById('loading');
        const appElement = document.getElementById('app');
        
        if (loadingElement && loadingElement.style.display === 'none' && 
            appElement && appElement.children.length > 1) {
            console.log('Main interface already loaded, no need for direct rendering');
            clearInterval(checkInterval);
            return;
        }
        
        // Если прошло более 3 секунд, рендерим интерфейс напрямую
        console.log('Main interface not loaded after timeout, doing direct rendering');
        clearInterval(checkInterval);
        renderDirectInterface();
    }, 3000);
});
