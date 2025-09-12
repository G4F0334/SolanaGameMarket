import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Создаем подключение к PostgreSQL
const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: console.log, // Включаем логирование SQL запросов
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Тестируем подключение
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к PostgreSQL успешно установлено');
  } catch (error) {
    console.error('❌ Ошибка подключения к PostgreSQL:', error);
  }
}

// Синхронизация моделей с базой данных
async function syncDatabase() {
  try {
    await sequelize.sync({ force: false }); // force: true пересоздаст таблицы
    console.log('✅ Синхронизация базы данных завершена');
  } catch (error) {
    console.error('❌ Ошибка синхронизации базы данных:', error);
  }
}

export { sequelize, testConnection, syncDatabase };