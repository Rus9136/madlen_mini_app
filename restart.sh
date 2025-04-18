#!/bin/bash

echo "Перезапуск и тестирование Telegram Mini App..."

# Остановка всех контейнеров
echo "Остановка контейнеров..."
docker-compose down

# Пересоздание контейнеров
echo "Запуск контейнеров..."
docker-compose up -d

# Ждем некоторое время для запуска контейнеров
echo "Ожидание инициализации (10 секунд)..."
sleep 10

# Проверка доступности сервисов
echo "Проверка доступности сервисов..."

# Проверка бэкенда
echo -n "Проверка бэкенда: "
if curl -s http://localhost:8000/health | grep -q "status.*ok"; then
    echo "OK"
else
    echo "FAIL"
    echo "Бэкенд не отвечает. Проверьте логи: docker-compose logs backend"
fi

# Проверка фронтенда
echo -n "Проверка фронтенда (local.html): "
if curl -s http://localhost/local.html | grep -q "head"; then
    echo "OK"
else
    echo "FAIL"
    echo "Фронтенд не отвечает. Проверьте логи: docker-compose logs frontend"
fi

echo ""
echo "Для работы с приложением, откройте в браузере:"
echo "- Документация API:         http://localhost:8000/docs"
echo "- Фронтенд (обычный режим): http://localhost"
echo "- Фронтенд (локальный тест): http://localhost/local.html"
echo ""
echo "Данные тестового пользователя:"
echo "- Telegram ID: 555299761"
echo "- Имя: Rus Daurenov"
echo ""
echo "Для просмотра логов используйте:"
echo "- Backend:  docker-compose logs -f backend"
echo "- Frontend: docker-compose logs -f frontend"
echo "- Database: docker-compose logs -f db"
