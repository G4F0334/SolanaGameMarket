import { DataTypes } from 'sequelize';
import { sequelize } from './database.js';

// Модель NFT для PostgreSQL
const NFT = sequelize.define('NFT', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  game: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  rarity: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Common'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  nft: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  seller: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  owner: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('FOR_SALE', 'LISTED_FOR_SALE', 'OWNED', 'SOLD'),
    allowNull: false,
    defaultValue: 'FOR_SALE'
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
  tableName: 'nfts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default NFT;
