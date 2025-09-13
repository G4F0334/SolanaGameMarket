import { useState, useEffect } from 'react';
import { storage, STORAGE_KEYS, SavedUserData } from '@/lib/storage';
import { apiService } from '@/services/api';
import { useSolanaWallet } from './useSolanaWallet';

interface UserState {
  username: string;
  isLoggedIn: boolean;
  joinDate: string;
}

export const useUserData = () => {
  const [userState, setUserState] = useState<UserState>({
    username: '',
    isLoggedIn: false,
    joinDate: ''
  });
  const { address } = useSolanaWallet();

  // Сохранение данных пользователя
  const saveUserData = (username: string, joinDate?: string) => {
    const userData: SavedUserData = {
      username,
      joinDate: joinDate || new Date().toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      }),
      lastSeen: Date.now()
    };
    storage.set(STORAGE_KEYS.USER_DATA, userData);
  };

  // Загрузка сохраненных данных пользователя
  const loadSavedUserData = (): SavedUserData | null => {
    return storage.get(STORAGE_KEYS.USER_DATA);
  };

  // Установка имени пользователя
  const setUsername = async (username: string) => {
    const joinDate = new Date().toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    setUserState({
      username,
      isLoggedIn: true,
      joinDate
    });
    
    saveUserData(username, joinDate);

    // Сохраняем данные на сервере если кошелек подключен
    if (address) {
      try {
        await apiService.createOrUpdateUser(username, address);
        console.log('✅ User data saved to server');
      } catch (error) {
        console.error('❌ Failed to save user data to server:', error);
      }
    }
  };

  // Выход пользователя
  const logout = () => {
    storage.remove(STORAGE_KEYS.USER_DATA);
    setUserState({
      username: '',
      isLoggedIn: false,
      joinDate: ''
    });
  };

  // Загрузка при инициализации
  useEffect(() => {
    const savedData = loadSavedUserData();
    
    if (savedData && savedData.username) {
      setUserState({
        username: savedData.username,
        isLoggedIn: true,
        joinDate: savedData.joinDate
      });
      
      // Обновляем время последнего посещения
      saveUserData(savedData.username, savedData.joinDate);
    }
  }, []);

  return {
    ...userState,
    setUsername,
    logout,
    saveUserData,
    loadSavedUserData
  };
};
