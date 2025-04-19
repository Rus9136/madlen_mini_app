#!/bin/bash

# Скрипт для создания резервных копий базы данных PostgreSQL

# Получаем дату в формате YYYY-MM-DD
CURRENT_DATE=$(date +%Y-%m-%d)

# Создаем имя файла резервной копии
BACKUP_FILE="/backups/${POSTGRES_DB}_${CURRENT_DATE}.sql"

# Создаем архивированное имя файла
BACKUP_ARCHIVE="/backups/${POSTGRES_DB}_${CURRENT_DATE}.tar.gz"

# Убеждаемся, что директория для бэкапов существует
mkdir -p /backups

echo "Начинаем создание резервной копии базы данных ${POSTGRES_DB}..."

# Создаем дамп базы данных
pg_dump -h db -U ${POSTGRES_USER} ${POSTGRES_DB} > ${BACKUP_FILE}

# Проверяем успешность создания дампа
if [ $? -eq 0 ]; then
    echo "Дамп базы данных успешно создан: ${BACKUP_FILE}"
    
    # Архивируем дамп
    tar -czf ${BACKUP_ARCHIVE} ${BACKUP_FILE}
    
    if [ $? -eq 0 ]; then
        echo "Дамп базы данных успешно архивирован: ${BACKUP_ARCHIVE}"
        
        # Удаляем неархивированный дамп
        rm ${BACKUP_FILE}
        
        # Удаляем старые резервные копии (оставляем только за последние 7 дней)
        find /backups -name "*.tar.gz" -type f -mtime +7 -delete
        
        echo "Удалены старые резервные копии (старше 7 дней)"
    else
        echo "Ошибка при архивации дампа базы данных."
    fi
else
    echo "Ошибка при создании дампа базы данных."
    exit 1
fi

echo "Процесс создания резервной копии завершен."
