// Скрипт для принудительного скрытия загрузчика
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, hiding loader');
    
    // Функция скрытия загрузчика
    function hideLoader() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            console.log('Found loading element, hiding it');
            loadingElement.style.display = 'none';
        } else {
            console.error('Loading element not found');
        }
        
        // Резервный метод, если ID не найден
        const loaders = document.querySelectorAll('.flex.items-center.justify-center.min-h-screen');
        if (loaders.length > 0) {
            console.log('Found loader by class, hiding it');
            loaders.forEach(loader => loader.style.display = 'none');
        }
        
        // Покажем содержимое приложения
        const appElement = document.getElementById('app');
        if (appElement) {
            console.log('Found app element, showing content');
            appElement.style.display = 'flex';
            // Если приложение пустое, добавим временный контент
            if (!appElement.children.length || (appElement.children.length === 1 && appElement.children[0].id === 'loading')) {
                appElement.innerHTML = `
                    <div class="flex flex-col p-4">
                        <div class="mb-6 text-center">
                            <h1 class="text-2xl font-bold mb-2">Корпоративное приложение</h1>
                            <p class="text-sm tg-hint">Загрузка интерфейса...</p>
                        </div>
                    </div>
                `;
            }
        }
    }
    
    // Вызываем функцию сразу
    hideLoader();
    
    // А также с небольшой задержкой для надежности
    setTimeout(hideLoader, 500);
    setTimeout(hideLoader, 1000);
    setTimeout(hideLoader, 2000);
});
