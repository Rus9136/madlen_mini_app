// Инжектируем дополнительные стили для гарантии правильного отображения
document.addEventListener('DOMContentLoaded', function() {
    // Создаем элемент стилей
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
        /* Базовые стили для приложения */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        
        #app {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        
        .tg-button {
            background-color: var(--tg-theme-button-color, #3390ec);
            color: var(--tg-theme-button-text-color, #ffffff);
            border: none;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .tg-button:hover {
            filter: brightness(0.95);
        }
        
        .tg-secondary-bg {
            background-color: var(--tg-theme-secondary-bg-color, #f0f0f0);
        }
        
        .tg-hint {
            color: var(--tg-theme-hint-color, #999999);
        }
        
        /* Стили для загрузчика */
        #loading {
            display: none !important;
        }
        
        /* Дополнительные утилиты */
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .p-3 { padding: 0.75rem; }
        .p-4 { padding: 1rem; }
        .p-5 { padding: 1.25rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .ml-3 { margin-left: 0.75rem; }
        .h-28 { height: 7rem; }
        .w-full { width: 100%; }
        .min-h-screen { min-height: 100vh; }
        .rounded-lg { border-radius: 0.5rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-lg { font-size: 1.125rem; }
        .text-sm { font-size: 0.875rem; }
        .font-bold { font-weight: 700; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-3 { gap: 0.75rem; }
    `;
    
    // Добавляем стили в документ
    document.head.appendChild(styleElement);
    console.log('Additional styles injected');
});
