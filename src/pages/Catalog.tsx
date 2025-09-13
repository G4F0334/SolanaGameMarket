import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List, Loader2 } from "lucide-react";
import NFTCard, { NFT } from "@/components/nft/NFTCard";
import { useGamesStore } from "@/contexts/GamesContext";
import { apiService, NFTItem } from "@/services/api";

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [nftItems, setNftItems] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { getActiveGames } = useGamesStore();

  // Функция для преобразования NFTItem в NFT формат
  const convertToNFT = (item: NFTItem): NFT => ({
    id: item.id.toString(),
    title: item.name,
    image: item.image || "/placeholder.svg",
    price: item.price || 0,
    currency: "SOL",
    game: item.game,
    rarity: item.rarity || "Common",
    seller: item.seller || "Unknown",
    sellerUsername: item.sellerUsername || item.seller, // используем никнейм если есть
    ownerAddress: item.ownerAddress || item.seller, // адрес владельца для проверки
  });

  // Fallback NFT данные на случай проблем с сервером
  const fallbackNFTs: NFT[] = [
    {
      id: "fallback_1",
      title: "Cyber Armor",
      image: "/cyber-armor.jpg",
      price: 1.8,
      currency: "SOL",
      game: "Neon Runners",
      rarity: "Epic",
      seller: "TechNinja",
    },
    {
      id: "fallback_2",
      title: "Mystic Staff",
      image: "/mystic-staff.jpg",
      price: 3.2,
      currency: "SOL",
      game: "Magic Realm",
      rarity: "Legendary",
      seller: "ArchMage",
    },
    {
      id: "fallback_3",
      title: "Lightning Bow",
      image: "/placeholder.svg",
      price: 1.2,
      currency: "SOL",
      game: "Battle Arena",
      rarity: "Epic",
      seller: "ElvenArcher",
    },
  ];

  // Загрузка данных с сервера
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Пытаемся загрузить с сервера
        const response = await apiService.getNFTList();

        if (response.success) {
          const convertedNFTs = response.nfts.map(convertToNFT);
          setNftItems(convertedNFTs);
          setTotalCount(convertedNFTs.length);
        } else {
          throw new Error('Server returned unsuccessful response');
        }
      } catch (error) {
        console.error('Error loading NFTs from server:', error);
        console.warn('Using fallback NFT data');
        
        // Используем fallback данные
        setNftItems(fallbackNFTs);
        setTotalCount(fallbackNFTs.length);
        setError('Подключение к серверу недоступно. Показаны демо данные.');
      } finally {
        setLoading(false);
      }
    };

    loadNFTs();
  }, []); // Убираем dependencies чтобы загрузка не повторялась

  const activeGames = getActiveGames();
  const games = ["all", ...activeGames.map((game) => game.name)];
  const rarities = ["all", "Common", "Rare", "Epic", "Legendary"];

  // Фильтрация по редкости (клиентская фильтрация)
  const filteredNFTs = nftItems.filter((nft) => {
    const matchesRarity = selectedRarity === "all" || nft.rarity === selectedRarity;
    const matchesSearch = searchQuery === "" || 
      nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === "all" || nft.game === selectedGame;
    
    return matchesRarity && matchesSearch && matchesGame;
  });

  // Обработчик покупки NFT
  const handleNFTPurchase = (purchasedNFT: NFT) => {
    // Удаляем купленный NFT из каталога
    setNftItems(prev => prev.filter(nft => nft.id !== purchasedNFT.id));
    setTotalCount(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-screen-2xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Каталог NFT</h1>
          <p className="text-muted-foreground">
            Исследуйте коллекцию уникальных игровых предметов от лучших
            разработчиков
          </p>
        </div>

        {/* Filters */}
        <Card className="gradient-card border-border/50 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск NFT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger>
                  <SelectValue placeholder="Игра" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game} value={game}>
                      {game === "all" ? "Все игры" : game}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                <SelectTrigger>
                  <SelectValue placeholder="Редкость" />
                </SelectTrigger>
                <SelectContent>
                  {rarities.map((rarity) => (
                    <SelectItem key={rarity} value={rarity}>
                      {rarity === "all" ? "Все редкости" : rarity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Новые</SelectItem>
                  <SelectItem value="oldest">Старые</SelectItem>
                  <SelectItem value="price-high">Дорогие</SelectItem>
                  <SelectItem value="price-low">Дешевые</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {loading ? "Загрузка..." : `${filteredNFTs.length} из ${totalCount} предметов`}
              </Badge>
              {error && (
                <Badge variant="destructive">
                  Ошибка загрузки
                </Badge>
              )}
            </div>              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NFT Grid */}
        {loading ? (
          <Card className="gradient-card border-border/50">
            <CardContent className="p-12 text-center">
              <Loader2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold mb-2">Загрузка NFT...</h3>
              <p className="text-muted-foreground">
                Получаем данные с сервера
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="gradient-card border-border/50">
            <CardContent className="p-12 text-center">
              <Filter className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ошибка загрузки</h3>
              <p className="text-muted-foreground mb-4">
                {error}
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Обновить страницу
              </Button>
            </CardContent>
          </Card>
        ) : filteredNFTs.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {filteredNFTs.map((nft) => (
              <div
                key={nft.id}
                className={viewMode === "list" ? "max-w-2xl" : ""}
              >
                <NFTCard 
                  key={nft.id} 
                  nft={nft} 
                  onPurchase={handleNFTPurchase}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="gradient-card border-border/50">
            <CardContent className="p-12 text-center">
              <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-muted-foreground mb-4">
                Попробуйте изменить фильтры или поисковый запрос
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGame("all");
                  setSelectedRarity("all");
                }}
              >
                Сбросить фильтры
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Catalog;
