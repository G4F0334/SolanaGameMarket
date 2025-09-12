import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Типы для кошелька
export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction?: (transaction: any) => Promise<any>;
  signAllTransactions?: (transactions: any[]) => Promise<any[]>;
}

// Тип для Phantom кошелька
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: PublicKey }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: any): Promise<any>;
      signAllTransactions(transactions: any[]): Promise<any[]>;
      publicKey: PublicKey | null;
      isConnected: boolean;
      on?(event: string, handler: (args: any) => void): void;
      removeListener?(event: string, handler: (args: any) => void): void;
    };
  }
}

// Конфигурация сети
export const SOLANA_NETWORK = clusterApiUrl('devnet');
export const connection = new Connection(SOLANA_NETWORK, 'confirmed');

// Класс для работы с кошельком
export class SolanaWallet {
  private _publicKey: PublicKey | null = null;
  private _connected: boolean = false;

  get publicKey(): PublicKey | null {
    return this._publicKey;
  }

  get connected(): boolean {
    return this._connected;
  }

  // Проверка наличия Phantom кошелька
  isPhantomInstalled(): boolean {
    return typeof window !== 'undefined' && window.solana?.isPhantom;
  }

  // Подключение кошелька
  async connect(): Promise<{ publicKey: PublicKey | null; success: boolean; error?: string }> {
    try {
      if (!this.isPhantomInstalled()) {
        return {
          publicKey: null,
          success: false,
          error: 'Phantom кошелек не установлен. Пожалуйста, установите расширение Phantom.'
        };
      }

      if (window.solana) {
        const response = await window.solana.connect();
        this._publicKey = response.publicKey;
        this._connected = true;
        
        return {
          publicKey: this._publicKey,
          success: true
        };
      }

      return {
        publicKey: null,
        success: false,
        error: 'Не удалось подключиться к кошельку'
      };
    } catch (error) {
      console.error('Ошибка подключения кошелька:', error);
      return {
        publicKey: null,
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  // Отключение кошелька
  async disconnect(): Promise<void> {
    try {
      if (window.solana && this._connected) {
        await window.solana.disconnect();
      }
    } catch (error) {
      console.error('Ошибка отключения кошелька:', error);
    } finally {
      this._publicKey = null;
      this._connected = false;
    }
  }

  // Получение баланса
  async getBalance(): Promise<number> {
    if (!this._publicKey || !this._connected) {
      return 0;
    }

    try {
      const balance = await connection.getBalance(this._publicKey);
      return balance / 1000000000; // Конвертация из lamports в SOL
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
      return 0;
    }
  }

  // Форматирование адреса кошелька
  formatAddress(address: string | null): string {
    if (!address) return 'Не подключен';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  // Проверка подключения при загрузке страницы
  async checkConnection(): Promise<void> {
    try {
      if (!this.isPhantomInstalled() || !window.solana) {
        console.log('Phantom кошелек не найден');
        this._publicKey = null;
        this._connected = false;
        return;
      }

      // Небольшая задержка для инициализации Phantom
      await new Promise(resolve => setTimeout(resolve, 100));

      // Проверяем состояние подключения в Phantom
      if (window.solana.isConnected && window.solana.publicKey) {
        console.log('Phantom кошелек подключен:', window.solana.publicKey.toString());
        this._publicKey = window.solana.publicKey;
        this._connected = true;
      } else {
        console.log('Phantom кошелек не подключен');
        this._publicKey = null;
        this._connected = false;
      }
    } catch (error) {
      console.error('Ошибка проверки подключения:', error);
      this._publicKey = null;
      this._connected = false;
    }
  }
}

// Экспорт единственного экземпляра
export const solanaWallet = new SolanaWallet();