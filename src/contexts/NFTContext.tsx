import React, { createContext, useContext, useState, useEffect } from "react";
import { NFT } from "@/components/nft/NFTCard";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import { apiService } from "@/services/api";

interface NFTContextType {
  ownedNFTs: NFT[];
  listedNFTs: NFT[];
  soldNFTs: NFT[];
  purchaseHistory: NFT[];
  loading: boolean;
  buyNFT: (nftId: string, buyerAddress: string) => Promise<any>;
  loadUserNFTs: (userAddress: string) => Promise<void>;
  addOwnedNFT: (nft: NFT) => void;
  removeOwnedNFT: (nftId: string) => void;
  listNFT: (nft: NFT, price: number, sellerAddress: string) => Promise<void>;
  unlistNFT: (nftId: string, ownerAddress: string) => Promise<void>;
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
  const [ownedNFTs, setOwnedNFTs] = useState<NFT[]>([]);
  const [listedNFTs, setListedNFTs] = useState<NFT[]>([]);
  const [soldNFTs, setSoldNFTs] = useState<NFT[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  // Функция для преобразования NFTItem в NFT формат
  const convertToNFT = (item: any): NFT => ({
    id: item.id.toString(),
    title: item.name,
    image: item.image || "/placeholder.svg",
    price: item.price || 0,
    currency: "SOL",
    game: item.game,
    rarity: item.rarity || "Common",
    seller: item.seller || "Unknown",
  });

  // Загрузить NFT пользователя с сервера (один раз при загрузке)
  const loadUserNFTs = async (userAddress: string) => {
    if (!userAddress || loading) return; // Предотвращаем повторные вызовы
    
    try {
      setLoading(true);
      
      // Загружаем принадлежащие NFT
      const ownedResponse = await apiService.getUserOwnedNFTs(userAddress);
      if (ownedResponse.success) {
        const convertedOwned = ownedResponse.nfts.map(convertToNFT);
        setOwnedNFTs(convertedOwned);
      }

      // Загружаем NFT на продаже
      const listedResponse = await apiService.getUserListedNFTs(userAddress);
      if (listedResponse.success) {
        const convertedListed = listedResponse.nfts.map(convertToNFT);
        setListedNFTs(convertedListed);
      }
    } catch (error) {
      console.error('Error loading user NFTs:', error);
      // В случае ошибки устанавливаем демо данные только один раз
      if (ownedNFTs.length === 0) {
        setOwnedNFTs([
          {
            id: "demo_1",
            title: "Dragon Sword",
            image: "/placeholder.svg",
            price: 2.5,
            currency: "SOL",
            game: "Fantasy Quest",
            rarity: "Epic",
            seller: "GameMaster",
          },
          {
            id: "demo_2",
            title: "Cyber Armor",
            image: "/placeholder.svg",
            price: 1.8,
            currency: "SOL",
            game: "Neon Runners",
            rarity: "Rare",
            seller: "TechNinja",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // TODO: Заменить на API методы
  const addOwnedNFT = (nft: NFT) => {
    setOwnedNFTs((prev) => [...prev, nft]);
  };

  const removeOwnedNFT = (nftId: string) => {
    setOwnedNFTs((prev) => prev.filter((nft) => nft.id !== nftId));
  };

  const listNFT = async (nft: NFT, price: number, sellerAddress: string) => {
    try {
      const response = await apiService.listNFTForSale(nft.id, price, sellerAddress);
      if (response.success) {
        // Обновляем локальное состояние
        const updatedNFT = { ...nft, price };
        setListedNFTs((prev) => [...prev, updatedNFT]);
        removeOwnedNFT(nft.id);
      }
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    }
  };

  const unlistNFT = async (nftId: string, ownerAddress: string) => {
    try {
      const response = await apiService.unlistNFT(nftId, ownerAddress);
      if (response.success) {
        // Находим NFT в списке выставленных
        const nftToUnlist = listedNFTs.find(nft => nft.id === nftId);
        if (nftToUnlist) {
          // Убираем из списка на продаже
          setListedNFTs((prev) => prev.filter((nft) => nft.id !== nftId));
          // Добавляем в коллекцию
          addOwnedNFT(nftToUnlist);
        }
      }
    } catch (error) {
      console.error('Error unlisting NFT:', error);
      throw error;
    }
  };

  const sellNFT = (nft: NFT) => {
    // TODO: API вызов для продажи NFT
    // await apiService.buyNFT(nft.id, buyerAddress);
    setSoldNFTs((prev) => [...prev, nft]);
    setListedNFTs((prev) => prev.filter((n) => n.id !== nft.id));
    removeOwnedNFT(nft.id);
  };

  const addToPurchaseHistory = (nft: NFT) => {
    // TODO: API вызов для добавления в историю покупок
    setPurchaseHistory((prev) => [...prev, nft]);
    addOwnedNFT(nft);
  };

  const buyNFT = async (nftId: string, buyerAddress: string) => {
    try {
      const response = await apiService.purchaseNFT(nftId, buyerAddress);
      if (response.success) {
        // Найти NFT в каталоге и добавить в коллекцию
        // После покупки NFT должен исчезнуть из каталога
        // и появиться в коллекции покупателя
        console.log('NFT purchased successfully:', response);
        
        // Возвращаем успешный результат для обновления UI
        return response;
      }
      throw new Error('Purchase failed');
    } catch (error) {
      console.error('Error buying NFT:', error);
      throw error;
    }
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
    loading,
    buyNFT,
    loadUserNFTs,
    addOwnedNFT,
    removeOwnedNFT,
    listNFT,
    unlistNFT,
    sellNFT,
    addToPurchaseHistory,
  };

  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>;
};
