// Скрипт-заглушка, который создаст базовый интерфейс
document.addEventListener('DOMContentLoaded', function() {
    console.log('Creating stub interface');
    
    // Проверка существования элемента app
    const appElement = document.getElementById('app');
    if (!appElement) {
        console.error('App element not found!');
        return;
    }
    
    // Функция для создания базового интерфейса
    function createStubInterface() {
        const mainInterface = document.createElement('div');
        mainInterface.className = 'flex flex-col p-4';
        
        // Заголовок
        const header = document.createElement('div');
        header.className = 'mb-6 text-center';
        header.innerHTML = `
            <h1 class="text-2xl font-bold mb-2">Корпоративное приложение</h1>
            <p class="text-sm tg-hint">Информационная система для сотрудников компании</p>
        `;
        
        // Кнопки быстрого доступа
        const actions = document.createElement('div');
        actions.className = 'grid grid-cols-2 gap-3 mb-6';
        actions.innerHTML = `
            <div>
                <button class="tg-button w-full flex flex-col items-center justify-center p-5 h-28">
                    <i class="fas fa-chart-line mb-2"></i>
                    Продажи
                </button>
            </div>
            <div>
                <button class="tg-button w-full flex flex-col items-center justify-center p-5 h-28">
                    <i class="fas fa-bell mb-2"></i>
                    Уведомления
                </button>
            </div>
        `;
        
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
        
        // Собираем интерфейс
        mainInterface.appendChild(header);
        mainInterface.appendChild(actions);
        mainInterface.appendChild(infoCard);
        
        // Очищаем и вставляем новый интерфейс
        appElement.innerHTML = '';
        appElement.appendChild(mainInterface);
        
        // Скрываем загрузчик
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
    
    // Проверяем, загружен ли основной интерфейс
    // Если через 5 секунд загрузка всё еще видна, показываем заглушку
    setTimeout(function() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement && loadingElement.style.display !== 'none') {
            console.log('Loading still visible after 5 seconds, showing stub interface');
            createStubInterface();
        } else {
            console.log('Loading already hidden, no need for stub interface');
        }
    }, 5000);
});
