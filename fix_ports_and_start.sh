#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Исправление портов и запуск проекта${NC}"
echo -e "${BLUE}================================${NC}"

# Определяем базовый путь проекта
PROJECT_DIR="/Users/rus/Projects/telegram-mini-app"
cd "$PROJECT_DIR"

echo -e "${YELLOW}Остановка всех контейнеров...${NC}"
docker-compose down

echo -e "${YELLOW}Изменение портов в docker-compose.yml...${NC}"
# Редактируем docker-compose.yml для изменения портов
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    build: 
      context: ./backend
    restart: always
    ports:
      - "8001:8000"
    volumes:
      - ./backend:/app
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    environment:
      - POSTGRES_SERVER=db
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - REDIS_HOST=redis
      - SECRET_KEY=${SECRET_KEY}
      - ONEC_API_URL=${ONEC_API_URL}
      - ONEC_API_USER=${ONEC_API_USER}
      - ONEC_API_PASSWORD=${ONEC_API_PASSWORD}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
    command: >
      sh -c "alembic upgrade head &&
             python scripts/init_data.py &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

  frontend:
    image: nginx:alpine
    restart: always
    ports:
      - "8080:80"
    volumes:
      - ./frontend:/usr/share/nginx/html
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - backend

  db:
    image: postgres:14
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db-init:/docker-entrypoint-initdb.d
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    ports:
      - "5433:5432"

  redis:
    image: redis:alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

echo -e "${YELLOW}Обновление URL API в конфигурации фронтенда...${NC}"
# Изменяем URL API в конфигурации фронтенда
cat > frontend/js/main.js << 'EOF'
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
    apiBaseUrl: 'http://localhost:8001/api/v1',
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
        
        // Если пользователь не аутентифицирован, выполняем вход через Telegram
        if (!isAuthenticated()) {
            await authenticateUser();
        }
        
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

// Аутентификация пользователя через Telegram
async function authenticateUser() {
    try {
        showLoader();
        
        // Получаем initData от Telegram WebApp
        const initData = window.App.tg.initData;
        
        if (!initData) {
            throw new Error('Нет данных инициализации Telegram');
        }
        
        try {
            // Отправляем запрос на бэкенд для аутентификации
            const response = await fetch(`${window.App.apiBaseUrl}/auth/telegram-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `_auth=${encodeURIComponent(initData)}`
            });
            
            if (!response.ok) {
                throw new Error('Ошибка аутентификации');
            }
            
            const data = await response.json();
            
            // Сохраняем токен
            setToken(data.access_token);
            
            hideLoader();
            return true;
        } catch (apiError) {
            console.warn('Ошибка API аутентификации:', apiError);
            
            // В режиме разработки используем тестовый токен
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Используем тестовый токен для локальной разработки');
                
                // Генерируем фиктивный токен для тестирования
                const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTUyOTk3NjEiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE5OTk5OTk5OTl9.HG7oZFS2UuFd1yzL_RwJI5jK5zMC92F4-Ru72r_D';
                setToken(testToken);
                
                hideLoader();
                return true;
            }
            
            throw apiError;
        }
    } catch (error) {
        console.error('Ошибка аутентификации:', error);
        showError('Ошибка аутентификации. Пожалуйста, перезапустите приложение.');
        hideLoader();
        return false;
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
EOF

echo -e "${YELLOW}Изменение конфигурации Nginx...${NC}"
# Обновляем конфигурацию Nginx для проксирования на новый порт API
cat > nginx/nginx.conf << 'EOF'
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Общие настройки
    charset utf-8;
    client_max_body_size 10M;

    # JavaScript модули и статические файлы
    location ~* \.js$ {
        add_header Content-Type "application/javascript" always;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Другие статические файлы
    location ~* \.(jpg|jpeg|gif|png|css|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Все статические файлы
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Проксирование запросов к API бэкенда
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Заголовки для работы с Telegram WebApp
    add_header 'Access-Control-Allow-Origin' 'https://t.me' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

    # Логи
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
}
EOF

echo -e "${YELLOW}Запуск контейнеров...${NC}"
# Запускаем контейнеры один за другим для лучшего контроля
docker-compose up -d db
echo -e "${GREEN}База данных запущена${NC}"
sleep 5

docker-compose up -d redis
echo -e "${GREEN}Redis запущен${NC}"
sleep 2

docker-compose up -d backend
echo -e "${GREEN}Backend запущен${NC}"
sleep 5

docker-compose up -d frontend
echo -e "${GREEN}Frontend запущен${NC}"
sleep 2

echo -e "${YELLOW}Проверка статуса контейнеров...${NC}"
docker-compose ps

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Проект запущен!${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}Доступ к приложению:${NC}"
echo -e "- Frontend: ${GREEN}http://localhost:8080/local.html${NC}"
echo -e "- API документация: ${GREEN}http://localhost:8001/docs${NC}"
echo -e "${BLUE}================================${NC}"
