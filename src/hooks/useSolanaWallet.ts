import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { solanaWallet } from '@/lib/solana';
import { storage, STORAGE_KEYS, SavedWalletState } from '@/lib/storage';
import { apiService } from '@/services/api';

interface WalletState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  balance: number;
  address: string | null;
}

export const useSolanaWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
    balance: 0,
    address: null
  });

  // Сохранение состояния кошелька
  const saveWalletState = (address: string, connected: boolean) => {
    const walletData: SavedWalletState = {
      address,
      connected,
      lastConnected: Date.now()
    };
    storage.set(STORAGE_KEYS.WALLET_STATE, walletData);
  };

  // Загрузка сохраненного состояния
  const loadSavedWalletState = (): SavedWalletState | null => {
    const saved = storage.get(STORAGE_KEYS.WALLET_STATE);
    
    // Проверяем, не устарели ли данные (7 дней)
    if (saved && saved.lastConnected) {
      const daysSinceLastConnection = (Date.now() - saved.lastConnected) / (1000 * 60 * 60 * 24);
      if (daysSinceLastConnection > 7) {
        storage.remove(STORAGE_KEYS.WALLET_STATE);
        return null;
      }
    }
    
    return saved;
  };

  // Подключение кошелька
  const connect = async () => {
    console.log('useSolanaWallet: начинаем подключение');
    setWalletState(prev => ({ ...prev, connecting: true }));
    
    try {
      const result = await solanaWallet.connect();
      console.log('useSolanaWallet: результат подключения', result);
      
      if (result.success && result.publicKey) {
        const address = result.publicKey.toString();
        
        // Получаем баланс с сервера
        let balance = 0;
        try {
          const serverBalanceResult = await apiService.getWalletBalance(address);
          if (serverBalanceResult.success && typeof serverBalanceResult.balance === 'number') {
            balance = serverBalanceResult.balance;
            console.log(`💰 Server balance: ${balance} SOL`);
          } else {
            // Fallback на Solana баланс
            balance = await solanaWallet.getBalance();
            console.log(`💰 Fallback Solana balance: ${balance} SOL`);
          }
        } catch (balanceError) {
          console.warn('Failed to get balance, using 0:', balanceError);
          balance = 0;
        }
        
        console.log('useSolanaWallet: кошелек подключен успешно', { address, balance });
        
        // Сохраняем состояние
        saveWalletState(address, true);
        
        const newState = {
          publicKey: result.publicKey,
          connected: true,
          connecting: false,
          balance,
          address
        };
        
        console.log('useSolanaWallet: устанавливаем новое состояние', newState);
        setWalletState(newState);
      } else {
        console.log('useSolanaWallet: подключение не удалось', result.error);
        setWalletState(prev => ({ 
          ...prev, 
          connecting: false 
        }));
        
        if (result.error) {
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('useSolanaWallet: ошибка подключения', error);
      setWalletState(prev => ({ 
        ...prev, 
        connecting: false 
      }));
      throw error;
    }
  };

  // Обновление баланса (теперь с сервера)
  const updateBalance = async () => {
    if (!walletState.connected || !walletState.address) {
      return;
    }
    
    try {
      // Сначала пытаемся получить баланс с сервера
      const serverBalanceResult = await apiService.getWalletBalance(walletState.address);
      
      if (serverBalanceResult.success && typeof serverBalanceResult.balance === 'number') {
        console.log(`💰 Server balance for ${walletState.address}: ${serverBalanceResult.balance} SOL`);
        setWalletState(prev => ({ ...prev, balance: serverBalanceResult.balance }));
        return serverBalanceResult.balance;
      } else {
        // Если сервер недоступен, используем Solana баланс как fallback
        console.log('⚠️ Server balance unavailable, using Solana balance as fallback');
        const balance = await solanaWallet.getBalance();
        setWalletState(prev => ({ ...prev, balance }));
        return balance;
      }
    } catch (error) {
      console.error('useSolanaWallet: ошибка обновления баланса', error);
      // Fallback на Solana баланс
      try {
        const balance = await solanaWallet.getBalance();
        setWalletState(prev => ({ ...prev, balance }));
        return balance;
      } catch (fallbackError) {
        console.error('useSolanaWallet: ошибка fallback баланса', fallbackError);
        return walletState.balance;
      }
    }
  };

  // Отключение кошелька
  const disconnect = async () => {
    try {
      await solanaWallet.disconnect();
      
      // Удаляем сохраненное состояние
      storage.remove(STORAGE_KEYS.WALLET_STATE);
      
      setWalletState({
        publicKey: null,
        connected: false,
        connecting: false,
        balance: 0,
        address: null
      });
    } catch (error) {
      console.error('Ошибка отключения кошелька:', error);
    }
  };

  // Обновление баланса
  const refreshBalance = async () => {
    if (walletState.connected && walletState.publicKey) {
      try {
        const balance = await solanaWallet.getBalance();
        setWalletState(prev => ({ ...prev, balance }));
      } catch (error) {
        console.error('Ошибка обновления баланса:', error);
      }
    }
  };

  // Форматирование адреса
  const formatAddress = (address: string | null): string => {
    return solanaWallet.formatAddress(address);
  };

  // Проверка подключения при загрузке
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        console.log('useSolanaWallet: инициализация кошелька');
        setWalletState(prev => ({ ...prev, connecting: true }));
        
        // Проверяем подключение в Phantom
        await solanaWallet.checkConnection();
        
        if (solanaWallet.connected && solanaWallet.publicKey) {
          const address = solanaWallet.publicKey.toString();
          
          // Получаем баланс с сервера
          let balance = 0;
          try {
            const serverBalanceResult = await apiService.getWalletBalance(address);
            if (serverBalanceResult.success && typeof serverBalanceResult.balance === 'number') {
              balance = serverBalanceResult.balance;
            } else {
              // Fallback на Solana баланс
              balance = await solanaWallet.getBalance();
            }
          } catch (balanceError) {
            console.warn('Failed to get balance during initialization, using 0:', balanceError);
            balance = 0;
          }
          
          console.log('useSolanaWallet: кошелек уже подключен при загрузке:', address);
          
          const newState = {
            publicKey: solanaWallet.publicKey,
            connected: true,
            connecting: false,
            balance,
            address
          };
          
          console.log('useSolanaWallet: устанавливаем состояние при инициализации', newState);
          setWalletState(newState);
          
          // Сохраняем состояние
          saveWalletState(address, true);
        } else {
          console.log('useSolanaWallet: кошелек не подключен при загрузке');
          
          setWalletState({
            publicKey: null,
            connected: false,
            connecting: false,
            balance: 0,
            address: null
          });
          
          // Очищаем старые данные
          storage.remove(STORAGE_KEYS.WALLET_STATE);
        }
      } catch (error) {
        console.error('useSolanaWallet: ошибка инициализации кошелька:', error);
        setWalletState({
          publicKey: null,
          connected: false,
          connecting: false,
          balance: 0,
          address: null
        });
      }
    };

    // Обработчики событий Phantom кошелька
    const handleAccountChanged = (publicKey: any) => {
      console.log('Phantom: аккаунт изменен', publicKey);
      if (publicKey) {
        const address = publicKey.toString();
        setWalletState(prev => ({
          ...prev,
          publicKey,
          address,
          connected: true
        }));
        saveWalletState(address, true);
        // Обновляем баланс
        solanaWallet.getBalance().then(balance => {
          setWalletState(prev => ({ ...prev, balance }));
        });
      } else {
        disconnect();
      }
    };

    const handleDisconnect = () => {
      console.log('Phantom: кошелек отключен');
      setWalletState({
        publicKey: null,
        connected: false,
        connecting: false,
        balance: 0,
        address: null
      });
      storage.remove(STORAGE_KEYS.WALLET_STATE);
    };

    // Подписываемся на события если Phantom доступен
    const setupEventListeners = () => {
      if (typeof window !== 'undefined' && window.solana && window.solana.on) {
        window.solana.on('accountChanged', handleAccountChanged);
        window.solana.on('disconnect', handleDisconnect);
        console.log('Подписались на события Phantom кошелька');
      }
    };

    // Небольшая задержка для инициализации Phantom
    const timeoutId = setTimeout(() => {
      setupEventListeners();
    }, 500);

    initializeWallet();

    // Очистка подписок
    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== 'undefined' && window.solana && window.solana.removeListener) {
        window.solana.removeListener('accountChanged', handleAccountChanged);
        window.solana.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  return {
    ...walletState,
    connect,
    disconnect,
    refreshBalance,
    updateBalance,
    formatAddress,
    isPhantomInstalled: solanaWallet.isPhantomInstalled()
  };
};
