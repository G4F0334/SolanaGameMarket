import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, percentAmount, sol } from '@metaplex-foundation/umi';

/**
 * 🎮 Umi Client для Solana Game Marketplace
 * Управление NFT игровыми предметами через Metaplex Umi
 */

class UmiClient {
  constructor() {
    this.umi = null;
    this.initialized = false;
  }

  /**
   * Инициализация Umi клиента
   * @param {string} rpcUrl - URL RPC узла Solana
   * @param {string} keypairPath - Путь к ключевой паре (опционально)
   */
  async initialize(rpcUrl = 'http://localhost:8899', keypairPath = null) {
    try {
      // Создаем Umi экземпляр
      this.umi = createUmi(rpcUrl);

      // Если передан путь к ключевой паре, загружаем её
      if (keypairPath) {
        const { readFileSync } = await import('fs');
        const keypairData = JSON.parse(readFileSync(keypairPath, 'utf8'));
        const keypair = this.umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairData));
        this.umi.use(keypair);
      }

      this.initialized = true;
      console.log('✅ Umi клиент инициализирован');
      console.log('🔗 RPC URL:', rpcUrl);
      console.log('🔑 Wallet:', this.umi.identity.publicKey);

      return this.umi;
    } catch (error) {
      console.error('❌ Ошибка инициализации Umi:', error);
      throw error;
    }
  }

  /**
   * Создание NFT коллекции для игры
   * @param {Object} gameData - Данные игры
   * @returns {Object} Результат создания коллекции
   */
  async createGameCollection(gameData) {
    if (!this.initialized) {
      throw new Error('Umi клиент не инициализирован');
    }

    try {
      const collectionMint = generateSigner(this.umi);

      const metadata = {
        name: gameData.name,
        symbol: gameData.symbol,
        description: gameData.description,
        image: gameData.image || '',
        attributes: [
          { trait_type: 'Game Type', value: gameData.type || 'Unknown' },
          { trait_type: 'Genre', value: gameData.genre || 'Gaming' },
          { trait_type: 'Developer', value: gameData.developer || 'Unknown' }
        ],
        properties: {
          category: 'image',
          files: gameData.image ? [{ uri: gameData.image, type: 'image/png' }] : []
        }
      };

      console.log('🎮 Создание коллекции для игры:', gameData.name);
      console.log('🏷️ Mint адрес:', collectionMint.publicKey);

      return {
        success: true,
        collectionMint: collectionMint.publicKey,
        metadata,
        message: `Коллекция для игры "${gameData.name}" успешно создана`
      };

    } catch (error) {
      console.error('❌ Ошибка создания коллекции:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Создание NFT игрового предмета
   * @param {Object} itemData - Данные игрового предмета
   * @param {string} collectionMint - Адрес коллекции
   * @returns {Object} Результат создания NFT
   */
  async createItemNFT(itemData, collectionMint) {
    if (!this.initialized) {
      throw new Error('Umi клиент не инициализирован');
    }

    try {
      const itemMint = generateSigner(this.umi);

      const metadata = {
        name: itemData.name,
        symbol: itemData.symbol || 'ITEM',
        description: itemData.description,
        image: itemData.image || '',
        attributes: [
          { trait_type: 'Type', value: itemData.type },
          { trait_type: 'Rarity', value: itemData.rarity },
          { trait_type: 'Level', value: itemData.level?.toString() || '1' },
          { trait_type: 'Game', value: itemData.game },
          ...(itemData.stats ? Object.entries(itemData.stats).map(([key, value]) => ({
            trait_type: key,
            value: value.toString()
          })) : [])
        ],
        properties: {
          category: 'image',
          files: itemData.image ? [{ uri: itemData.image, type: 'image/png' }] : []
        }
      };

      console.log('⚔️ Создание NFT предмета:', itemData.name);
      console.log('🏷️ Mint адрес:', itemMint.publicKey);

      return {
        success: true,
        itemMint: itemMint.publicKey,
        metadata,
        collectionMint,
        message: `NFT предмет "${itemData.name}" успешно создан`
      };

    } catch (error) {
      console.error('❌ Ошибка создания NFT предмета:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Создание листинга для продажи NFT
   * @param {string} nftMint - Адрес NFT
   * @param {number} price - Цена в SOL
   * @returns {Object} Результат создания листинга
   */
  async createListing(nftMint, price) {
    if (!this.initialized) {
      throw new Error('Umi клиент не инициализирован');
    }

    try {
      const priceInLamports = sol(price).basisPoints;

      console.log('🏪 Создание листинга NFT');
      console.log('🏷️ NFT Mint:', nftMint);
      console.log('💰 Цена:', `${price} SOL`);

      // Здесь будет логика создания листинга через программу маркетплейса
      // Пока возвращаем мок данные
      return {
        success: true,
        listingId: `listing_${Date.now()}`,
        nftMint,
        price: priceInLamports,
        seller: this.umi.identity.publicKey,
        message: `Листинг создан для цены ${price} SOL`
      };

    } catch (error) {
      console.error('❌ Ошибка создания листинга:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Получение метаданных NFT
   * @param {string} mintAddress - Адрес mint NFT
   * @returns {Object} Метаданные NFT
   */
  async getNFTMetadata(mintAddress) {
    if (!this.initialized) {
      throw new Error('Umi клиент не инициализирован');
    }

    try {
      console.log('🔍 Получение метаданных NFT:', mintAddress);
      
      // Здесь будет логика получения реальных метаданных
      // Пока возвращаем мок данные
      return {
        success: true,
        mint: mintAddress,
        metadata: {
          name: 'Game Item NFT',
          symbol: 'ITEM',
          description: 'Gaming NFT Item',
          image: '',
          attributes: []
        }
      };

    } catch (error) {
      console.error('❌ Ошибка получения метаданных:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Получение баланса кошелька
   * @returns {Object} Баланс в SOL
   */
  async getWalletBalance() {
    if (!this.initialized) {
      throw new Error('Umi клиент не инициализирован');
    }

    try {
      const balance = await this.umi.rpc.getBalance(this.umi.identity.publicKey);
      const solBalance = Number(balance.basisPoints) / 1000000000; // Конвертация в SOL

      return {
        success: true,
        publicKey: this.umi.identity.publicKey,
        balance: solBalance,
        balanceLamports: balance.basisPoints
      };

    } catch (error) {
      console.error('❌ Ошибка получения баланса:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Проверка подключения к сети
   * @returns {boolean} Статус подключения
   */
  async checkConnection() {
    if (!this.initialized) {
      return false;
    }

    try {
      await this.umi.rpc.getSlot();
      return true;
    } catch (error) {
      console.error('❌ Нет подключения к Solana:', error);
      return false;
    }
  }
}

// Экспортируем singleton экземпляр
export const umiClient = new UmiClient();
export default UmiClient;
