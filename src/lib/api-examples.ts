// Примеры использования API сервиса
// Этот файл содержит примеры того, как использовать API в компонентах

import { apiService } from "./api";
import { useState, useEffect } from "react";

// ==================== ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ ====================

// 1. Загрузка NFT в каталоге
export const loadCatalogNFTs = async () => {
  try {
    const response = await apiService.getNFTs({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    if (response.success) {
      return response.data.items;
    } else {
      console.error("Failed to load NFTs:", response.error);
      return [];
    }
  } catch (error) {
    console.error("Error loading NFTs:", error);
    return [];
  }
};

// 2. Фильтрация NFT по игре и редкости
export const loadFilteredNFTs = async (game: string, rarity: string) => {
  try {
    const response = await apiService.getNFTs({
      game: game !== "all" ? game : undefined,
      rarity: rarity !== "all" ? rarity : undefined,
      sortBy: "price",
      sortOrder: "asc",
    });

    if (response.success) {
      return response.data.items;
    } else {
      console.error("Failed to load filtered NFTs:", response.error);
      return [];
    }
  } catch (error) {
    console.error("Error loading filtered NFTs:", error);
    return [];
  }
};

// 3. Поиск NFT
export const searchNFTs = async (query: string) => {
  try {
    const response = await apiService.searchNFTs(query, {
      minPrice: 0.1,
      maxPrice: 10.0,
    });

    if (response.success) {
      return response.data;
    } else {
      console.error("Failed to search NFTs:", response.error);
      return [];
    }
  } catch (error) {
    console.error("Error searching NFTs:", error);
    return [];
  }
};

// 4. Покупка NFT
export const buyNFT = async (nftId: string, buyerAddress: string) => {
  try {
    const response = await apiService.buyNFT(nftId, buyerAddress);

    if (response.success) {
      console.log("NFT purchased successfully:", response.data);
      return response.data;
    } else {
      throw new Error(response.error || "Failed to buy NFT");
    }
  } catch (error) {
    console.error("Error buying NFT:", error);
    throw error;
  }
};

// 5. Выставление NFT на продажу
export const listNFTForSale = async (
  nftId: string,
  price: number,
  currency: string
) => {
  try {
    const response = await apiService.listNFT(nftId, price, currency);

    if (response.success) {
      console.log("NFT listed successfully:", response.data);
      return response.data;
    } else {
      throw new Error(response.error || "Failed to list NFT");
    }
  } catch (error) {
    console.error("Error listing NFT:", error);
    throw error;
  }
};

// 6. Загрузка данных пользователя
export const loadUserData = async (walletAddress: string) => {
  try {
    const [ownedNFTs, listings, sales, userInfo] = await Promise.all([
      apiService.getUserNFTs(walletAddress),
      apiService.getUserListings(walletAddress),
      apiService.getUserSales(walletAddress),
      apiService.getUserByAddress(walletAddress),
    ]);

    return {
      ownedNFTs: ownedNFTs.success ? ownedNFTs.data : [],
      listings: listings.success ? listings.data : [],
      sales: sales.success ? sales.data : [],
      userInfo: userInfo.success ? userInfo.data : null,
    };
  } catch (error) {
    console.error("Error loading user data:", error);
    return {
      ownedNFTs: [],
      listings: [],
      sales: [],
      userInfo: null,
    };
  }
};

// 7. Загрузка статистики маркетплейса
export const loadMarketStats = async () => {
  try {
    const response = await apiService.getMarketStats();

    if (response.success) {
      return response.data;
    } else {
      console.error("Failed to load market stats:", response.error);
      return null;
    }
  } catch (error) {
    console.error("Error loading market stats:", error);
    return null;
  }
};

// 8. Управление играми (админ)
export const manageGames = {
  // Создание игры
  create: async (gameData: {
    name: string;
    description: string;
    image: string;
    category: string;
    status: "active" | "inactive";
  }) => {
    try {
      const response = await apiService.createGame(gameData);

      if (response.success) {
        console.log("Game created successfully:", response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to create game");
      }
    } catch (error) {
      console.error("Error creating game:", error);
      throw error;
    }
  },

  // Обновление игры
  update: async (
    gameId: string,
    gameData: Partial<{
      name: string;
      description: string;
      image: string;
      category: string;
      status: "active" | "inactive";
    }>
  ) => {
    try {
      const response = await apiService.updateGame(gameId, gameData);

      if (response.success) {
        console.log("Game updated successfully:", response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to update game");
      }
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  },

  // Удаление игры
  delete: async (gameId: string) => {
    try {
      const response = await apiService.deleteGame(gameId);

      if (response.success) {
        console.log("Game deleted successfully");
        return true;
      } else {
        throw new Error(response.error || "Failed to delete game");
      }
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  },

  // Переключение статуса игры
  toggleStatus: async (gameId: string) => {
    try {
      const response = await apiService.toggleGameStatus(gameId);

      if (response.success) {
        console.log("Game status toggled successfully:", response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to toggle game status");
      }
    } catch (error) {
      console.error("Error toggling game status:", error);
      throw error;
    }
  },
};

// 9. Управление NFT (админ)
export const manageNFTs = {
  // Создание NFT
  create: async (nftData: {
    title: string;
    description?: string;
    image: string;
    price: number;
    currency: string;
    game: string;
    rarity: "Common" | "Rare" | "Epic" | "Legendary";
    seller: string;
    sellerAddress: string;
    category?: string;
    attributes?: Array<{ trait: string; value: string }>;
  }) => {
    try {
      const response = await apiService.createNFT(nftData);

      if (response.success) {
        console.log("NFT created successfully:", response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to create NFT");
      }
    } catch (error) {
      console.error("Error creating NFT:", error);
      throw error;
    }
  },

  // Обновление NFT
  update: async (
    nftId: string,
    nftData: Partial<{
      title: string;
      description?: string;
      image: string;
      price: number;
      currency: string;
      game: string;
      rarity: "Common" | "Rare" | "Epic" | "Legendary";
      category?: string;
      attributes?: Array<{ trait: string; value: string }>;
    }>
  ) => {
    try {
      const response = await apiService.updateNFT(nftId, nftData);

      if (response.success) {
        console.log("NFT updated successfully:", response.data);
        return response.data;
      } else {
        throw new Error(response.error || "Failed to update NFT");
      }
    } catch (error) {
      console.error("Error updating NFT:", error);
      throw error;
    }
  },

  // Удаление NFT
  delete: async (nftId: string) => {
    try {
      const response = await apiService.deleteNFT(nftId);

      if (response.success) {
        console.log("NFT deleted successfully");
        return true;
      } else {
        throw new Error(response.error || "Failed to delete NFT");
      }
    } catch (error) {
      console.error("Error deleting NFT:", error);
      throw error;
    }
  },
};

// 10. Аналитика и тренды
export const loadAnalytics = async () => {
  try {
    const [popularNFTs, recentSales, priceTrends] = await Promise.all([
      apiService.getPopularNFTs(10),
      apiService.getRecentSales(20),
      // Пример для конкретного NFT
      // apiService.getPriceTrends('nft-id', '7d')
    ]);

    return {
      popularNFTs: popularNFTs.success ? popularNFTs.data : [],
      recentSales: recentSales.success ? recentSales.data : [],
      // priceTrends: priceTrends.success ? priceTrends.data : null
    };
  } catch (error) {
    console.error("Error loading analytics:", error);
    return {
      popularNFTs: [],
      recentSales: [],
      // priceTrends: null
    };
  }
};

// ==================== ХУКИ ДЛЯ REACT КОМПОНЕНТОВ ====================

// Пример хука для загрузки NFT
export const useNFTs = (filters?: {
  game?: string;
  rarity?: string;
  search?: string;
}) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNFTs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.getNFTs(filters);

        if (response.success) {
          setNfts(response.data.items);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, [filters?.game, filters?.rarity, filters?.search]);

  return { nfts, loading, error };
};

// Пример хука для статистики
export const useMarketStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiService.getMarketStats();

        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading, error };
};
