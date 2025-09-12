import Item from './item.entity.js';

// GET /api/items - Получить все предметы
export const getAllItems = async (req, res) => {
  try {
    const { page = 1, limit = 20, game, type, hasNft } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Фильтры
    const where = {};
    if (game) where.game = game;
    if (type) where.type = type;
    if (hasNft === 'true') where.nft = { [sequelize.Sequelize.Op.not]: null };
    if (hasNft === 'false') where.nft = null;
    
    const items = await Item.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        items: items.rows.map(item => item.toPublicJSON()),
        totalCount: items.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(items.count / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения предметов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении предметов'
    });
  }
};

// GET /api/items/:id - Получить предмет по ID
export const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await Item.findByPk(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Предмет не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: item.toPublicJSON()
    });
  } catch (error) {
    console.error('Ошибка получения предмета:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении предмета'
    });
  }
};

// POST /api/items - Создать новый предмет
export const createItem = async (req, res) => {
  try {
    const { name, image, game, type, description, nft } = req.body;

    // Валидация обязательных полей
    if (!name || !game) {
      return res.status(400).json({
        success: false,
        message: 'Обязательные поля: name, game'
      });
    }

    // Проверяем, что предмет с таким NFT адресом не существует (если NFT указан)
    if (nft) {
      const existingItem = await Item.findByNft(nft);
      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Предмет с таким NFT адресом уже существует'
        });
      }
    }

    const newItem = await Item.create({
      name,
      image,
      game,
      type: type || 'weapon',
      description,
      nft
    });

    res.status(201).json({
      success: true,
      data: newItem.toPublicJSON(),
      message: 'Предмет успешно создан'
    });
  } catch (error) {
    console.error('Ошибка создания предмета:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании предмета'
    });
  }
};

// PUT /api/items/:id - Обновить предмет
export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, game, type, description, nft } = req.body;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Предмет не найден'
      });
    }

    // Проверяем уникальность NFT адреса (если обновляется)
    if (nft && nft !== item.nft) {
      const existingItem = await Item.findByNft(nft);
      if (existingItem) {
        return res.status(409).json({
          success: false,
          message: 'Предмет с таким NFT адресом уже существует'
        });
      }
    }

    const updatedItem = await item.update({
      ...(name && { name }),
      ...(image !== undefined && { image }),
      ...(game && { game }),
      ...(type && { type }),
      ...(description !== undefined && { description }),
      ...(nft !== undefined && { nft })
    });

    res.status(200).json({
      success: true,
      data: updatedItem.toPublicJSON(),
      message: 'Предмет успешно обновлен'
    });
  } catch (error) {
    console.error('Ошибка обновления предмета:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении предмета'
    });
  }
};

// DELETE /api/items/:id - Удалить предмет
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Предмет не найден'
      });
    }

    await item.destroy();

    res.status(200).json({
      success: true,
      message: 'Предмет успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления предмета:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении предмета'
    });
  }
};

// GET /api/items/game/:gameName - Получить предметы по игре
export const getItemsByGame = async (req, res) => {
  try {
    const { gameName } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    
    const offset = (page - 1) * limit;
    
    const where = { game: gameName };
    if (type) where.type = type;

    const items = await Item.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        items: items.rows.map(item => item.toPublicJSON()),
        totalCount: items.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(items.count / limit)
      }
    });
  } catch (error) {
    console.error('Ошибка получения предметов игры:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении предметов игры'
    });
  }
};

// GET /api/items/nft - Получить только NFT предметы
export const getNftItems = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const items = await Item.findNftItems();

    res.status(200).json({
      success: true,
      data: {
        items: items.map(item => item.toPublicJSON()),
        totalCount: items.length
      }
    });
  } catch (error) {
    console.error('Ошибка получения NFT предметов:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении NFT предметов'
    });
  }
};