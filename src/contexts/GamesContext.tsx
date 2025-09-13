import React, { createContext, useContext, useState, useEffect } from "react";
import { storage, STORAGE_KEYS } from "@/lib/storage";
// TODO: Заменить на API сервис
// import { apiService, Game as ApiGame } from "@/lib/api";

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
}

interface GamesContextType {
  games: Game[];
  addGame: (
    game: Omit<Game, "id" | "nftCount" | "totalVolume" | "createdAt">
  ) => void;
  updateGame: (id: string, game: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  toggleGameStatus: (id: string) => void;
  getActiveGames: () => Game[];
  getGameById: (id: string) => Game | undefined;
  getGameByName: (name: string) => Game | undefined;
}

const GamesContext = createContext<GamesContextType | undefined>(undefined);

export const useGamesStore = () => {
  const context = useContext(GamesContext);
  if (!context) {
    throw new Error("useGamesStore must be used within GamesProvider");
  }
  return context;
};

interface GamesProviderProps {
  children: React.ReactNode;
}

export const GamesProvider: React.FC<GamesProviderProps> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);

  // Начальные игры
  const initialGames: Game[] = [
    {
      id: "1",
      name: "Fantasy Quest",
      description:
        "Эпическая фэнтези RPG с уникальными предметами и заклинаниями",
      image: "/placeholder.svg",
      category: "RPG",
      status: "active",
      nftCount: 15,
      totalVolume: 45.2,
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Cyber City",
      description: "Киберпанк шутер с технологичными предметами и оружием",
      image: "/placeholder.svg",
      category: "FPS",
      status: "active",
      nftCount: 23,
      totalVolume: 67.8,
      createdAt: "2024-02-01",
    },
    {
      id: "3",
      name: "Magic Realm",
      description: "Магический мир с заклинаниями и мистическими артефактами",
      image: "/placeholder.svg",
      category: "RPG",
      status: "active",
      nftCount: 18,
      totalVolume: 32.1,
      createdAt: "2024-02-15",
    },
    {
      id: "4",
      name: "Space Warriors",
      description: "Космическая битва с футуристическим оружием и кораблями",
      image: "/placeholder.svg",
      category: "FPS",
      status: "active",
      nftCount: 12,
      totalVolume: 28.5,
      createdAt: "2024-03-01",
    },
    {
      id: "5",
      name: "Battle Arena",
      description: "Арена для сражений с легендарным оружием",
      image: "/placeholder.svg",
      category: "Action",
      status: "active",
      nftCount: 8,
      totalVolume: 19.3,
      createdAt: "2024-03-10",
    },
  ];

  // TODO: Заменить на API запрос
  // Загрузка игр из localStorage (временно)
  useEffect(() => {
    const loadGames = async () => {
      // TODO: Заменить на API вызов
      // try {
      //   const response = await apiService.getGames();
      //   if (response.success) {
      //     setGames(response.data);
      //   } else {
      //     console.error('Failed to load games:', response.error);
      //     setGames(initialGames);
      //   }
      // } catch (error) {
      //   console.error('Error loading games:', error);
      //   setGames(initialGames);
      // }

      // Временная реализация с localStorage
      const savedGames = storage.get(STORAGE_KEYS.GAMES);
      if (savedGames && Array.isArray(savedGames)) {
        setGames(savedGames);
      } else {
        setGames(initialGames);
        storage.set(STORAGE_KEYS.GAMES, initialGames);
      }
    };

    loadGames();
  }, []);

  // TODO: Убрать при переходе на API
  // Сохранение в localStorage при изменении (временно)
  useEffect(() => {
    if (games.length > 0) {
      storage.set(STORAGE_KEYS.GAMES, games);
    }
  }, [games]);

  const addGame = async (
    gameData: Omit<Game, "id" | "nftCount" | "totalVolume" | "createdAt">
  ) => {
    // TODO: Заменить на API вызов
    // try {
    //   const response = await apiService.createGame(gameData);
    //   if (response.success) {
    //     setGames((prev) => [...prev, response.data]);
    //     return response.data;
    //   } else {
    //     throw new Error(response.error || 'Failed to create game');
    //   }
    // } catch (error) {
    //   console.error('Error creating game:', error);
    //   throw error;
    // }

    // Временная реализация с localStorage
    const newGame: Game = {
      id: Date.now().toString(),
      ...gameData,
      nftCount: 0,
      totalVolume: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setGames((prev) => [...prev, newGame]);
    return newGame;
  };

  const updateGame = async (id: string, gameData: Partial<Game>) => {
    // TODO: Заменить на API вызов
    // try {
    //   const response = await apiService.updateGame(id, gameData);
    //   if (response.success) {
    //     setGames((prev) =>
    //       prev.map((game) => (game.id === id ? response.data : game))
    //     );
    //     return response.data;
    //   } else {
    //     throw new Error(response.error || 'Failed to update game');
    //   }
    // } catch (error) {
    //   console.error('Error updating game:', error);
    //   throw error;
    // }

    // Временная реализация с localStorage
    setGames((prev) =>
      prev.map((game) => (game.id === id ? { ...game, ...gameData } : game))
    );
  };

  const deleteGame = async (id: string) => {
    // TODO: Заменить на API вызов
    // try {
    //   const response = await apiService.deleteGame(id);
    //   if (response.success) {
    //     setGames((prev) => prev.filter((game) => game.id !== id));
    //   } else {
    //     throw new Error(response.error || 'Failed to delete game');
    //   }
    // } catch (error) {
    //   console.error('Error deleting game:', error);
    //   throw error;
    // }

    // Временная реализация с localStorage
    setGames((prev) => prev.filter((game) => game.id !== id));
  };

  const toggleGameStatus = async (id: string) => {
    // TODO: Заменить на API вызов
    // try {
    //   const response = await apiService.toggleGameStatus(id);
    //   if (response.success) {
    //     setGames((prev) =>
    //       prev.map((game) => (game.id === id ? response.data : game))
    //     );
    //     return response.data;
    //   } else {
    //     throw new Error(response.error || 'Failed to toggle game status');
    //   }
    // } catch (error) {
    //   console.error('Error toggling game status:', error);
    //   throw error;
    // }

    // Временная реализация с localStorage
    setGames((prev) =>
      prev.map((game) =>
        game.id === id
          ? {
              ...game,
              status: game.status === "active" ? "inactive" : "active",
            }
          : game
      )
    );
  };

  const getActiveGames = () => {
    return games.filter((game) => game.status === "active");
  };

  const getGameById = (id: string) => {
    return games.find((game) => game.id === id);
  };

  const getGameByName = (name: string) => {
    return games.find((game) => game.name === name);
  };

  const value: GamesContextType = {
    games,
    addGame,
    updateGame,
    deleteGame,
    toggleGameStatus,
    getActiveGames,
    getGameById,
    getGameByName,
  };

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
};
