import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Gamepad2,
  Users,
  DollarSign,
  Activity,
  Star,
} from "lucide-react";
import { useNFTStore } from "@/contexts/NFTContext";
import { useGamesStore } from "@/contexts/GamesContext";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";

const AdminStats = () => {
  const { ownedNFTs, listedNFTs, soldNFTs } = useNFTStore();
  const { games } = useGamesStore();
  const { balance } = useSolanaWallet();

  // Расчет статистики
  const totalProducts = ownedNFTs.length + listedNFTs.length;
  const activeListings = listedNFTs.length;
  const totalGames = games.filter((game) => game.status === "active").length;
  const totalVolume = [...ownedNFTs, ...listedNFTs].reduce(
    (sum, nft) => sum + nft.price,
    0
  );
  const averagePrice = totalProducts > 0 ? totalVolume / totalProducts : 0;

  // Топ игры по количеству NFT
  const gameStats = [...ownedNFTs, ...listedNFTs].reduce((acc, nft) => {
    acc[nft.game] = (acc[nft.game] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topGames = Object.entries(gameStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Статистика по редкости
  const rarityStats = [...ownedNFTs, ...listedNFTs].reduce((acc, nft) => {
    acc[nft.rarity] = (acc[nft.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Недавние добавления (последние 5)
  const recentNFTs = [...ownedNFTs, ...listedNFTs]
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Всего товаров
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalProducts}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />+
              {activeListings} на продаже
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Общий объем
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalVolume.toFixed(2)} SOL
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Средняя цена: {averagePrice.toFixed(2)} SOL
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Активные игры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalGames}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Activity className="h-3 w-3 mr-1 text-blue-500" />
              Поддерживаемых
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Проданные NFT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {soldNFTs.length}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Успешных продаж
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Топ игры */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Топ игры по количеству NFT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topGames.length > 0 ? (
                topGames.map(([game, count], index) => (
                  <div key={game} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{game}</div>
                        <div className="text-sm text-muted-foreground">
                          {count} NFT
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {((count / totalProducts) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Gamepad2 className="h-12 w-12 mx-auto mb-2" />
                  <p>Нет данных о играх</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Статистика по редкости */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Распределение по редкости
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(rarityStats).map(([rarity, count]) => {
                const percentage = (count / totalProducts) * 100;
                const rarityColors = {
                  Common: "bg-slate-500",
                  Rare: "bg-blue-500",
                  Epic: "bg-purple-500",
                  Legendary: "bg-amber-500",
                };

                return (
                  <div key={rarity} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            rarityColors[rarity as keyof typeof rarityColors]
                          }`}
                        />
                        <span className="font-medium">{rarity}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {count} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          rarityColors[rarity as keyof typeof rarityColors]
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Недавние добавления */}
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Недавние добавления
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentNFTs.length > 0 ? (
            <div className="space-y-4">
              {recentNFTs.map((nft) => (
                <div
                  key={nft.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden">
                    <img
                      src={nft.image}
                      alt={nft.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{nft.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {nft.game}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">
                      {nft.price} {nft.currency}
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        nft.rarity === "Common"
                          ? "bg-slate-500"
                          : nft.rarity === "Rare"
                          ? "bg-blue-500"
                          : nft.rarity === "Epic"
                          ? "bg-purple-500"
                          : "bg-amber-500"
                      } text-white border-none`}
                    >
                      {nft.rarity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2" />
              <p>Нет недавних добавлений</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Системная информация */}
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle>Системная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <div className="font-medium">Сеть</div>
              <Badge variant="outline">Solana Devnet</Badge>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Баланс кошелька</div>
              <div className="font-mono">{balance.toFixed(4)} SOL</div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Статус</div>
              <Badge variant="default" className="bg-green-500">
                Активен
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
