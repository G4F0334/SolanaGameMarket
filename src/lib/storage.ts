// Утилиты для работы с localStorage
export const storage = {
  // Сохранение данных
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Получение данных
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  // Удаление данных
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  // Очистка всех данных
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Ключи для хранения
export const STORAGE_KEYS = {
  WALLET_STATE: 'solana_wallet_state',
  USER_DATA: 'user_data',
  NFT_STORE: 'nft_store'
};

// Типы для сохраняемых данных
export interface SavedWalletState {
  address: string;
  connected: boolean;
  lastConnected: number;
}

export interface SavedUserData {
  username: string;
  joinDate: string;
  lastSeen: number;
}
