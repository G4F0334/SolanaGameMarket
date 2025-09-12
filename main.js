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
    description: "API для управления игровыми предметами и NFT маркетплейсом",
    baseUrl: `http://localhost:${PORT}`,
    
    endpoints: {
      items: {
        "GET /api/items": {
          description: "Получить список всех предметов",
          parameters: {
            page: "Номер страницы (по умолчанию: 1)",
            limit: "Количество элементов на странице (по умолчанию: 20)",
            game: "Фильтр по игре",
            type: "Фильтр по типу (weapon, armor, accessory, consumable, material)",
            hasNft: "Фильтр по наличию NFT (true/false)"
          }
        },
        "POST /api/items": {
          description: "Создать новый предмет",
          body: {
            name: "string (обязательно)",
            image: "string (URL)",
            game: "string (обязательно)",
            type: "string (weapon/armor/accessory/consumable/material)",
            description: "string",
            nft: "string (Solana mint address)"
          }
        }
      }
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