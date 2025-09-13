import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import dotenv from 'dotenv';
import { sequelize, testConnection, syncDatabase } from './database.js';
import Item from './items/item.entity.js';
import * as itemController from './items/item.controller.js';
import solanaRoutes from './solana/solana.routes.js';

// Load environment variables
dotenv.config();

// 🚀 Создаем Express приложение
const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ Безопасность и middleware
app.use(helmet()); // Защита заголовков
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001']
}));
app.use(compression()); // Сжатие ответов
app.use(morgan('combined')); // Логирование запросов
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🚦 Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    error: 'Слишком много запросов, попробуйте позже'
  }
});
app.use('/api/', limiter);

// 🎨 ASCII арт для красоты
const asciiArt = `
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🎮 SOLANA GAME MARKETPLACE DATABASE API 🎮              ║
  ║                                                           ║
  ║   🔥 NFT Gaming Items Marketplace                         ║
  ║   🔥 Powered by Solana Blockchain                         ║
  ║   🔥 Create, Trade, Dominate                              ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
`;

// 🏠 Главная страница с красивой информацией
app.get('/', (req, res) => {
  res.json({
    message: "🎮 Solana Game Marketplace API",
    version: "1.0.0",
    status: "🟢 Online",
    endpoints: {
      items: {
        "GET /api/items": "Получить все предметы",
        "GET /api/items/:id": "Получить предмет по ID",
        "POST /api/items": "Создать новый предмет",
        "PUT /api/items/:id": "Обновить предмет",
        "DELETE /api/items/:id": "Удалить предмет",
        "GET /api/items/game/:gameName": "Предметы игры",
        "GET /api/items/nft": "Только NFT предметы"
      },
      solana: {
        "POST /api/solana/init": "Инициализация Solana клиента",
        "GET /api/solana/status": "Статус подключения",
        "POST /api/solana/collection": "Создать коллекцию игры",
        "POST /api/solana/mint-nft": "Создать NFT предмета",
        "POST /api/solana/list-nft": "Выставить NFT на продажу",
        "GET /api/solana/nft/:mint": "Метаданные NFT",
        "GET /api/solana/wallet/balance": "Баланс кошелька"
      },
      status: {
        "GET /api/health": "Проверка здоровья API",
        "GET /api/stats": "Статистика маркетплейса"
      }
    },
    documentation: "/api/docs",
    blockchain: "Solana",
    features: ["NFT Minting", "Marketplace", "Game Items", "Trading"]
  });
});

// 📊 API Routes для предметов
app.get('/api/items', itemController.getAllItems);
app.get('/api/items/nft', itemController.getNftItems);
app.get('/api/items/game/:gameName', itemController.getItemsByGame);
app.get('/api/items/:id', itemController.getItemById);
app.post('/api/items', itemController.createItem);
app.put('/api/items/:id', itemController.updateItem);
app.delete('/api/items/:id', itemController.deleteItem);

// 🪙 Solana API Routes
app.use('/api/solana', solanaRoutes);

// 🏥 Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: '🟢 Healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: '🟢 Connected',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: '🔴 Unhealthy',
      timestamp: new Date().toISOString(),
      database: '🔴 Disconnected',
      error: error.message
    });
  }
});

