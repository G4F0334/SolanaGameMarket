import React, { createContext, useContext, useState, useEffect } from "react";
import { NFT } from "@/components/nft/NFTCard";
import { storage, STORAGE_KEYS } from "@/lib/storage";
// TODO: Заменить на API сервис
// import { apiService, GameNFT } from "@/lib/api";
import dragonSwordImg from "@/assets/dragon-sword.jpg";
import cyberArmorImg from "@/assets/cyber-armor.jpg";
import mysticStaffImg from "@/assets/mystic-staff.jpg";
import battleArenaImg from "@/assets/game-battle-arena.jpg";

interface NFTContextType {
  ownedNFTs: NFT[];
  listedNFTs: NFT[];
  soldNFTs: NFT[];
  purchaseHistory: NFT[];
  // TODO: Добавить методы для API
  // loadUserNFTs: (walletAddress: string) => Promise<void>;
  // loadUserListings: (walletAddress: string) => Promise<void>;
  // loadUserSales: (walletAddress: string) => Promise<void>;
  // buyNFT: (nftId: string, buyerAddress: string) => Promise<void>;
  addOwnedNFT: (nft: NFT) => void;
  removeOwnedNFT: (nftId: string) => void;
  listNFT: (nft: NFT) => void;
  unlistNFT: (nftId: string) => void;
  sellNFT: (nft: NFT) => void;
  addToPurchaseHistory: (nft: NFT) => void;
}

const NFTContext = createContext<NFTContextType | undefined>(undefined);

export const useNFTStore = () => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error("useNFTStore must be used within NFTProvider");
  }
  return context;
};

interface NFTProviderProps {
  children: React.ReactNode;
}

export const NFTProvider: React.FC<NFTProviderProps> = ({ children }) => {
  // Начальные NFT пользователя (mock данные)
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([
    {
      id: "1",
      title: "Dragon Sword of Flames",
      image: dragonSwordImg,
      price: 2.5,
      currency: "SOL",
      game: "Fantasy Quest",
      rarity: "Legendary",
      seller: "DragonMaster",
    },
    {
      id: "2",
      title: "Cyberpunk Armor Set",
      image: cyberArmorImg,
      price: 1.8,
      currency: "SOL",
      game: "Cyber City",
      rarity: "Epic",
      seller: "DragonMaster",
    },
    {
      id: "3",
      title: "Mystic Staff",
      image: mysticStaffImg,
      price: 0.9,
      currency: "SOL",
      game: "Magic Realm",
      rarity: "Rare",
      seller: "DragonMaster",
    },
    {
      id: "4",
      title: "Lightning Bow",
      image: battleArenaImg,
      price: 1.2,
      currency: "SOL",
      game: "Battle Arena",
      rarity: "Epic",
      seller: "DragonMaster",
    },
  ]);

  const [listedNFTs, setListedNFTs] = useState<NFT[]>([]);
  const [soldNFTs, setSoldNFTs] = useState<NFT[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<NFT[]>([]);

  // Сохранение в localStorage с улучшенной обработкой ошибок
  useEffect(() => {
    const data = {
      ownedNFTs,
      listedNFTs,
      soldNFTs,
      purchaseHistory,
      lastUpdated: Date.now(),
    };
    storage.set(STORAGE_KEYS.NFT_STORE, data);
  }, [ownedNFTs, listedNFTs, soldNFTs, purchaseHistory]);

  // Загрузка из localStorage с проверкой валидности данных
  useEffect(() => {
    const stored = storage.get(STORAGE_KEYS.NFT_STORE);
    if (stored && stored.lastUpdated) {
      // Проверяем, что данные не старше 30 дней
      const daysSinceUpdate =
        (Date.now() - stored.lastUpdated) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate <= 30) {
        if (stored.ownedNFTs && Array.isArray(stored.ownedNFTs)) {
          setOwnedNFTs(stored.ownedNFTs);
        }
        if (stored.listedNFTs && Array.isArray(stored.listedNFTs)) {
          setListedNFTs(stored.listedNFTs);
        }
        if (stored.soldNFTs && Array.isArray(stored.soldNFTs)) {
          setSoldNFTs(stored.soldNFTs);
        }
        if (stored.purchaseHistory && Array.isArray(stored.purchaseHistory)) {
          setPurchaseHistory(stored.purchaseHistory);
        }
      } else {
        // Данные устарели, очищаем
        storage.remove(STORAGE_KEYS.NFT_STORE);
      }
    }
  }, []);

  // TODO: Заменить на API методы
  const addOwnedNFT = (nft: NFT) => {
    // TODO: API вызов для создания NFT
    // await apiService.createNFT(nft);
    setOwnedNFTs((prev) => [...prev, nft]);
  };

  const removeOwnedNFT = (nftId: string) => {
    // TODO: API вызов для удаления NFT
    // await apiService.deleteNFT(nftId);
    setOwnedNFTs((prev) => prev.filter((nft) => nft.id !== nftId));
  };

  const listNFT = (nft: NFT) => {
    // TODO: API вызов для выставления на продажу
    // await apiService.listNFT(nft.id, nft.price, nft.currency);
    setListedNFTs((prev) => [...prev, nft]);
    // Опционально: убрать из owned, если нужно
    // removeOwnedNFT(nft.id);
  };

  const unlistNFT = (nftId: string) => {
    // TODO: API вызов для снятия с продажи
    // await apiService.unlistNFT(nftId);
    setListedNFTs((prev) => prev.filter((nft) => nft.id !== nftId));
  };

  const sellNFT = (nft: NFT) => {
    // TODO: API вызов для продажи NFT
    // await apiService.buyNFT(nft.id, buyerAddress);
    setSoldNFTs((prev) => [...prev, nft]);
    unlistNFT(nft.id);
    removeOwnedNFT(nft.id);
  };

  const addToPurchaseHistory = (nft: NFT) => {
    // TODO: API вызов для добавления в историю покупок
    setPurchaseHistory((prev) => [...prev, nft]);
    addOwnedNFT(nft);
  };

  // TODO: Добавить методы для загрузки данных с API
  // const loadUserNFTs = async (walletAddress: string) => {
  //   try {
  //     const response = await apiService.getUserNFTs(walletAddress);
  //     if (response.success) {
  //       setOwnedNFTs(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error loading user NFTs:', error);
  //   }
  // };

  // const loadUserListings = async (walletAddress: string) => {
  //   try {
  //     const response = await apiService.getUserListings(walletAddress);
  //     if (response.success) {
  //       setListedNFTs(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error loading user listings:', error);
  //   }
  // };

  // const loadUserSales = async (walletAddress: string) => {
  //   try {
  //     const response = await apiService.getUserSales(walletAddress);
  //     if (response.success) {
  //       setSoldNFTs(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error loading user sales:', error);
  //   }
  // };

  // const buyNFT = async (nftId: string, buyerAddress: string) => {
  //   try {
  //     const response = await apiService.buyNFT(nftId, buyerAddress);
  //     if (response.success) {
  //       // Обновить локальное состояние
  //       // Перезагрузить данные пользователя
  //     }
  //   } catch (error) {
  //     console.error('Error buying NFT:', error);
  //     throw error;
  //   }
  // };

  const value: NFTContextType = {
    ownedNFTs,
    listedNFTs,
    soldNFTs,
    purchaseHistory,
    addOwnedNFT,
    removeOwnedNFT,
    listNFT,
    unlistNFT,
    sellNFT,
    addToPurchaseHistory,
  };

  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
};
