# 🎮 Game Items Market Database

> NFT Gaming Items Marketplace powered by Solana Blockchain

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org/)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-purple.svg)](https://solana.com/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-black.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)

## 🚀 Описание

**Game Items Market** - это современный маркетплейс для торговли игровыми предметами в виде NFT на блокчейне Solana. Проект включает в себя смарт-контракты для минтинга NFT, API для управления предметами и базу данных для хранения метаданных.

### ✨ Основные возможности

- 🎯 **Создание игровых предметов** - простое добавление новых предметов
- 🔗 **NFT интеграция** - минтинг предметов как NFT на Solana
- 🛒 **Маркетплейс** - покупка и продажа игровых предметов
- 📊 **API управления** - полноценный REST API
- 🗄️ **База данных** - PostgreSQL для хранения метаданных
- 🐳 **Docker** - простое развертывание

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Smart Contract │    │   Express API   │    │   PostgreSQL    │
│     (Anchor)    │◄──►│   (Node.js)     │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Solana        │    │   RESTful API   │    │   Items         │
│   Blockchain    │    │   Endpoints     │    │   Metadata      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```



## 🛠️ Технологический стек

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Sequelize** - ORM для работы с базой данных
- **PostgreSQL** - Основная база данных

### Blockchain
- **Solana** - Блокчейн платформа
- **Anchor** - Framework для Solana контрактов
- **Metaplex** - NFT стандарт
- **@solana/web3.js** - JavaScript SDK

### DevOps
- **Docker** - Контейнеризация
- **Docker Compose** - Оркестрация

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** 18+ 
- **Docker** и **Docker Compose**
- **Solana CLI** (для разработки контрактов)
- **Anchor CLI** (для смарт-контрактов)

### 1. Клонирование репозитория

```bash
git clone https://github.com/G4F0334/SolanaGameMarket.git
cd SolanaGameMarket
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка окружения

Создайте файл `.env`:

```env
POSTGRES_DB=test_db
POSTGRES_USER=root
POSTGRES_PASSWORD=qwerty
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
```

### 4. Запуск базы данных

```bash
docker compose up -d
```

### 5. Сборка смарт-контракта

```bash
anchor build
anchor test
anchor deploy
```

### 6. Запуск сервера

```bash
npm start
# или для разработки с автоперезагрузкой
npm run dev
```

### 6. Готово! 🎉

## 📚 Структура базы данных

```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image TEXT,
    game VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL DEFAULT 'weapon',
    description TEXT,
    nft VARCHAR(44) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🐳 Docker

### Запуск через Docker Compose

```bash
# Запуск PostgreSQL
docker compose up -d

# Проверка статуса
docker compose ps

# Просмотр логов
docker compose logs -f

# Остановка
docker compose down
```

</div>
