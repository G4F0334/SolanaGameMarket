// API Service для работы с бэкендом
// TODO: Заменить на реальные эндпоинты бэкенда

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Типы для API ответов
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Игровые NFT API
export interface GameNFT {
  id: string;
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
  status: "available" | "sold" | "listed";
  createdAt: string;
  updatedAt: string;
  transactionHash?: string;
}

// Игры API
export interface Game {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  status: "active" | "inactive";
  nftCount: number;
  totalVolume: number;
  createdAt: string;
  updatedAt: string;
}

// Пользователи API
export interface User {
  id: string;
  walletAddress: string;
  username: string;
  avatar?: string;
  joinDate: string;
  lastSeen: string;
  totalPurchases: number;
  totalSales: number;
  reputation: number;
}

// Транзакции API
export interface Transaction {
  id: string;
  nftId: string;
  buyerAddress: string;
  sellerAddress: string;
  price: number;
  currency: string;
  transactionHash: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

// Статистика API
export interface MarketStats {
  totalNFTs: number;
  totalVolume: number;
  activeUsers: number;
  totalGames: number;
  averagePrice: number;
  priceChange24h: number;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Общий метод для запросов
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      "Content-Type": "application/json",
      // TODO: Добавить авторизацию
      // 'Authorization': `Bearer ${getAuthToken()}`,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      return {
        success: false,
        data: null as T,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ==================== NFT API ====================

  // Получить все NFT с пагинацией и фильтрами
  async getNFTs(
    params: {
      page?: number;
      limit?: number;
      game?: string;
      rarity?: string;
      category?: string;
      search?: string;
      sortBy?: "price" | "createdAt" | "rarity";
      sortOrder?: "asc" | "desc";
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<GameNFT>>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request<PaginatedResponse<GameNFT>>(`/nfts?${queryParams}`);
  }

  // Получить NFT по ID
  async getNFTById(id: string): Promise<ApiResponse<GameNFT>> {
    return this.request<GameNFT>(`/nfts/${id}`);
  }

  // Получить NFT пользователя (купленные)
  async getUserNFTs(walletAddress: string): Promise<ApiResponse<GameNFT[]>> {
    return this.request<GameNFT[]>(`/users/${walletAddress}/nfts`);
  }

  // Получить NFT на продажу пользователя
  async getUserListings(
    walletAddress: string
  ): Promise<ApiResponse<GameNFT[]>> {
    return this.request<GameNFT[]>(`/users/${walletAddress}/listings`);
  }

  // Получить проданные NFT пользователя
  async getUserSales(walletAddress: string): Promise<ApiResponse<GameNFT[]>> {
    return this.request<GameNFT[]>(`/users/${walletAddress}/sales`);
  }

  // Создать новый NFT (админ)
  async createNFT(
    nftData: Omit<GameNFT, "id" | "createdAt" | "updatedAt">
  ): Promise<ApiResponse<GameNFT>> {
    return this.request<GameNFT>("/nfts", {
      method: "POST",
      body: JSON.stringify(nftData),
    });
  }

  // Обновить NFT (админ)
  async updateNFT(
    id: string,
    nftData: Partial<GameNFT>
  ): Promise<ApiResponse<GameNFT>> {
    return this.request<GameNFT>(`/nfts/${id}`, {
      method: "PUT",
      body: JSON.stringify(nftData),
    });
  }

  // Удалить NFT (админ)
  async deleteNFT(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/nfts/${id}`, {
      method: "DELETE",
    });
  }

  // Купить NFT
  async buyNFT(
    nftId: string,
    buyerAddress: string
  ): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/nfts/${nftId}/buy`, {
      method: "POST",
      body: JSON.stringify({ buyerAddress }),
    });
  }

  // Выставить NFT на продажу
  async listNFT(
    nftId: string,
    price: number,
    currency: string
  ): Promise<ApiResponse<GameNFT>> {
    return this.request<GameNFT>(`/nfts/${nftId}/list`, {
      method: "POST",
      body: JSON.stringify({ price, currency }),
    });
  }

  // Снять NFT с продажи
  async unlistNFT(nftId: string): Promise<ApiResponse<GameNFT>> {
    return this.request<GameNFT>(`/nfts/${nftId}/unlist`, {
      method: "POST",
    });
  }

