import { DataTypes } from 'sequelize';
import { sequelize } from '../database.js';

// Модель для игровых предметов NFT
const Item = sequelize.define('Item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Название предмета
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Название игрового предмета'
  },
  
  // Картинка предмета
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL изображения предмета'
  },
  
  // Игра
  game: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Название игры'
  },
  
  // Тип предмета
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'weapon',
    comment: 'Тип предмета'
  },
  
  // Описание
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Описание предмета'
  },
  
  // NFT адрес (nullable)
  nft: {
    type: DataTypes.STRING(44),
    allowNull: true,
    unique: true,
    comment: 'Mint адрес NFT токена в Solana (если заминчен)'
  }
}, {
  tableName: 'items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  indexes: [
    {
      fields: ['nft']
    },
    {
      fields: ['game']
    },
    {
      fields: ['type']
    },
    {
      fields: ['name']
    }
  ],
  
  comment: 'Таблица игровых предметов'
});

// Методы модели
Item.prototype.toPublicJSON = function() {
  return {
    id: this.id,
    name: this.name,
    image: this.image,
    game: this.game,
    type: this.type,
    description: this.description,
    nft: this.nft,
    created_at: this.created_at,
    updated_at: this.updated_at
  };
};

// Статические методы
Item.findByNft = function(nftAddress) {
  return this.findOne({ where: { nft: nftAddress } });
};

Item.findByGame = function(gameName) {
  return this.findAll({ where: { game: gameName } });
};

Item.findByType = function(itemType) {
  return this.findAll({ where: { type: itemType } });
};

Item.findNftItems = function() {
  return this.findAll({ 
    where: { 
      nft: { 
        [sequelize.Sequelize.Op.not]: null 
      } 
    } 
  });
};

export default Item;