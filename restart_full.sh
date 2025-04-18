#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Перезапуск проекта Telegram Mini App${NC}"
echo -e "${BLUE}================================${NC}"

# Остановка всех контейнеров
echo -e "${YELLOW}Остановка контейнеров...${NC}"
docker-compose down

# Удаление неиспользуемых ресурсов Docker
echo -e "${YELLOW}Очистка неиспользуемых ресурсов Docker...${NC}"
docker system prune -f

# Запуск контейнеров
echo -e "${YELLOW}Запуск контейнеров...${NC}"
docker-compose up -d

# Ожидание запуска сервисов
echo -e "${YELLOW}Ожидание запуска сервисов (10 секунд)...${NC}"
sleep 10

# Проверка статуса контейнеров
echo -e "${YELLOW}Проверка статуса контейнеров...${NC}"
docker-compose ps

# Проверка доступности бэкенда
echo -e "${YELLOW}Проверка доступности бэкенда...${NC}"
if curl -s http://localhost:8001/health | grep -q "status.*ok"; then
    echo -e "${GREEN}Бэкенд работает нормально${NC}"
else
    echo -e "${RED}Бэкенд не отвечает${NC}"
    echo -e "${YELLOW}Просмотр логов бэкенда:${NC}"
    docker-compose logs backend | tail -n 50
fi

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Проект запущен!${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}Доступные адреса:${NC}"
echo -e "- Основной (только через Telegram): ${GREEN}http://localhost:8080/index.html${NC}"
echo -e "- Локальная версия: ${GREEN}http://localhost:8080/local.html${NC}"
echo -e "- API документация: ${GREEN}http://localhost:8001/docs${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "Для просмотра логов используйте:"
echo -e "docker-compose logs -f [backend|frontend|db|redis]"
echo -e "${BLUE}================================${NC}"

# Открываем страницу в браузере (по умолчанию локальную версию)
echo -e "${YELLOW}Открытие приложения в браузере...${NC}"
if command -v open &> /dev/null; then
    open http://localhost:8080/local.html
elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080/local.html
elif command -v start &> /dev/null; then
    start http://localhost:8080/local.html
else
    echo -e "${YELLOW}Не удалось автоматически открыть браузер. Пожалуйста, откройте:${NC}"
    echo -e "${GREEN}http://localhost:8080/local.html${NC}"
fi
