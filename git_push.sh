#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Отправка проекта в GitHub${NC}"
echo -e "${BLUE}================================${NC}"

# Проверка, инициализирован ли Git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Инициализация Git репозитория...${NC}"
    git init
    
    echo -e "${YELLOW}Добавление удаленного репозитория...${NC}"
    git remote add origin https://github.com/Rus9136/madlen_mini_app.git
else
    echo -e "${GREEN}Git репозиторий уже инициализирован${NC}"
    
    # Проверка существования удаленного репозитория
    if ! git remote -v | grep -q "origin"; then
        echo -e "${YELLOW}Добавление удаленного репозитория...${NC}"
        git remote add origin https://github.com/Rus9136/madlen_mini_app.git
    fi
fi

# Добавление всех файлов, кроме тех, что указаны в .gitignore
echo -e "${YELLOW}Добавление файлов в Git...${NC}"
git add .

# Создание коммита
echo -e "${YELLOW}Создание коммита...${NC}"
git commit -m "Первоначальная загрузка Telegram Mini App с интеграцией 1С"

# Установка главной ветки как main
echo -e "${YELLOW}Настройка основной ветки...${NC}"
git branch -M main

# Отправка изменений в GitHub
echo -e "${YELLOW}Отправка изменений в GitHub...${NC}"
git push -u origin main

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Проект успешно отправлен в GitHub!${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}URL репозитория:${NC}"
echo -e "${GREEN}https://github.com/Rus9136/madlen_mini_app${NC}"
echo -e "${BLUE}================================${NC}"

echo -e "${YELLOW}Примечание:${NC}"
echo -e "Если вы получили ошибку при отправке, возможно, вам нужно ввести учетные данные GitHub."
echo -e "Попробуйте выполнить команду вручную:"
echo -e "${GREEN}git push -u origin main${NC}"
echo -e "и следуйте инструкциям для аутентификации."
echo -e "${BLUE}================================${NC}"
