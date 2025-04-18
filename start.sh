#!/bin/bash

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "Файл .env не найден. Создаем из .env.example..."
    cp .env.example .env
    echo "Файл .env создан. Пожалуйста, отредактируйте его с вашими настройками."
    exit 1
fi

# Проверка токена Telegram бота
TELEGRAM_BOT_TOKEN=$(grep TELEGRAM_BOT_TOKEN .env | cut -d '=' -f2)
if [ "$TELEGRAM_BOT_TOKEN" = "your_telegram_bot_token" ] || [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "Ошибка: Укажите правильный TELEGRAM_BOT_TOKEN в файле .env"
    exit 1
fi

# Создание необходимых директорий для логов
mkdir -p logs

# Запуск Docker Compose
echo "Запуск проекта с помощью Docker Compose..."
docker-compose up -d

# Проверка статуса контейнеров
echo "Проверка статуса контейнеров..."
docker-compose ps

# Информация о доступе
echo ""
echo "Проект успешно запущен!"
echo "API доступен по адресу: http://localhost:8000"
echo "Frontend доступен по адресу: http://localhost"
echo "Swagger документация: http://localhost:8000/docs"
echo ""
echo "Для просмотра логов используйте: docker-compose logs -f"
echo "Для остановки проекта используйте: docker-compose down"
