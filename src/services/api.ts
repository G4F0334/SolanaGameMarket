const API_BASE_URL = 'http://localhost:3000/api';

export interface NFTItem {
  id: string | number;
  name: string;
  image: string;
  game: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material';
  description?: string;
  price?: number;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  nft?: string; // Solana mint address
  seller?: string;
  sellerUsername?: string; // никнейм продавца
  ownerAddress?: string; // адрес текущего владельца
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface NFTFilters {
  page?: number;
  limit?: number;
  game?: string;
  type?: string;
  hasNft?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'price-high' | 'price-low' | 'popular';
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getItems(filters?: NFTFilters): Promise<ApiResponse<PaginatedResponse<NFTItem>>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.game && filters.game !== 'all') params.append('game', filters.game);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.hasNft !== undefined) params.append('hasNft', filters.hasNft.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    const endpoint = `/items${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<NFTItem>>(endpoint);
  }

  async getItem(id: string): Promise<ApiResponse<NFTItem>> {
    return this.request<NFTItem>(`/items/${id}`);
  }

  async getNFTItems(filters?: Omit<NFTFilters, 'hasNft'>): Promise<ApiResponse<PaginatedResponse<NFTItem>>> {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.game && filters.game !== 'all') params.append('game', filters.game);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString();
    const endpoint = `/items/nft${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<NFTItem>>(endpoint);
  }

  async createItem(item: Omit<NFTItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<NFTItem>> {
    return this.request<NFTItem>('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateItem(id: string, item: Partial<NFTItem>): Promise<ApiResponse<NFTItem>> {
    return this.request<NFTItem>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  async getHealth(): Promise<ApiResponse<any>> {
    return this.request<any>('/health');
  }

  async getStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/stats');
  }

  // 🦀 Методы для работы с Rust сервисом
  async getSolanaBalance(address: string): Promise<ApiResponse<number>> {
    return this.request<number>(`/solana/balance/${address}`);
  }

  async createSolanaTransaction(payload: any): Promise<ApiResponse<any>> {
    return this.request<any>('/solana/transaction', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSolanaNFT(mintAddress: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/solana/nft/${mintAddress}`);
  }

  async getRustHealth(): Promise<ApiResponse<any>> {
    return this.request<any>('/solana/health');
  }

  // 🎮 NFT методы с сервера
  async getNFTList(): Promise<{ success: boolean; nfts: NFTItem[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/list`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getFeaturedNFTs(): Promise<{ success: boolean; nfts: NFTItem[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/featured`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async purchaseNFT(nftId: string, buyerAddress: string): Promise<{ success: boolean; transaction?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nftId,
          buyerAddress
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Purchase request failed:', error);
      throw error;
    }
  }

  // Получить NFT пользователя в коллекции (не на продаже)
  async getUserOwnedNFTs(userAddress: string): Promise<{ success: boolean; nfts: NFTItem[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/user/${userAddress}/owned`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Получить NFT пользователя на продаже
  async getUserListedNFTs(userAddress: string): Promise<{ success: boolean; nfts: NFTItem[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/user/${userAddress}/listed`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Выставить NFT на продажу
  async listNFTForSale(nftId: string, price: number, sellerAddress: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/list-for-sale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nftId,
          price,
          sellerAddress
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('List NFT request failed:', error);
      throw error;
    }
  }

  // Снять NFT с продажи
  async unlistNFT(nftId: string, ownerAddress: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/unlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nftId,
          ownerAddress
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Unlist NFT request failed:', error);
      throw error;
    }
  }

  // Создать или обновить пользователя
  async createOrUpdateUser(username: string, walletAddress: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          walletAddress
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create/update user request failed:', error);
      throw error;
    }
  }

  // Получить профиль пользователя
  async getUserProfile(walletAddress: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile/${walletAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get user profile request failed:', error);
      throw error;
    }
  }

  // Получить баланс кошелька
  async getWalletBalance(walletAddress: string): Promise<{ success: boolean; balance?: number; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/wallet/balance/${walletAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get wallet balance request failed:', error);
      throw error;
    }
  }

  // Получить NFT по ID
  async getNFTById(nftId: string): Promise<{ success: boolean; nft?: NFTItem; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/${nftId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get NFT by ID request failed:', error);
      throw error;
    }
  }

  // Создать пользовательский NFT
  async createUserNFT(nftData: {
    name: string;
    description: string;
    price: number;
    image: string;
    userAddress: string;
    type: string;
    game: string;
    rarity: string;
  }): Promise<{ success: boolean; nft?: NFTItem; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/nft/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nftData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create user NFT request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService;
