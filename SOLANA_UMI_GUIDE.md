# 🎮 Solana Game Marketplace - Umi Integration

## Описание

Этот проект интегрирует Metaplex Umi для работы с NFT в игровом маркетплейсе на блокчейне Solana.

## Возможности Umi в проекте

### 🔧 Инициализация

-   Подключение к Solana RPC
-   Управление кошельком
-   Проверка соединения

### 🎨 NFT операции

-   Создание коллекций для игр
-   Минтинг NFT игровых предметов
-   Управление метаданными
-   Создание листингов для продажи

### 💰 Маркетплейс

-   Листинг NFT на продажу
-   Покупка/продажа NFT
-   Отслеживание цен и объемов

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install --no-bin-links
```

### 2. Настройка переменных окружения

Создайте файл `.env`:

```
PORT=3000
NODE_ENV=development
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_KEYPAIR_PATH=/home/eugen/.config/solana/id.json
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamemarket
DB_USER=postgres
DB_PASS=password
```

### 3. Настройка Solana для devnet

```bash
# Переключаемся на devnet
solana config set --url devnet

# Проверяем конфигурацию
solana config get

# Пополняем кошелек тестовыми SOL
solana airdrop 2

# Проверяем баланс
solana balance
```

### 4. Запуск базы данных

```bash
docker-compose up -d
```

### 5. Запуск API сервера (больше НЕ нужен solana-test-validator!)

```bash
npm start
# или для разработки
npm run dev
```

## API Endpoints

### 🔧 Solana Management

#### Инициализация Solana клиента

```http
POST /api/solana/init
Content-Type: application/json

{
  "rpcUrl": "https://api.devnet.solana.com"
}
```

#### Проверка статуса

```http
GET /api/solana/status
```

#### Баланс кошелька

```http
GET /api/solana/wallet/balance
```

### 🎮 Game Collections

#### Создание коллекции для игры

```http
POST /api/solana/collection
Content-Type: application/json

{
  "name": "Epic RPG Items",
  "symbol": "ERPI",
  "description": "Rare and legendary items from Epic RPG game",
  "image": "https://example.com/collection-image.png",
  "type": "RPG",
  "genre": "Fantasy",
  "developer": "Epic Games Studio"
}
```

### 🎨 NFT Operations

#### Создание NFT для игрового предмета

```http
POST /api/solana/mint-nft
Content-Type: application/json

{
  "itemId": 1,
  "collectionMint": "collection_mint_address_here"
}
```

#### Выставление NFT на продажу

```http
POST /api/solana/list-nft
Content-Type: application/json

{
  "itemId": 1,
  "price": 0.5
}
```

#### Получение метаданных NFT

```http
GET /api/solana/nft/{mint_address}
```

## Примеры использования

### 1. Полный workflow создания и продажи NFT

```javascript
// 1. Инициализация Solana
const initResponse = await fetch("/api/solana/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        rpcUrl: "https://api.devnet.solana.com",
    }),
});

// 2. Создание игрового предмета в БД
const itemResponse = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        name: "Legendary Sword",
        description: "A powerful sword forged by ancient masters",
        type: "weapon",
        rarity: "legendary",
        game: "Epic RPG",
        level: 50,
        stats: {
            damage: 150,
            speed: 80,
            durability: 100,
        },
        image: "https://example.com/sword.png",
    }),
});

const item = await itemResponse.json();

// 3. Создание коллекции игры (если еще нет)
const collectionResponse = await fetch("/api/solana/collection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        name: "Epic RPG Items",
        symbol: "ERPI",
        description: "Legendary items from Epic RPG",
    }),
});

const collection = await collectionResponse.json();

// 4. Создание NFT для предмета
const nftResponse = await fetch("/api/solana/mint-nft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        itemId: item.data.id,
        collectionMint: collection.data.collectionMint,
    }),
});

// 5. Выставление на продажу
const listingResponse = await fetch("/api/solana/list-nft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        itemId: item.data.id,
        price: 0.5, // 0.5 SOL
    }),
});
```

### 2. Поиск NFT предметов

```javascript
// Получение всех предметов с NFT
const nftItems = await fetch("/api/items?hasNft=true");

// Получение предметов конкретной игры
const gameItems = await fetch("/api/items/game/Epic%20RPG");

// Получение метаданных конкретного NFT
const nftMetadata = await fetch("/api/solana/nft/mint_address_here");
```

## Структура данных

### Игровой предмет с NFT

```json
{
  "id": 1,
  "name": "Legendary Sword",
  "description": "A powerful sword forged by ancient masters",
  "type": "weapon",
  "rarity": "legendary",
  "game": "Epic RPG",
  "level": 50,
  "stats": {
    "damage": 150,
    "speed": 80,
    "durability": 100
  },
  "image": "https://example.com/sword.png",
  "nft": {
    "mint": "nft_mint_address",
    "collectionMint": "collection_mint_address",
    "metadata": { ... },
    "createdAt": "2025-09-13T..."
  },
  "listing": {
    "id": "listing_123",
    "price": 0.5,
    "seller": "seller_wallet_address",
    "active": true,
    "createdAt": "2025-09-13T..."
  }
}
```

## Безопасность

-   ✅ Rate limiting на API endpoints
-   ✅ Helmet для защиты заголовков
-   ✅ CORS настройка
-   ✅ Валидация входных данных
-   ✅ Обработка ошибок

## Мониторинг

### Health Check

```http
GET /api/health
```

### Статистика

```http
GET /api/stats
```

### Статус Solana

```http
GET /api/solana/status
```

## Разработка

### Структура проекта

```
/
├── main.js                 # Основной сервер
├── database.js            # Конфигурация БД
├── items/                 # Модуль игровых предметов
│   ├── item.entity.js
│   └── item.controller.js
├── solana/               # Модуль Solana/Umi
│   ├── umi-client.js     # Umi клиент
│   ├── solana.controller.js
│   └── solana.routes.js
└── package.json
```

### Логирование

API логирует все запросы и ошибки. Для отладки Umi операций включено подробное логирование.

### Тестирование

```bash
# Запуск тестов
npm test

# Проверка подключения к Solana
curl http://localhost:3000/api/solana/status
```
