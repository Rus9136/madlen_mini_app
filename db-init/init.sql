-- Создание базы данных и пользователя
CREATE DATABASE tg_mini_app;

-- Предоставление всех привилегий пользователю postgres на новую базу данных
GRANT ALL PRIVILEGES ON DATABASE tg_mini_app TO postgres;

-- Подключение к новой базе данных
\c tg_mini_app;

-- Создание расширения для UUID (если понадобится)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Можно также создать схему для нашего приложения
CREATE SCHEMA IF NOT EXISTS app;

-- Установка прав на схему
GRANT ALL ON SCHEMA app TO postgres;

-- Создание таблиц произойдет через миграции Alembic при первом запуске
