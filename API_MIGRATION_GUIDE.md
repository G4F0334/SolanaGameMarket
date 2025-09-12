# 🚀 Руководство по переходу на API

Этот документ содержит инструкции по замене локальных данных на API запросы к бэкенду.

## 📋 Содержание

1. [Подготовка к переходу](#подготовка-к-переходу)
2. [Настройка API](#настройка-api)
3. [Замена контекстов](#замена-контекстов)
4. [Обновление компонентов](#обновление-компонентов)
5. [Тестирование](#тестирование)

## 🔧 Подготовка к переходу

### 1. Установка зависимостей

```bash
npm install axios
# или
npm install @tanstack/react-query
```

### 2. Настройка переменных окружения

Создайте файл `.env`:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com
REACT_APP_WALLET_ADAPTER_NETWORK=devnet
```

## 🌐 Настройка API

### 1. Обновите `src/lib/api.ts`

Раскомментируйте и настройте API сервис:

```typescript
// Раскомментируйте импорты
import { apiService, Game as ApiGame } from "@/lib/api";

// Настройте базовый URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";
```

### 2. Добавьте авторизацию

```typescript
// В api.ts добавьте функцию получения токена
const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

// Обновите заголовки запросов
const defaultHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
};
```

## 🔄 Замена контекстов

### 1. GamesContext

В файле `src/contexts/GamesContext.tsx`:

```typescript
// 1. Раскомментируйте импорт API
import { apiService, Game as ApiGame } from "@/lib/api";

// 2. Замените загрузку данных
useEffect(() => {
  const loadGames = async () => {
    try {
      const response = await apiService.getGames();
      if (response.success) {
        setGames(response.data);
      } else {
        console.error("Failed to load games:", response.error);
        setGames(initialGames);
      }
    } catch (error) {
      console.error("Error loading games:", error);
      setGames(initialGames);
    }
  };

  loadGames();
}, []);

// 3. Удалите сохранение в localStorage
// useEffect(() => {
//   if (games.length > 0) {
//     storage.set(STORAGE_KEYS.GAMES, games);
//   }
// }, [games]);

// 4. Обновите методы CRUD
const addGame = async (gameData) => {
  try {
    const response = await apiService.createGame(gameData);
    if (response.success) {
      setGames((prev) => [...prev, response.data]);
      return response.data;
    } else {
      throw new Error(response.error || "Failed to create game");
    }
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};
```

### 2. NFTContext

В файле `src/contexts/NFTContext.tsx`:

```typescript
// 1. Раскомментируйте импорт API
import { apiService, GameNFT } from "@/lib/api";

// 2. Добавьте методы для загрузки данных
const loadUserNFTs = async (walletAddress: string) => {
  try {
    const response = await apiService.getUserNFTs(walletAddress);
    if (response.success) {
      setOwnedNFTs(response.data);
    }
  } catch (error) {
    console.error("Error loading user NFTs:", error);
  }
};

// 3. Обновите методы покупки/продажи
const buyNFT = async (nftId: string, buyerAddress: string) => {
  try {
    const response = await apiService.buyNFT(nftId, buyerAddress);
    if (response.success) {
      // Обновить локальное состояние
      // Перезагрузить данные пользователя
    }
  } catch (error) {
    console.error("Error buying NFT:", error);
    throw error;
  }
};
```

## 🎨 Обновление компонентов

### 1. Каталог (Catalog.tsx)

```typescript
// 1. Раскомментируйте useEffect для загрузки NFT
useEffect(() => {
  const loadNFTs = async () => {
    try {
      const response = await apiService.getNFTs({
        page: 1,
        limit: 100,
        game: selectedGame !== "all" ? selectedGame : undefined,
        rarity: selectedRarity !== "all" ? selectedRarity : undefined,
        search: searchQuery || undefined,
        sortBy: sortBy as any,
      });
      if (response.success) {
        setAllNFTs(response.data.items);
      }
    } catch (error) {
      console.error("Error loading NFTs:", error);
    }
  };
  loadNFTs();
}, [selectedGame, selectedRarity, searchQuery, sortBy]);

// 2. Удалите mock данные
// const allNFTs: NFT[] = [...];
```

### 2. Главная страница (Home.tsx)

```typescript
// 1. Раскомментируйте useEffect для статистики
useEffect(() => {
  const loadMarketStats = async () => {
    try {
      const response = await apiService.getMarketStats();
      if (response.success) {
        setMarketStats([
          {
            label: "Общий объем торгов",
            value: `${response.data.totalVolume} SOL`,
            icon: TrendingUp,
          },
          {
            label: "Активные пользователи",
            value: response.data.activeUsers.toString(),
            icon: Users,
          },
          {
            label: "NFT в каталоге",
            value: response.data.totalNFTs.toString(),
            icon: Gamepad2,
          },
          {
            label: "Проверенные игры",
            value: response.data.totalGames.toString(),
            icon: Shield,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading market stats:", error);
    }
  };
  loadMarketStats();
}, []);

// 2. Удалите mock данные
// const featuredNFTs: NFT[] = [...];
// const marketStats = [...];
```

### 3. Админ панель

```typescript
// В GameManagement.tsx обновите методы
const handleAddGame = async () => {
  if (!formData.name || !formData.description) {
    toast.error("Заполните все обязательные поля");
    return;
  }

  try {
    await addGame({
      name: formData.name,
      description: formData.description,
      image: formData.image,
      category: formData.category,
      status: formData.status,
    });
    toast.success(`Игра "${formData.name}" успешно добавлена!`);
    // Сброс формы...
  } catch (error) {
    toast.error("Ошибка при добавлении игры");
  }
};
```

## 🧪 Тестирование

### 1. Проверка API подключения

```typescript
// Добавьте в компонент тест подключения
useEffect(() => {
  const testConnection = async () => {
    try {
      const response = await apiService.getMarketStats();
      console.log("API connection successful:", response);
    } catch (error) {
      console.error("API connection failed:", error);
    }
  };
  testConnection();
}, []);
```

### 2. Обработка ошибок

```typescript
// Добавьте обработку ошибок во все API вызовы
try {
  const response = await apiService.getNFTs();
  if (response.success) {
    // Успешный ответ
  } else {
    // Ошибка API
    console.error("API Error:", response.error);
  }
} catch (error) {
  // Ошибка сети
  console.error("Network Error:", error);
}
```

## 📝 Чек-лист перехода

- [ ] Настроены переменные окружения
- [ ] Раскомментированы импорты API
- [ ] Обновлен GamesContext
- [ ] Обновлен NFTContext
- [ ] Обновлен каталог
- [ ] Обновлена главная страница
- [ ] Обновлена админ панель
- [ ] Добавлена обработка ошибок
- [ ] Протестировано подключение к API
- [ ] Удалены mock данные
- [ ] Удалено сохранение в localStorage

## 🔍 Отладка

### Полезные команды для отладки:

```typescript
// Логирование API запросов
console.log("API Request:", { endpoint, options });

// Проверка ответа API
console.log("API Response:", response);

// Проверка состояния компонента
console.log("Component State:", { games, nfts, loading });
```

### Частые проблемы:

1. **CORS ошибки** - настройте CORS на бэкенде
2. **404 ошибки** - проверьте URL эндпоинтов
3. **401 ошибки** - проверьте авторизацию
4. **Медленные запросы** - добавьте loading состояния

## 🚀 Дополнительные улучшения

После перехода на API рассмотрите:

1. **Кэширование** - используйте React Query или SWR
2. **Оптимистичные обновления** - обновляйте UI до получения ответа
3. **Пагинация** - для больших списков
4. **Бесконечная прокрутка** - для каталога
5. **Офлайн режим** - кэширование для работы без интернета

## 📞 Поддержка

При возникновении проблем:

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что бэкенд запущен
3. Проверьте переменные окружения
4. Сравните с примерами в `src/lib/api-examples.ts`
