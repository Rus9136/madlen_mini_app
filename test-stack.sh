#!/bin/bash

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
echo -n "Проверка фронтенда: "
if curl -s -I http://localhost | grep -q "200 OK"; then
    echo "OK"
else
    echo "FAIL"
    echo "Фронтенд не отвечает. Проверьте логи: docker-compose logs frontend"
fi

# Проверка БД
echo -n "Проверка базы данных: "
if docker-compose exec db pg_isready -U postgres -d tg_mini_app; then
    echo "OK"
else
    echo "FAIL"
    echo "База данных не отвечает. Проверьте логи: docker-compose logs db"
fi

# Проверка Redis
echo -n "Проверка Redis: "
if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
    echo "OK"
else
    echo "FAIL"
    echo "Redis не отвечает. Проверьте логи: docker-compose logs redis"
fi

echo ""
echo "Запуск тестового скрипта для проверки интеграции с 1С..."
docker-compose exec backend python scripts/test_1c_integration.py

echo ""
echo "Все проверки завершены."
echo "Чтобы открыть документацию API, перейдите по ссылке: http://localhost:8000/docs"
echo "Чтобы открыть фронтенд, перейдите по ссылке: http://localhost"
