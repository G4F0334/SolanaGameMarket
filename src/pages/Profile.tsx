import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, Copy, ExternalLink, Settings, Plus } from "lucide-react";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { FaucetCard } from "@/components/wallet/FaucetCard";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useUserData } from "@/hooks/useUserData";
import { useNFTStore } from "@/contexts/NFTContext";
import NFTCard, { NFT } from "@/components/nft/NFTCard";
import { toast } from "sonner";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("owned");
  const { connected, address, balance, formatAddress } = useSolanaWallet();
  const { username, isLoggedIn, joinDate } = useUserData();
  const {
    ownedNFTs,
    listedNFTs,
    soldNFTs,
    purchaseHistory,
    listNFT,
    unlistNFT,
  } = useNFTStore();

  // Данные пользователя
  const user = {
    username: username || "Пользователь",
    joinDate: joinDate || "Неизвестно",
    totalNFTs: ownedNFTs.length,
    totalSales: soldNFTs.length,
  };

  const copyWalletAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Адрес кошелька скопирован");
    }
  };

  const openInExplorer = () => {
    if (address) {
      window.open(
        `https://explorer.solana.com/address/${address}?cluster=devnet`,
        "_blank"
      );
    }
  };

  // Если кошелек не подключен или пользователь не вошел
  if (!connected || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-screen-2xl py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
              <CardContent className="p-8 text-center">
                <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">
                  {!connected
                    ? "Кошелек не подключен"
                    : "Требуется авторизация"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {!connected
                    ? "Подключите Solana кошелек, чтобы просматривать свой профиль и управлять NFT"
                    : "Введите имя пользователя для завершения настройки профиля"}
                </p>
                <WalletConnect variant="card" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleListNFT = (nft: NFT) => {
    listNFT(nft);
    toast.success(`${nft.title} выставлен на продажу`);
  };

  const handleUnlistNFT = (nftId: string) => {
    const nft = listedNFTs.find((n) => n.id === nftId);
    unlistNFT(nftId);
    toast.success(`${nft?.title || "NFT"} снят с продажи`);
  };

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
                    <span className="font-mono">{formatAddress(address)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyWalletAddress}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={openInExplorer}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Общая стоимость
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {balance.toFixed(4)} SOL
              </div>
              <p className="text-xs text-muted-foreground">
                ≈ ${(balance * 62.5).toFixed(2)} USD
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
                В {new Set(ownedNFTs.map((nft) => nft.game)).size} играх
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

          {/* Faucet Card */}
          <FaucetCard />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="owned" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="owned">
              Коллекция ({ownedNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="listed">
              На продаже ({listedNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="sold">
              Проданные ({soldNFTs.length})
            </TabsTrigger>
            <TabsTrigger value="activity">Активность</TabsTrigger>
          </TabsList>

          <TabsContent value="owned">
            {ownedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {ownedNFTs.map((nft) => (
                  <div key={nft.id} className="relative group">
                    <NFTCard nft={nft} showBuyButton={false} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        onClick={() => handleListNFT(nft)}
                        className="bg-primary/90 hover:bg-primary"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Продать
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="gradient-card border-border/50">
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Коллекция пуста
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    У вас пока нет NFT. Исследуйте каталог и найдите свой первый
                    предмет!
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
                  <div key={nft.id} className="relative group">
                    <NFTCard nft={nft} showBuyButton={false} />
                    <Badge className="absolute top-2 left-2 bg-primary">
                      На продаже
                    </Badge>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnlistNFT(nft.id)}
                      >
                        Снять
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="gradient-card border-border/50">
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    Нет NFT на продаже
                  </h3>
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
                  {purchaseHistory.length > 0 ? (
                    purchaseHistory.slice(0, 10).map((nft, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary"
                      >
                        <div>
                          <div className="font-medium">
                            Покупка: {nft.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">
                            {nft.price} {nft.currency}
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-green-500/20 text-green-400"
                          >
                            Покупка
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        История активности пуста
                      </p>
                    </div>
                  )}
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
