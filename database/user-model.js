import { DataTypes } from 'sequelize';
import { sequelize } from './database.js';

// Модель пользователей для PostgreSQL
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  walletAddress: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nftsOwned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  nftsSold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  totalVolume: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default User;
