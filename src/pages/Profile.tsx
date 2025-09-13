import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, Copy, ExternalLink, Settings, Plus, User, AlertCircle } from "lucide-react";
import { WalletConnectWithUsername } from "@/components/wallet/WalletConnectWithUsername";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useUserData } from "@/hooks/useUserData";
import { useNFTStore } from "@/contexts/NFTContext";
import NFTCard, { NFT } from "@/components/nft/NFTCard";
import CreateNFTModal from "@/components/nft/CreateNFTModal";
import { toast } from "sonner";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("owned");
  const [username, setUsernameLocal] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const location = useLocation();
  const { connected, address, balance, formatAddress, connect, connecting, isPhantomInstalled } = useSolanaWallet();
  const { username: savedUsername, isLoggedIn, joinDate, setUsername: saveUsername } = useUserData();
  const {
    ownedNFTs,
    listedNFTs,
    soldNFTs,
    purchaseHistory,
    loading,
    loadUserNFTs,
    listNFT,
    unlistNFT,
  } = useNFTStore();

  // Загружаем NFT пользователя при подключении кошелька (только один раз)
  useEffect(() => {
    if (connected && address && !loading) {
      loadUserNFTs(address);
    }
  }, [connected, address]); // Убираем loadUserNFTs из зависимостей

  // Принудительное обновление данных при переходе на страницу профиля
  useEffect(() => {
    const handleFocus = () => {
      if (connected && address) {
        loadUserNFTs(address);
      }
    };

    // Обновляем данные при фокусе на окне (например, после покупки)
    window.addEventListener('focus', handleFocus);
    
    // Также обновляем при каждом рендере страницы профиля
    if (connected && address) {
      loadUserNFTs(address);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [location]); // Зависимость от изменения роута

  // Данные пользователя
  const user = {
    username: savedUsername || "Пользователь",
    joinDate: joinDate || "Неизвестно",
    totalNFTs: ownedNFTs.length,
    totalSales: soldNFTs.length,
  };

  const handleConnectWallet = async () => {
    try {
      await connect();
      toast.success('Кошелек успешно подключен!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка подключения кошелька');
    }
  };

  const handleCreateProfile = () => {
    if (username.trim() && connected) {
      saveUsername(username.trim());
      setUsernameLocal('');
      toast.success('Профиль создан успешно!');
    } else if (!connected) {
      toast.error('Сначала подключите кошелек');
    } else {
      toast.error('Введите корректный никнейм');
    }
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

  const handleListNFT = async (nft: NFT) => {
    // Здесь будет логика выставления NFT на продажу
    if (!address) {
      toast.error("Адрес кошелька не найден");
      return;
    }
    
    try {
      // Используем текущую цену NFT или устанавливаем по умолчанию
      const price = nft.price || 1.0;
      await listNFT(nft, price, address);
      toast.success(`${nft.title} выставлен на продажу`);
    } catch (error) {
      toast.error("Ошибка при выставлении NFT на продажу");
    }
  };

  const handleUnlistNFT = async (nftId: string) => {
    // Здесь будет логика снятия NFT с продажи
    if (!address) {
      toast.error("Адрес кошелька не найден");
      return;
    }
    
    try {
      await unlistNFT(nftId, address);
      const nft = listedNFTs.find((n) => n.id === nftId);
      toast.success(`${nft?.title || "NFT"} снят с продажи`);
    } catch (error) {
      toast.error("Ошибка при снятии NFT с продажи");
    }
  };

  const handleCreateNFTSuccess = () => {
    // Обновляем список NFT пользователя после создания
    if (address) {
      loadUserNFTs(address);
    }
  };

  // Если кошелек не подключен или пользователь не вошел
  if (!connected || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-screen-2xl py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-lg w-full">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Создание профиля</CardTitle>
                <p className="text-muted-foreground">
                  Подключите кошелек и создайте профиль для доступа к маркетплейсу
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Подключение кошелька */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Шаг 1: Подключение кошелька
                    </h3>
                    {connected && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Подключен
                      </Badge>
                    )}
                  </div>
                  
                  {!connected ? (
                    <div className="space-y-4">
                      {!isPhantomInstalled ? (
                        <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-orange-800">Phantom кошелек не найден</h4>
                              <p className="text-sm text-orange-700 mt-1">
                                Установите расширение Phantom для браузера
                              </p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={() => window.open('https://phantom.app/', '_blank')}
                              >
                                Скачать Phantom
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={handleConnectWallet} 
                          disabled={connecting}
                          className="w-full gradient-solana text-white"
                          size="lg"
                        >
                          {connecting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Подключение...
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-2 h-4 w-4" />
                              Подключить Phantom кошелек
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Wallet className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Кошелек подключен</p>
                          <p className="text-sm text-green-700 font-mono">{formatAddress(address)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Создание профиля */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Шаг 2: Создание профиля
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Никнейм</Label>
                      <Input
                        id="username"
                        placeholder="Введите ваш никнейм"
                        value={username}
                        onChange={(e) => setUsernameLocal(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateProfile()}
                        disabled={!connected}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleCreateProfile} 
                      disabled={!username.trim() || !connected}
                      className="w-full gradient-solana text-white"
                      size="lg"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Создать профиль
                    </Button>
                  </div>
                </div>

                {!connected && (
                  <p className="text-xs text-muted-foreground text-center">
                    Для создания профиля необходимо подключить кошелек
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Моя коллекция ({ownedNFTs.length})</h3>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="gradient-solana text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Создать NFT
              </Button>
            </div>
            
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
                    У вас пока нет NFT. Создайте свой первый NFT или купите в каталоге!
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="gradient-solana text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Создать NFT
                    </Button>
                    <Button variant="outline">Перейти в каталог</Button>
                  </div>
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

        {/* Модалка создания NFT */}
        <CreateNFTModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateNFTSuccess}
          userAddress={address || ""}
        />
      </div>
    </div>
  );
};

export default Profile;
