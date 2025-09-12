import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List } from "lucide-react";
import NFTCard, { NFT } from "@/components/nft/NFTCard";

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedRarity, setSelectedRarity] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Mock данные - в будущем будут загружаться с бэкенда
  const allNFTs: NFT[] = [
    {
      id: "1",
      title: "Dragon Sword of Flames",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      price: 2.5,
      currency: "SOL",
      game: "Fantasy Quest",
      rarity: "Legendary",
      seller: "DragonMaster"
    },
    {
      id: "2",
      title: "Cyberpunk Armor Set",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop",
      price: 1.8,
      currency: "SOL",
      game: "Cyber City",
      rarity: "Epic",
      seller: "CyberWarrior"
    },
    {
      id: "3",
      title: "Mystic Staff",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
      price: 0.9,
      currency: "SOL",
      game: "Magic Realm",
      rarity: "Rare",
      seller: "MagicUser"
    },
    {
      id: "4",
      title: "Lightning Bow",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
      price: 1.2,
      currency: "SOL",
      game: "Fantasy Quest", 
      rarity: "Rare",
      seller: "ElvenArcher"
    },
    {
      id: "5",
      title: "Plasma Rifle",
      image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=400&h=400&fit=crop",
      price: 3.1,
      currency: "SOL",
      game: "Space Warriors",
      rarity: "Legendary",
      seller: "SpaceCommander"
    },
    {
      id: "6",
      title: "Crystal Shield",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=400&fit=crop",
      price: 0.7,
      currency: "SOL",
      game: "Magic Realm",
      rarity: "Common",
      seller: "CrystalMage"
    }
  ];

  const games = ["all", "Fantasy Quest", "Cyber City", "Magic Realm", "Space Warriors"];
  const rarities = ["all", "Common", "Rare", "Epic", "Legendary"];

  const filteredNFTs = allNFTs.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === "all" || nft.game === selectedGame;
    const matchesRarity = selectedRarity === "all" || nft.rarity === selectedRarity;
    
    return matchesSearch && matchesGame && matchesRarity;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-screen-2xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Каталог NFT</h1>
          <p className="text-muted-foreground">
            Исследуйте коллекцию уникальных игровых предметов от лучших разработчиков
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
                  {games.map(game => (
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
                  {rarities.map(rarity => (
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
                  {filteredNFTs.length} предметов найдено
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
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
        {filteredNFTs.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {filteredNFTs.map((nft) => (
              <div key={nft.id} className={viewMode === "list" ? "max-w-2xl" : ""}>
                <NFTCard key={nft.id} nft={nft} />
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