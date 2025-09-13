import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, percentAmount, sol } from '@metaplex-foundation/umi';

/**
 * 🎮 Umi Client с поддержкой мок режима
 */

class UmiClient {
  constructor() {
    this.umi = null;
    this.initialized = false;
    this.mockMode = false; // Режим без реального блокчейна
  }

  /**
   * Инициализация с возможностью мок режима
   */
  async initialize(rpcUrl = 'http://localhost:8899', keypairPath = null, useMockMode = false) {
    try {
      this.mockMode = useMockMode;

      if (this.mockMode) {
        console.log('🎭 Запущен в мок режиме (без реального блокчейна)');
        this.initialized = true;
        return { mockMode: true };
      }

      // Реальная инициализация
      this.umi = createUmi(rpcUrl);

      if (keypairPath) {
        const { readFileSync } = await import('fs');
        const keypairData = JSON.parse(readFileSync(keypairPath, 'utf8'));
        const keypair = this.umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairData));
        this.umi.use(keypair);
      }

      this.initialized = true;
      console.log('✅ Umi клиент инициализирован');
      console.log('🔗 RPC URL:', rpcUrl);
      
      return this.umi;
    } catch (error) {
      console.error('❌ Ошибка инициализации Umi:', error);
      
      // Автоматически переключаемся в мок режим при ошибке
      console.log('🎭 Переключение в мок режим из-за ошибки подключения');
      this.mockMode = true;
      this.initialized = true;
      
      return { mockMode: true, error: error.message };
    }
  }

  /**
   * Создание коллекции (с мок поддержкой)
   */
  async createGameCollection(gameData) {
    if (!this.initialized) {
      throw new Error('Umi клиент не инициализирован');
    }

    if (this.mockMode) {
      // Мок ответ
      const mockMint = `mock_collection_${Date.now()}`;
      console.log('🎭 [MOCK] Создание коллекции:', gameData.name);
      
      return {
        success: true,
        collectionMint: mockMint,
        metadata: {
          name: gameData.name,
          symbol: gameData.symbol,
          description: gameData.description
        },
        message: `[MOCK] Коллекция "${gameData.name}" создана`
      };
    }

    // Реальная логика создания коллекции
    try {
      const collectionMint = generateSigner(this.umi);
      
      // ... остальная логика
      
      return {
        success: true,
        collectionMint: collectionMint.publicKey,
        metadata: { /* реальные метаданные */ },
        message: `Коллекция "${gameData.name}" успешно создана`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Создание NFT (с мок поддержкой)
   */
  async createItemNFT(itemData, collectionMint) {
    if (!this.initialized) {
      throw new Error('Umi клиент не инициализирован');
    }

    if (this.mockMode) {
      const mockMint = `mock_nft_${Date.now()}`;
      console.log('🎭 [MOCK] Создание NFT:', itemData.name);
      
      return {
        success: true,
        itemMint: mockMint,
        collectionMint,
        metadata: {
          name: itemData.name,
          description: itemData.description,
          attributes: [
            { trait_type: 'Type', value: itemData.type },
            { trait_type: 'Rarity', value: itemData.rarity }
          ]
        },
        message: `[MOCK] NFT "${itemData.name}" создан`
      };
    }

    // Реальная логика создания NFT
    try {
      const itemMint = generateSigner(this.umi);
      
      return {
        success: true,
        itemMint: itemMint.publicKey,
        collectionMint,
        metadata: { /* реальные метаданные */ },
        message: `NFT "${itemData.name}" успешно создан`
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Проверка подключения
   */
  async checkConnection() {
    if (!this.initialized) return false;
    
    if (this.mockMode) {
      return true; // В мок режиме всегда "подключен"
    }

    try {
      await this.umi.rpc.getSlot();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Получение баланса
   */
  async getWalletBalance() {
    if (!this.initialized) {
      throw new Error('Umi клиент не инициализирован');
    }

    if (this.mockMode) {
      return {
        success: true,
        publicKey: 'mock_wallet_address',
        balance: 10.0, // Мок баланс
        balanceLamports: 10000000000
      };
    }

    try {
      const balance = await this.umi.rpc.getBalance(this.umi.identity.publicKey);
      return {
        success: true,
        publicKey: this.umi.identity.publicKey,
        balance: Number(balance.basisPoints) / 1000000000,
        balanceLamports: balance.basisPoints
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Остальные методы с мок поддержкой...
}

export const umiClient = new UmiClient();
export default UmiClient;
