import { showTelegramAlert, showTelegramPopup } from '../services/telegram.js';

// Корневой элемент, в который будем рендерить контент
const appRoot = document.getElementById('app');
const loadingElement = document.getElementById('loading');

// Показать сообщение об ошибке
export function showError(message) {
    console.error(message);
    showTelegramAlert(message);
}

// Показать уведомление
export function showNotification(message) {
    showTelegramPopup(message);
}

// Показать загрузчик на весь экран
export function showLoader() {
    if (loadingElement) {
        loadingElement.style.display = 'flex';
    }
}

// Скрыть загрузчик
export function hideLoader() {
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Создать элемент с указанными атрибутами
export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Добавляем атрибуты
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key.startsWith('on') && typeof value === 'function') {
            // События (onClick, onInput и т.д.)
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Добавляем дочерние элементы
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (child instanceof Node) {
                element.appendChild(child);
            } else if (child !== null && child !== undefined) {
                element.appendChild(document.createTextNode(String(child)));
            }
        });
    } else if (children instanceof Node) {
        element.appendChild(children);
    } else if (children !== null && children !== undefined) {
        element.appendChild(document.createTextNode(String(children)));
    }
    
    return element;
}

// Очистить содержимое элемента
export function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return element;
}

// Рендеринг контента в корневой элемент
export function renderContent(content) {
    clearElement(appRoot);
    
    if (content instanceof Node) {
        appRoot.appendChild(content);
    } else if (typeof content === 'string') {
        appRoot.innerHTML = content;
    }
}

// Создать карточку с заголовком и содержимым
export function createCard(title, content, className = '') {
    return createElement('div', {
        className: `p-3 mb-3 rounded-lg tg-secondary-bg ${className}`
    }, [
        createElement('h3', { className: 'text-lg font-bold mb-2' }, title),
        content
    ]);
}

// Создать кнопку
export function createButton(text, onClick, className = '', icon = null) {
    const buttonContent = [];
    
    if (icon) {
        buttonContent.push(
            createElement('i', { className: `fas ${icon} mr-2` })
        );
    }
    
    buttonContent.push(text);
    
    return createElement('button', {
        className: `tg-button py-2 px-4 rounded-lg text-center ${className}`,
        onClick
    }, buttonContent);
}

// Создать иконку-кнопку
export function createIconButton(icon, onClick, className = '', title = '') {
    return createElement('button', {
        className: `p-2 rounded-full ${className}`,
        onClick,
        title
    }, [
        createElement('i', { className: `fas ${icon}` })
    ]);
}

// Создать селект (выпадающий список)
export function createSelect(options, onChange, selectedValue = '', className = '') {
    const select = createElement('select', {
        className: `block w-full p-2 rounded-lg border tg-secondary-bg ${className}`,
        onChange: (e) => onChange(e.target.value)
    });
    
    options.forEach(option => {
        const optionEl = createElement('option', {
            value: option.value,
            selected: option.value === selectedValue
        }, option.label);
        
        select.appendChild(optionEl);
    });
    
    return select;
}

// Создать индикатор загрузки
export function createSpinner(size = 'md') {
    const sizeClass = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }[size] || 'w-6 h-6';
    
    return createElement('div', {
        className: `loader inline-block ${sizeClass}`
    });
}

// Создать бейдж (метку)
export function createBadge(text, type = 'default') {
    const typeClass = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        default: 'tg-secondary-bg tg-hint'
    }[type] || 'tg-secondary-bg tg-hint';
    
    return createElement('span', {
        className: `inline-block px-2 py-1 text-xs rounded-full ${typeClass}`
    }, text);
}

// Создать вкладки
export function createTabs(tabs, activeTab, onTabChange) {
    const tabContainer = createElement('div', {
        className: 'flex border-b mb-4'
    });
    
    tabs.forEach(tab => {
        const isActive = tab.id === activeTab;
        const tabElement = createElement('div', {
            className: `py-2 px-4 cursor-pointer ${isActive ? 'border-b-2 border-blue-500 font-medium' : 'tg-hint'}`,
            onClick: () => onTabChange(tab.id)
        }, tab.label);
        
        tabContainer.appendChild(tabElement);
    });
    
    return tabContainer;
}

// Создать пустое состояние (когда нет данных)
export function createEmptyState(message, icon = 'fa-info-circle') {
    return createElement('div', {
        className: 'flex flex-col items-center justify-center py-8 text-center tg-hint'
    }, [
        createElement('i', { className: `fas ${icon} text-3xl mb-3` }),
        createElement('p', {}, message)
    ]);
}

// Создать информационное сообщение
export function createInfoMessage(message, type = 'info') {
    const typeClass = {
        success: 'bg-green-100 text-green-800 border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        error: 'bg-red-100 text-red-800 border-red-200',
        info: 'bg-blue-100 text-blue-800 border-blue-200'
    }[type] || 'bg-blue-100 text-blue-800 border-blue-200';
    
    const iconClass = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    }[type] || 'fa-info-circle';
    
    return createElement('div', {
        className: `p-3 rounded-lg border ${typeClass} mb-4`
    }, [
        createElement('div', { className: 'flex items-center' }, [
            createElement('i', { className: `fas ${iconClass} mr-2` }),
            createElement('span', {}, message)
        ])
    ]);
}

// Создать разделитель
export function createDivider(className = '') {
    return createElement('hr', {
        className: `my-4 border-t ${className}`
    });
}

// Создать простую таблицу
export function createTable(headers, rows, className = '') {
    const table = createElement('div', {
        className: `w-full overflow-x-auto ${className}`
    }, [
        createElement('table', {
            className: 'w-full min-w-full table-auto'
        })
    ]);
    
    const tableElement = table.querySelector('table');
    
    // Создаем заголовок таблицы
    const thead = createElement('thead', {
        className: 'bg-gray-100'
    });
    
    const headerRow = createElement('tr');
    headers.forEach(header => {
        headerRow.appendChild(
            createElement('th', {
                className: 'px-4 py-2 text-left'
            }, header)
        );
    });
    
    thead.appendChild(headerRow);
    tableElement.appendChild(thead);
    
    // Создаем тело таблицы
    const tbody = createElement('tbody');
    
    rows.forEach(row => {
        const tr = createElement('tr', {
            className: 'border-b'
        });
        
        row.forEach(cell => {
            tr.appendChild(
                createElement('td', {
                    className: 'px-4 py-2'
                }, cell)
            );
        });
        
        tbody.appendChild(tr);
    });
    
    tableElement.appendChild(tbody);
    
    return table;
}
