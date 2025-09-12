import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Gamepad2,
  Shield,
  Wallet,
  ShoppingCart,
  ArrowLeftRight,
  ArrowDown,
} from "lucide-react";
import NFTCard, { NFT } from "@/components/nft/NFTCard";
import { useGamesStore } from "@/contexts/GamesContext";
import dragonSwordImg from "@/assets/dragon-sword.jpg";
import cyberArmorImg from "@/assets/cyber-armor.jpg";
import mysticStaffImg from "@/assets/mystic-staff.jpg";
import fantasyQuestImg from "@/assets/game-fantasy-quest.jpg";
import cyberCityImg from "@/assets/game-cyber-city.jpg";
import magicRealmImg from "@/assets/game-magic-realm.jpg";
import spaceWarriorsImg from "@/assets/game-space-warriors.jpg";
import battleArenaImg from "@/assets/game-battle-arena.jpg";

const Home = () => {
  const { getActiveGames } = useGamesStore();
  const activeGames = getActiveGames();

  // TODO: Заменить на API запрос
  // Mock данные - в будущем будут загружаться с бэкенда
  const featuredNFTs: NFT[] = [
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
      seller: "CyberWarrior",
    },
    {
      id: "3",
      title: "Mystic Staff",
      image: mysticStaffImg,
      price: 0.9,
      currency: "SOL",
      game: "Magic Realm",
      rarity: "Rare",
      seller: "MagicUser",
    },
    {
      id: "4",
      title: "Lightning Bow",
      image: battleArenaImg,
      price: 1.2,
      currency: "SOL",
      game: "Battle Arena",
      rarity: "Epic",
      seller: "ElvenArcher",
    },
  ];

  const stats = [
    { label: "Общий объем торгов", value: "12.4K SOL", icon: TrendingUp },
    { label: "Активные пользователи", value: "8,942", icon: Users },
    { label: "NFT в каталоге", value: "25,678", icon: Gamepad2 },
    { label: "Проверенные игры", value: "156", icon: Shield },
  ];

  // TODO: Добавить useEffect для загрузки статистики с API
  // useEffect(() => {
  //   const loadMarketStats = async () => {
  //     try {
  //       const response = await apiService.getMarketStats();
  //       if (response.success) {
  //         setMarketStats([
  //           { label: "Общий объем торгов", value: `${response.data.totalVolume} SOL`, icon: TrendingUp },
  //           { label: "Активные пользователи", value: response.data.activeUsers.toString(), icon: Users },
  //           { label: "NFT в каталоге", value: response.data.totalNFTs.toString(), icon: Gamepad2 },
  //           { label: "Проверенные игры", value: response.data.totalGames.toString(), icon: Shield },
  //         ]);
  //       }
  //     } catch (error) {
  //       console.error('Error loading market stats:', error);
  //     }
  //   };
  //   loadMarketStats();
  // }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 gradient-hero">
        <div className="container max-w-screen-2xl relative">
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Маркетплейс игровых{" "}
                <span className="gradient-text bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                  NFT
                </span>
              </h1>
              <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
                Покупайте, продавайте и обменивайтесь уникальными игровыми
                предметами на блокчейне Solana
              </p>
            </div>

            <div className="flex justify-center">
              <Link to="/catalog">
                <Button
                  size="lg"
                  className="gradient-solana text-white glow-solana text-lg px-8 py-4 h-auto"
                >
                  Исследовать каталог
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-24 border-b border-border/40">
        <div className="container max-w-screen-2xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Торговая панель</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Отслеживайте рыночную активность и управляйте своим портфелем NFT
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Real-time Stats Dashboard */}
            <Card className="gradient-card border-border/50 p-8">
              <h3 className="text-2xl font-bold mb-6">Рыночная статистика</h3>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center space-y-3">
                    <stat.icon className="h-10 w-10 text-primary mx-auto" />
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* SOL Price Chart */}
            <Card className="gradient-card border-border/50 p-8">
              <h3 className="text-2xl font-bold mb-6">Динамика цен SOL</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-primary">$24.67</div>
                  <div className="flex items-center text-green-500">
                    <TrendingUp className="h-5 w-5 mr-1" />
                    <span className="text-lg font-semibold">+5.2%</span>
                  </div>
                </div>
                <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-12 w-12 text-primary mx-auto" />
                    <p className="text-muted-foreground">График цен SOL</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/profile">
              <Card className="gradient-card border-border/50 p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Мой кошелек</h4>
                <p className="text-muted-foreground">Управляйте средствами</p>
              </Card>
            </Link>

            <Link to="/profile">
              <Card className="gradient-card border-border/50 p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <ShoppingCart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Мои покупки</h4>
                <p className="text-muted-foreground">История транзакций</p>
              </Card>
            </Link>

            <Link to="/profile">
              <Card className="gradient-card border-border/50 p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Gamepad2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">Мои NFT</h4>
                <p className="text-muted-foreground">Коллекция предметов</p>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured NFTs */}
      <section className="py-16">
        <div className="container max-w-screen-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Популярные NFT</h2>
              <p className="text-muted-foreground mt-2">
                Самые востребованные игровые предметы
              </p>
            </div>
            <Link to="/catalog">
              <Button variant="outline">Смотреть все</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 border-t border-border/40">
        <div className="container max-w-screen-2xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Как это работает</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Простой жизненный цикл пользователя на нашем маркетплейсе игровых
              NFT
            </p>
          </div>

          {/* Vertical Timeline Schema */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              {/* Central vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/60 to-primary"></div>

              {/* Step 1 - Left */}
              <div className="relative flex items-center mb-16">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-card border border-border/50 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-end space-x-3 mb-3">
                      <h3 className="text-xl font-semibold">
                        Подключение кошелька
                      </h3>
                      <div className="w-8 h-8 rounded-full gradient-solana text-white flex items-center justify-center text-lg font-bold">
                        1
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Подключите Solana кошелек для начала работы
                    </p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full gradient-solana ring-4 ring-background text-white flex items-center justify-center shadow-lg z-10">
                  <Wallet className="h-6 w-6" />
                </div>
                <div className="w-1/2 pl-8"></div>
              </div>

              {/* Arrow Down */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 z-20">
                <ArrowDown className="h-6 w-6 text-primary" />
              </div>

              {/* Step 2 - Right */}
              <div className="relative flex items-center mb-16">
                <div className="w-1/2 pr-8"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full gradient-solana ring-4 ring-background text-white flex items-center justify-center shadow-lg z-10">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="w-1/2 pl-8">
                  <div className="bg-card border border-border/50 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 rounded-full gradient-solana text-white flex items-center justify-center text-lg font-bold">
                        2
                      </div>
                      <h3 className="text-xl font-semibold">Покупка NFT</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Выберите и приобретите игровые предметы
                    </p>
                  </div>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 z-20">
                <ArrowDown className="h-6 w-6 text-primary" />
              </div>

              {/* Step 3 - Left */}
              <div className="relative flex items-center mb-16">
                <div className="w-1/2 pr-8 text-right">
                  <div className="bg-card border border-border/50 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-end space-x-3 mb-3">
                      <h3 className="text-xl font-semibold">
                        Использование в играх
                      </h3>
                      <div className="w-8 h-8 rounded-full gradient-solana text-white flex items-center justify-center text-lg font-bold">
                        3
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Применяйте NFT в поддерживаемых играх
                    </p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full gradient-solana ring-4 ring-background text-white flex items-center justify-center shadow-lg z-10">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <div className="w-1/2 pl-8"></div>
              </div>

              {/* Arrow Down */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-8 z-20">
                <ArrowDown className="h-6 w-6 text-primary" />
              </div>

              {/* Step 4 - Right */}
              <div className="relative flex items-center">
                <div className="w-1/2 pr-8"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full gradient-solana ring-4 ring-background text-white flex items-center justify-center shadow-lg z-10">
                  <ArrowLeftRight className="h-6 w-6" />
                </div>
                <div className="w-1/2 pl-8">
                  <div className="bg-card border border-border/50 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 rounded-full gradient-solana text-white flex items-center justify-center text-lg font-bold">
                        4
                      </div>
                      <h3 className="text-xl font-semibold">Продажа и обмен</h3>
                    </div>
                    <p className="text-muted-foreground">
                      Продавайте и обменивайтесь предметами
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/catalog">
              <Button
                size="lg"
                className="gradient-solana text-white glow-solana"
              >
                Начать торговлю
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-16 gradient-hero border-t border-border/40">
        <div className="container mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Поддерживаемые игры</h2>
            <p className="text-muted-foreground">
              Мы работаем с лучшими играми и разработчиками для создания
              уникальной экосистемы игровых NFT
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {activeGames.slice(0, 4).map((game) => (
                <Card
                  key={game.id}
                  className="group w-full rounded-lg bg-card border-2 border-transparent transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                  style={{
                    borderImage: "linear-gradient(90deg, #3B82F6, #14F195) 1",
                  }}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={game.image || cyberCityImg}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {game.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {game.category} • {game.nftCount} NFT
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8">
              <Link to="/catalog">
                <Button size="lg" variant="outline">
                  Подробнее
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