// 📈 Статистика маркетплейса
app.get('/api/stats', async (req, res) => {
  try {
    const totalItems = await Item.count();
    const nftItems = await Item.count({ where: { nft: { [sequelize.Sequelize.Op.not]: null } } });
    const gameStats = await Item.findAll({
      attributes: [
        'game',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['game'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    const typeStats = await Item.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
    });

    res.json({
      success: true,
      stats: {
        totalItems,
        nftItems,
        regularItems: totalItems - nftItems,
        nftPercentage: totalItems > 0 ? Math.round((nftItems / totalItems) * 100) : 0,
        gameDistribution: gameStats,
        typeDistribution: typeStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статистики'
    });
  }
});

// 📚 API Documentation
app.get('/api/docs', (req, res) => {
  res.json({
    title: "🎮 Solana Game Marketplace API Documentation",
    version: "1.0.0",
    description: "API для управления игровыми предметами и NFT маркетплейсом на блокчейне Solana",
    baseUrl: `http://localhost:${PORT}`,
    
    endpoints: {
      // 📦 Items API
      items: {
        "GET /api/items": {
          description: "Получить список всех предметов",
          parameters: {
            page: "Номер страницы (по умолчанию: 1)",
            limit: "Количество элементов на странице (по умолчанию: 20)",
            game: "Фильтр по игре",
            type: "Фильтр по типу (weapon, armor, accessory, consumable, material)",
            hasNft: "Фильтр по наличию NFT (true/false)"
          },
          example: "GET /api/items?page=1&limit=10&game=Epic%20RPG&hasNft=true"
        },
        "GET /api/items/:id": {
          description: "Получить предмет по ID",
          parameters: {
            id: "ID предмета"
          },
          example: "GET /api/items/1"
        },
        "POST /api/items": {
          description: "Создать новый предмет",
          body: {
            name: "string (обязательно) - Название предмета",
            image: "string (URL) - Ссылка на изображение",
            game: "string (обязательно) - Название игры",
            type: "string - Тип предмета (weapon/armor/accessory/consumable/material)",
            description: "string - Описание предмета",
            rarity: "string - Редкость (common/uncommon/rare/epic/legendary)",
            level: "number - Уровень предмета",
            stats: "object - Характеристики предмета"
          },
          example: {
            name: "Legendary Sword",
            description: "A powerful sword forged by ancient masters",
            type: "weapon",
            rarity: "legendary",
            game: "Epic RPG",
            level: 50,
            stats: { damage: 150, speed: 80 },
            image: "https://example.com/sword.png"
          }
        },
        "PUT /api/items/:id": {
          description: "Обновить предмет",
          parameters: { id: "ID предмета" },
          body: "Поля для обновления (аналогично POST)"
        },
        "DELETE /api/items/:id": {
          description: "Удалить предмет",
          parameters: { id: "ID предмета" }
        },
        "GET /api/items/game/:gameName": {
          description: "Получить предметы конкретной игры",
          parameters: { gameName: "Название игры" },
          example: "GET /api/items/game/Epic%20RPG"
        },
        "GET /api/items/nft": {
          description: "Получить только предметы с NFT",
          example: "GET /api/items/nft"
        }
      },

      // 🪙 Solana Blockchain API
      solana: {
        "POST /api/solana/init": {
          description: "Инициализация Solana клиента для работы с блокчейном",
          body: {
            rpcUrl: "string (optional) - URL RPC узла (по умолчанию: devnet)",
            keypairPath: "string (optional) - Путь к ключевой паре"
          },
          example: {
            rpcUrl: "https://api.devnet.solana.com"
          },
          response: {
            success: true,
            message: "Solana клиент успешно инициализирован",
            data: {
              wallet: "wallet_public_key",
              balance: 1.5,
              connected: true,
              rpcUrl: "https://api.devnet.solana.com"
            }
          }
        },
        "GET /api/solana/status": {
          description: "Проверка статуса подключения к Solana",
          response: {
            success: true,
            data: {
              initialized: true,
              wallet: "wallet_public_key",
              balance: 1.5,
              connected: true
            }
          }
        },
        "POST /api/solana/collection": {
          description: "Создание NFT коллекции для игры",
          body: {
            name: "string (обязательно) - Название коллекции",
            symbol: "string (обязательно) - Символ коллекции",
            description: "string - Описание коллекции",
            image: "string - URL изображения коллекции",
            type: "string - Тип игры",
            genre: "string - Жанр игры",
            developer: "string - Разработчик игры"
          },
          example: {
            name: "Epic RPG Items",
            symbol: "ERPI",
            description: "Rare and legendary items from Epic RPG game",
            image: "https://example.com/collection.png",
            type: "RPG",
            genre: "Fantasy",
            developer: "Epic Games Studio"
          },
          response: {
            success: true,
            message: "Коллекция успешно создана",
            data: {
              collectionMint: "collection_mint_address",
              metadata: "collection_metadata"
            }
          }
        },
        "POST /api/solana/mint-nft": {
          description: "Создание NFT для игрового предмета",
          body: {
            itemId: "number (обязательно) - ID предмета из базы данных",
            collectionMint: "string (optional) - Адрес коллекции"
          },
          example: {
            itemId: 1,
            collectionMint: "collection_mint_address_here"
          },
          response: {
            success: true,
            message: "NFT предмет успешно создан",
            data: {
              itemId: 1,
              itemMint: "nft_mint_address",
              collectionMint: "collection_mint_address",
              metadata: "nft_metadata"
            }
          }
        },
        "POST /api/solana/list-nft": {
          description: "Выставление NFT на продажу в маркетплейсе",
          body: {
            itemId: "number (обязательно) - ID предмета с NFT",
            price: "number (обязательно) - Цена в SOL"
          },
          example: {
            itemId: 1,
            price: 0.5
          },
          response: {
            success: true,
            message: "Листинг создан для цены 0.5 SOL",
            data: {
              itemId: 1,
              listingId: "listing_id",
              nftMint: "nft_mint_address",
              price: 0.5,
              seller: "seller_wallet"
            }
          }
        },
        "GET /api/solana/nft/:mint": {
          description: "Получение метаданных NFT по mint адресу",
          parameters: {
            mint: "string - Mint адрес NFT"
          },
          example: "GET /api/solana/nft/nft_mint_address_here",
          response: {
            success: true,
            data: {
              mint: "nft_mint_address",
              metadata: {
                name: "Legendary Sword",
                symbol: "ITEM",
                description: "A powerful sword...",
                image: "https://example.com/sword.png",
                attributes: "nft_attributes"
              }
            }
          }
        },
        "GET /api/solana/wallet/balance": {
          description: "Получение баланса кошелька в SOL",
          response: {
            success: true,
            data: {
              publicKey: "wallet_public_key",
              balance: 1.5,
              balanceLamports: 1500000000
            }
          }
        }
      },

      // 🏥 System API
      system: {
        "GET /api/health": {
          description: "Проверка состояния API и базы данных",
          response: {
            status: "🟢 Healthy",
            timestamp: "2025-09-13T...",
            uptime: 3600,
            database: "🟢 Connected",
            memory: { used: "25 MB", total: "100 MB" }
          }
        },
        "GET /api/stats": {
          description: "Статистика маркетплейса",
          response: {
            totalItems: 150,
            nftItems: 45,
            totalGames: 12,
            topGames: ["Epic RPG", "Space Adventure"]
          }
        },
        "GET /": {
          description: "Информация об API",
          response: {
            message: "🎮 Solana Game Marketplace API",
            version: "1.0.0",
            status: "🟢 Online",
            endpoints: "endpoint_list"
          }
        }
      }
    },

    // 🎯 Примеры использования
    workflows: {
      "Создание и продажа NFT предмета": [
        "1. POST /api/solana/init - Инициализация Solana",
        "2. POST /api/items - Создание предмета в БД",
        "3. POST /api/solana/collection - Создание коллекции (если нужно)",
        "4. POST /api/solana/mint-nft - Создание NFT для предмета",
        "5. POST /api/solana/list-nft - Выставление на продажу"
      ],
      "Поиск NFT предметов": [
        "1. GET /api/items?hasNft=true - Все предметы с NFT",
        "2. GET /api/items/game/GameName - Предметы конкретной игры",
        "3. GET /api/solana/nft/mint_address - Метаданные NFT"
      ]
    },

    // ⚙️ Конфигурация
    configuration: {
      environment: process.env.NODE_ENV || 'development',
      solanaNetwork: "devnet",
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      database: "PostgreSQL",
      rateLimit: "100 requests per 15 minutes"
    },

    // 📝 Примечания
    notes: {
      devnet: "Используется Solana devnet для разработки - бесплатные транзакции",
      airdrop: "Получить тестовые SOL: solana airdrop 2 --url devnet",
      keypair: "Создать кошелек: solana-keygen new",
      github: "https://github.com/G4F0334/SolanaGameMarket"
    }
  });
});

// 🚫 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: '🔍 Endpoint not found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/items',
      'POST /api/items',
      'GET /api/items/:id',
      'PUT /api/items/:id',
      'DELETE /api/items/:id',
      'GET /api/items/game/:gameName',
      'GET /api/items/nft',
      'POST /api/solana/init',
      'GET /api/solana/init',
      'GET /api/solana/status',
      'POST /api/solana/collection',
      'POST /api/solana/mint-nft',
      'POST /api/solana/list-nft',
      'GET /api/solana/nft/:mint',
      'GET /api/solana/wallet/balance',
      'GET /api/health',
      'GET /api/stats',
      'GET /api/docs'
    ]
  });
});

// 💥 Error handler
app.use((error, req, res, next) => {
  console.error('🚨 Server Error:', error);
  res.status(500).json({
    error: '💥 Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 🚀 Запуск сервера
const startServer = async () => {
  try {
    console.log(asciiArt);
    console.log('🔄 Initializing Solana Game Marketplace...\n');

    // Подключение к базе данных
    console.log('📡 Connecting to PostgreSQL...');
    await testConnection();
    console.log('✅ Database connected successfully!\n');

    // Синхронизация моделей
    console.log('🔄 Synchronizing database models...');
    await syncDatabase();
    console.log('✅ Database models synchronized!\n');

    // Запуск сервера
    app.listen(PORT, () => {
      console.log('🎉 SERVER STARTED SUCCESSFULLY! 🎉\n');
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Statistics: http://localhost:${PORT}/api/stats`);
      console.log(`\n🎮 Ready to handle NFT gaming items!`);
      console.log('🔥 Let\'s build the future of gaming! 🔥\n');
    });

  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
};

// 🎯 Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await sequelize.close();
    console.log('✅ Database connection closed.');
    console.log('👋 Server shutdown complete. Goodbye!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 🚀 Start the magic!
startServer();

export default app;