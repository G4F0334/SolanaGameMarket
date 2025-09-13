# 🎮 Solana Web3.js NFT Integration Guide

## Обзор

Добавлена полная интеграция с Solana через web3.js для создания NFT игровых предметов. Используется ваш приватный ключ: `2RKCYkDs8AaQSMfukkAnStwSMz36gWT7m8f73izpcpCh`

## Установленные пакеты

```json
{
  "@solana/web3.js": "^1.98.4",
  "@metaplex-foundation/umi": "^1.4.1",
  "@metaplex-foundation/umi-bundle-defaults": "^1.4.1",
  "@metaplex-foundation/mpl-token-metadata": "latest",
  "@metaplex-foundation/digital-asset-standard-api": "latest",
  "@metaplex-foundation/mpl-core": "latest",
  "@metaplex-foundation/umi-signer-wallet-adapters": "latest",
  "bs58": "latest"
}
```

## Новые API эндпойнты

### 🔧 Инициализация

#### POST /api/solana/web3/init
Инициализация Web3.js клиента с вашим ключом

```bash
curl -X POST http://localhost:3000/api/solana/web3/init \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "2RKCYkDs8AaQSMfukkAnStwSMz36gWT7m8f73izpcpCh",
    "network": "devnet"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "message": "🎮 Solana Web3 клиент успешно инициализирован!",
  "data": {
    "wallet": "your_wallet_address",
    "balance": 1.5,
    "network": "devnet",
    "rpcUrl": "https://api.devnet.solana.com",
    "initialized": true
  }
}
```

#### GET /api/solana/web3/status
Проверка статуса клиента

```bash
curl http://localhost:3000/api/solana/web3/status
```

### 🏪 Создание коллекций

#### POST /api/solana/web3/create-collection
Создание NFT коллекции для игры

```bash
curl -X POST http://localhost:3000/api/solana/web3/create-collection \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Epic RPG Items",
    "symbol": "ERPI",
    "description": "Легендарные предметы из игры Epic RPG",
    "uri": "https://example.com/collection-metadata.json",
    "game": "Epic RPG"
  }'
```

### 🎨 Создание NFT

#### POST /api/solana/web3/mint-nft
Создание NFT для игрового предмета

**Из существующего предмета в БД:**
```bash
curl -X POST http://localhost:3000/api/solana/web3/mint-nft \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "collectionMint": "collection_mint_address"
  }'
```

**Кастомный NFT:**
```bash
curl -X POST http://localhost:3000/api/solana/web3/mint-nft \
  -H "Content-Type: application/json" \
  -d '{
    "customName": "Legendary Dragon Sword",
    "customSymbol": "SWORD",
    "customDescription": "Легендарный меч дракона с огненным уроном",
    "customImage": "https://example.com/dragon-sword.png",
    "collectionMint": "collection_mint_address"
  }'
```

#### POST /api/solana/web3/batch-mint
Массовое создание NFT

```bash
curl -X POST http://localhost:3000/api/solana/web3/batch-mint \
  -H "Content-Type: application/json" \
  -d '{
    "itemIds": [1, 2, 3, 4, 5],
    "collectionMint": "collection_mint_address"
  }'
```

### 📊 Информация

#### GET /api/solana/web3/nft/:mint
Получение информации о NFT

```bash
curl http://localhost:3000/api/solana/web3/nft/nft_mint_address
```

#### GET /api/solana/web3/balance
Баланс кошелька

```bash
curl http://localhost:3000/api/solana/web3/balance
```

#### POST /api/solana/web3/send-sol
Отправка SOL (для тестирования)

```bash
curl -X POST http://localhost:3000/api/solana/web3/send-sol \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": "recipient_wallet_address",
    "amount": 0.1
  }'
```

## Пример полного workflow

### 1. Инициализация клиента
```javascript
const response = await fetch('http://localhost:3000/api/solana/web3/init', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    privateKey: '2RKCYkDs8AaQSMfukkAnStwSMz36gWT7m8f73izpcpCh',
    network: 'devnet'
  })
});
```

### 2. Создание коллекции
```javascript
const collection = await fetch('http://localhost:3000/api/solana/web3/create-collection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Game Items',
    symbol: 'MGI',
    description: 'NFT коллекция игровых предметов'
  })
});
```

### 3. Создание NFT для игрового предмета
```javascript
const nft = await fetch('http://localhost:3000/api/solana/web3/mint-nft', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemId: 1, // ID предмета из БД
    collectionMint: collection.data.collectionMint
  })
});
```

### 4. Проверка результата
```javascript
const nftInfo = await fetch(`http://localhost:3000/api/solana/web3/nft/${nft.data.nftMint}`);
```

## Структура NFT метаданных

Создаваемые NFT содержат следующие атрибуты:

```json
{
  "name": "Legendary Dragon Sword",
  "symbol": "ITEM",
  "description": "Легендарный меч дракона",
  "image": "https://example.com/sword.png",
  "attributes": [
    {
      "trait_type": "Game",
      "value": "Epic RPG"
    },
    {
      "trait_type": "Type",
      "value": "weapon"
    },
    {
      "trait_type": "Rarity",
      "value": "legendary"
    },
    {
      "trait_type": "Level",
      "value": "50"
    },
    {
      "trait_type": "Damage",
      "value": "150"
    },
    {
      "trait_type": "Speed",
      "value": "80"
    }
  ]
}
```

## База данных

При создании NFT, информация автоматически сохраняется в БД в поле `nft`:

```json
{
  "id": 1,
  "name": "Dragon Sword",
  "nft": {
    "mint": "nft_mint_address",
    "transaction": "transaction_signature",
    "collection": "collection_mint_address",
    "explorer": "https://explorer.solana.com/address/...",
    "createdAt": "2025-01-13T..."
  }
}
```

## Логи и отладка

Клиент выводит подробные логи:

```
🚀 Инициализация Solana Web3 клиента...
💰 Адрес кошелька: your_wallet_address
💵 Баланс кошелька: 1.5 SOL
🎮 Создание NFT коллекции: Epic RPG Items
🔗 Collection Mint: collection_mint_address
📄 Транзакция: transaction_signature
🎨 Создание NFT для игрового предмета: Dragon Sword
✅ NFT создан!
```

## Troubleshooting

### Низкий баланс
Если баланс меньше 0.01 SOL:
```bash
solana airdrop 2 your_wallet_address --url devnet
```

### Проверка статуса
```bash
curl http://localhost:3000/api/solana/web3/status
```

### Просмотр в Explorer
Каждый созданный NFT содержит ссылку на Solana Explorer для просмотра в блокчейне.

## Безопасность

- ⚠️ Приватный ключ хранится только в памяти во время работы сервера
- 🔐 Рекомендуется использовать переменные окружения для production
- 🌐 Текущая настройка для devnet (тестовая сеть)

## Файлы

Созданные файлы:
- `server/solana/solana-web3-client.js` - Основной клиент
- `server/solana/solana-web3-controller.js` - API контроллеры
- `server/solana/solana.routes.js` - Обновленные маршруты
- `server/SOLANA_WEB3_GUIDE.md` - Эта документация
