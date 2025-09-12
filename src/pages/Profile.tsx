import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, Copy, ExternalLink, Settings } from "lucide-react";
import NFTCard, { NFT } from "@/components/nft/NFTCard";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("owned");

  // Mock данные пользователя
  const user = {
    username: "DragonMaster",
    walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    joinDate: "Март 2024",
    totalValue: 12.8,
    totalNFTs: 15,
    totalSales: 8
  };

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(user.walletAddress);
  };

  // Mock NFTs пользователя
  const ownedNFTs: NFT[] = [
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
      title: "Lightning Bow",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
      price: 1.2,
      currency: "SOL",
      game: "Fantasy Quest",
      rarity: "Rare",
      seller: "DragonMaster"
    },
    {
      id: "3",
      title: "Fire Staff",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop",
      price: 1.8,
      currency: "SOL",
      game: "Magic Realm",
      rarity: "Epic",
      seller: "DragonMaster"
    }
  ];

  const listedNFTs: NFT[] = [
    ownedNFTs[0] // Dragon Sword выставлен на продажу
  ];

  const soldNFTs: NFT[] = [
    {
      id: "4",
      title: "Crystal Armor",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop",
      price: 3.2,
      currency: "SOL",
      game: "Cyber City",
      rarity: "Epic",
      seller: "DragonMaster"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-screen-2xl py-8">
        {/* Profile Header */}
        <Card className="gradient-card border-border/50 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user.username[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{user.username}</h1>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    <span className="font-mono">
                      {`${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-8)}`}
                    </span>
                    <Button variant="ghost" size="sm" onClick={copyWalletAddress}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Участник с {user.joinDate}
                  </div>
                </div>
              </div>
              
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Настройки
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Общая стоимость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {user.totalValue} SOL
              </div>
              <p className="text-xs text-muted-foreground">
                ≈ ${(user.totalValue * 62.5).toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                NFT в коллекции
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {user.totalNFTs}
              </div>
              <p className="text-xs text-muted-foreground">
                В {new Set(ownedNFTs.map(nft => nft.game)).size} играх
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Продано NFT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {user.totalSales}
              </div>
              <p className="text-xs text-muted-foreground">
                Общий объем: 15.2 SOL
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="owned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="owned">Коллекция ({ownedNFTs.length})</TabsTrigger>
            <TabsTrigger value="listed">На продаже ({listedNFTs.length})</TabsTrigger>
            <TabsTrigger value="sold">Проданные ({soldNFTs.length})</TabsTrigger>
            <TabsTrigger value="activity">Активность</TabsTrigger>
          </TabsList>

          <TabsContent value="owned">
            {ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ownedNFTs.map((nft) => (
                  <NFTCard key={nft.id} nft={nft} showBuyButton={false} />
                ))}
              </div>
            ) : (
              <Card className="gradient-card border-border/50">
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">Коллекция пуста</h3>
                  <p className="text-muted-foreground mb-4">
                    У вас пока нет NFT. Исследуйте каталог и найдите свой первый предмет!
                  </p>
                  <Button variant="outline">Перейти в каталог</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="listed">
            {listedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listedNFTs.map((nft) => (
                  <div key={nft.id} className="relative">
                    <NFTCard nft={nft} showBuyButton={false} />
                    <Badge className="absolute top-2 right-2 bg-primary">
                      На продаже
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="gradient-card border-border/50">
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">Нет NFT на продаже</h3>
                  <p className="text-muted-foreground">
                    Вы не выставили ни одного NFT на продажу
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sold">
            {soldNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {soldNFTs.map((nft) => (
                  <div key={nft.id} className="relative opacity-75">
                    <NFTCard nft={nft} showBuyButton={false} />
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      Продано
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="gradient-card border-border/50">
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">Нет продаж</h3>
                  <p className="text-muted-foreground">
                    Вы еще не продали ни одного NFT
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <Card className="gradient-card border-border/50">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {[
                    { action: "Покупка", item: "Dragon Sword of Flames", price: "2.5 SOL", date: "2 часа назад", type: "buy" },
                    { action: "Продажа", item: "Crystal Armor", price: "3.2 SOL", date: "1 день назад", type: "sell" },
                    { action: "Выставлено", item: "Dragon Sword of Flames", price: "2.5 SOL", date: "3 дня назад", type: "list" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary">
                      <div>
                        <div className="font-medium">{activity.action}: {activity.item}</div>
                        <div className="text-sm text-muted-foreground">{activity.date}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{activity.price}</div>
                        <Badge 
                          variant="secondary"
                          className={
                            activity.type === "buy" ? "bg-green-500/20 text-green-400" :
                            activity.type === "sell" ? "bg-red-500/20 text-red-400" :
                            "bg-blue-500/20 text-blue-400"
                          }
                        >
                          {activity.action}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;