  // ==================== GAMES API ====================

  // Получить все игры
  async getGames(): Promise<ApiResponse<Game[]>> {
    return this.request<Game[]>("/games");
  }

  // Получить активные игры
  async getActiveGames(): Promise<ApiResponse<Game[]>> {
    return this.request<Game[]>("/games?status=active");
  }

  // Получить игру по ID
  async getGameById(id: string): Promise<ApiResponse<Game>> {
    return this.request<Game>(`/games/${id}`);
  }

  // Создать игру (админ)
  async createGame(
    gameData: Omit<
      Game,
      "id" | "nftCount" | "totalVolume" | "createdAt" | "updatedAt"
    >
  ): Promise<ApiResponse<Game>> {
    return this.request<Game>("/games", {
      method: "POST",
      body: JSON.stringify(gameData),
    });
  }

  // Обновить игру (админ)
  async updateGame(
    id: string,
    gameData: Partial<Game>
  ): Promise<ApiResponse<Game>> {
    return this.request<Game>(`/games/${id}`, {
      method: "PUT",
      body: JSON.stringify(gameData),
    });
  }

  // Удалить игру (админ)
  async deleteGame(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/games/${id}`, {
      method: "DELETE",
    });
  }

  // Переключить статус игры (админ)
  async toggleGameStatus(id: string): Promise<ApiResponse<Game>> {
    return this.request<Game>(`/games/${id}/toggle-status`, {
      method: "POST",
    });
  }

  // ==================== USERS API ====================

  // Получить пользователя по адресу кошелька
  async getUserByAddress(walletAddress: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${walletAddress}`);
  }

  // Создать/обновить пользователя
  async upsertUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  // Обновить профиль пользователя
  async updateUserProfile(
    walletAddress: string,
    profileData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${walletAddress}`, {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // ==================== TRANSACTIONS API ====================

  // Получить транзакции пользователя
  async getUserTransactions(
    walletAddress: string
  ): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>(`/users/${walletAddress}/transactions`);
  }

  // Получить транзакцию по ID
  async getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  // ==================== STATISTICS API ====================

  // Получить статистику маркетплейса
  async getMarketStats(): Promise<ApiResponse<MarketStats>> {
    return this.request<MarketStats>("/stats/market");
  }

  // Получить статистику игры
  async getGameStats(gameId: string): Promise<
    ApiResponse<{
      totalNFTs: number;
      totalVolume: number;
      averagePrice: number;
      priceChange24h: number;
    }>
  > {
    return this.request(`/stats/games/${gameId}`);
  }

  // Получить статистику пользователя
  async getUserStats(walletAddress: string): Promise<
    ApiResponse<{
      totalPurchases: number;
      totalSales: number;
      totalSpent: number;
      totalEarned: number;
      reputation: number;
    }>
  > {
    return this.request(`/stats/users/${walletAddress}`);
  }

  // ==================== SEARCH API ====================

  // Поиск NFT
  async searchNFTs(
    query: string,
    filters?: {
      game?: string;
      rarity?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Promise<ApiResponse<GameNFT[]>> {
    const queryParams = new URLSearchParams({ q: query });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    return this.request<GameNFT[]>(`/search/nfts?${queryParams}`);
  }

  // ==================== ANALYTICS API ====================

  // Получить тренды цен
  async getPriceTrends(
    nftId: string,
    period: "24h" | "7d" | "30d" | "90d"
  ): Promise<
    ApiResponse<{
      timestamps: string[];
      prices: number[];
    }>
  > {
    return this.request(`/analytics/price-trends/${nftId}?period=${period}`);
  }

  // Получить популярные NFT
  async getPopularNFTs(limit: number = 10): Promise<ApiResponse<GameNFT[]>> {
    return this.request<GameNFT[]>(`/analytics/popular?limit=${limit}`);
  }

  // Получить недавние продажи
  async getRecentSales(
    limit: number = 20
  ): Promise<ApiResponse<Transaction[]>> {
    return this.request<Transaction[]>(
      `/analytics/recent-sales?limit=${limit}`
    );
  }
}

// Экспорт экземпляра API сервиса
export const apiService = new ApiService();
