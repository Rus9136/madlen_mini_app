/**
 * Мок Telegram WebApp API для локальной разработки
 * Позволяет запускать приложение без реального Telegram
 */

// Класс для имитации кнопки "Назад"
class BackButton {
    constructor() {
        this._isVisible = false;
        this._callbacks = [];
    }
    
    show() {
        console.log('BackButton: show');
        this._isVisible = true;
    }
    
    hide() {
        console.log('BackButton: hide');
        this._isVisible = false;
    }
    
    onClick(callback) {
        console.log('BackButton: onClick registered');
        this._callbacks.push(callback);
    }
    
    offClick() {
        console.log('BackButton: offClick');
        this._callbacks = [];
    }
    
    isVisible() {
        return this._isVisible;
    }
}

// Класс для имитации главной кнопки
class MainButton {
    constructor() {
        this._isVisible = false;
        this._text = '';
        this._color = '#3390ec';
        this._textColor = '#ffffff';
        this._callbacks = [];
        this._isLoading = false;
        
        // Создаем реальную кнопку в DOM для тестирования
        this._createDOMButton();
    }
    
    _createDOMButton() {
        // Если кнопка уже есть, не создаем новую
        if (document.getElementById('tg-main-button')) return;
        
        const button = document.createElement('button');
        button.id = 'tg-main-button';
        button.innerText = this._text || 'Кнопка';
        button.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 16px;
            background-color: ${this._color};
            color: ${this._textColor};
            text-align: center;
            font-size: 16px;
            border: none;
            display: none;
            cursor: pointer;
            z-index: 9999;
        `;
        
        button.addEventListener('click', () => {
            this._callbacks.forEach(callback => callback());
        });
        
        document.body.appendChild(button);
    }
    
    _updateDOMButton() {
        const button = document.getElementById('tg-main-button');
        if (!button) return;
        
        button.innerText = this._isLoading ? 'Загрузка...' : this._text;
        button.style.backgroundColor = this._color;
        button.style.color = this._textColor;
        button.style.display = this._isVisible ? 'block' : 'none';
    }
    
    show() {
        console.log('MainButton: show');
        this._isVisible = true;
        this._updateDOMButton();
    }
    
    hide() {
        console.log('MainButton: hide');
        this._isVisible = false;
        this._updateDOMButton();
    }
    
    setText(text) {
        console.log(`MainButton: setText "${text}"`);
        this._text = text;
        this._updateDOMButton();
    }
    
    setBackgroundColor(color) {
        console.log(`MainButton: setBackgroundColor "${color}"`);
        this._color = color;
        this._updateDOMButton();
    }
    
    setTextColor(color) {
        console.log(`MainButton: setTextColor "${color}"`);
        this._textColor = color;
        this._updateDOMButton();
    }
    
    onClick(callback) {
        console.log('MainButton: onClick registered');
        this._callbacks.push(callback);
    }
    
    offClick() {
        console.log('MainButton: offClick');
        this._callbacks = [];
    }
    
    showProgress() {
        console.log('MainButton: showProgress');
        this._isLoading = true;
        this._updateDOMButton();
    }
    
    hideProgress() {
        console.log('MainButton: hideProgress');
        this._isLoading = false;
        this._updateDOMButton();
    }
}

// Имитация Telegram WebApp
class TelegramWebAppMock {
    constructor() {
        // Используем реальные данные пользователя
        this.initData = 'mock_init_data&id=555299761&first_name=Rus&last_name=Daurenov&username=rususer&language=ru';
        this.initDataUnsafe = {
            user: {
                id: 555299761,
                first_name: 'Rus',
                last_name: 'Daurenov',
                username: 'rususer',
                language_code: 'ru'
            }
        };
        this.version = '6.0';
        this.platform = 'web';
        this.colorScheme = 'light';
        this.themeParams = {
            bg_color: '#ffffff',
            text_color: '#222222',
            hint_color: '#999999',
            link_color: '#3390ec',
            button_color: '#3390ec',
            button_text_color: '#ffffff',
            secondary_bg_color: '#f0f0f0'
        };
        
        this.BackButton = new BackButton();
        this.MainButton = new MainButton();
        
        console.log('Telegram WebApp Mock инициализирован с реальными данными пользователя');
    }
    
    expand() {
        console.log('WebApp: expand');
    }
    
    setHeaderColor(color) {
        console.log(`WebApp: setHeaderColor "${color}"`);
    }
    
    disableSwipeToClose() {
        console.log('WebApp: disableSwipeToClose');
    }
    
    enableSwipeToClose() {
        console.log('WebApp: enableSwipeToClose');
    }
    
    ready() {
        console.log('WebApp: ready');
    }
    
    showAlert(message, callback) {
        console.log(`WebApp: showAlert "${message}"`);
        alert(message);
        if (callback) callback();
    }
    
    showConfirm(message, callback) {
        console.log(`WebApp: showConfirm "${message}"`);
        const result = confirm(message);
        if (callback) callback(result);
    }
    
    showPopup(params, callback) {
        console.log(`WebApp: showPopup "${params.message}"`);
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 8px;
            z-index: 9999;
        `;
        popup.innerText = params.message;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
            if (callback) callback();
        }, params.duration || 3000);
    }
    
    close() {
        console.log('WebApp: close');
    }
}

// Функция инициализации
export function setupTelegramMock() {
    // Проверяем есть ли реальный Telegram WebApp
    if (!window.Telegram || !window.Telegram.WebApp) {
        console.log('Настоящий Telegram WebApp не обнаружен. Используем мок.');
        window.Telegram = {
            WebApp: new TelegramWebAppMock()
        };
    } else {
        console.log('Обнаружен настоящий Telegram WebApp. Используем его.');
    }
}

export { setupTelegramMock };
