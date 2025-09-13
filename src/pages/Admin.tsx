import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Shield,
  Plus,
  Package,
  Gamepad2,
  Users,
  TrendingUp,
  Settings,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useNFTStore } from "@/contexts/NFTContext";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { toast } from "sonner";
import AddProductForm from "@/components/admin/AddProductForm";
import AddNFTForm from "@/components/admin/AddNFTForm";
import GameManagement from "@/components/admin/GameManagement";
import AdminStats from "@/components/admin/AdminStats";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const { connected } = useSolanaWallet();
  const { ownedNFTs, listedNFTs } = useNFTStore();

  // Простая авторизация для админки
  const handleLogin = () => {
    if (adminKey === "1234") {
      setIsAuthenticated(true);
      toast.success("Добро пожаловать в админ панель!");
    } else {
      toast.error("Неверный ключ доступа");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey("");
    toast.success("Выход из админ панели");
  };

  // Если не авторизован
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Админ панель</CardTitle>
            <p className="text-muted-foreground">
              Введите ключ доступа для входа в админ панель
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ключ доступа</label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Введите ключ..."
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Войти в админ панель
            </Button>
            <div className="text-xs text-muted-foreground text-center"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Статистика для админки
  const stats = {
    totalProducts: ownedNFTs.length + listedNFTs.length,
    activeListings: listedNFTs.length,
    totalGames: new Set([...ownedNFTs, ...listedNFTs].map((nft) => nft.game))
      .size,
    totalUsers: 1, // Mock данные
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-screen-2xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Админ панель
            </h1>
            <p className="text-muted-foreground">
              Управление товарами и играми маркетплейса
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-green-500/20 text-green-400 border-green-500/30"
            >
              {connected ? "Кошелек подключен" : "Кошелек не подключен"}
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                Всего товаров
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">В каталоге</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Активные продажи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.activeListings}
              </div>
              <p className="text-xs text-muted-foreground">На продаже</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gamepad2 className="h-4 w-4" />
                Игры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalGames}
              </div>
              <p className="text-xs text-muted-foreground">Поддерживаемых</p>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Пользователи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stats.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">Активных</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Панель управления</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="games">Игры</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AdminStats />
          </TabsContent>

          <TabsContent value="products">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Управление товарами</h2>
                <Dialog
                  open={isAddProductModalOpen}
                  onOpenChange={setIsAddProductModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="gradient-solana text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить NFT
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Добавить новый NFT
                      </DialogTitle>
                    </DialogHeader>
                    <AddNFTForm
                      onClose={() => setIsAddProductModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Список существующих товаров */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Существующие товары</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ownedNFTs.map((nft) => (
                    <Card
                      key={nft.id}
                      className="gradient-card border-border/50"
                    >
                      <div className="relative">
                        <img
                          src={nft.image}
                          alt={nft.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <Badge
                          className={`absolute top-2 left-2 ${
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
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2">
                          {nft.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {nft.game}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
                            {nft.price} {nft.currency}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {ownedNFTs.length === 0 && (
                  <Card className="gradient-card border-border/50">
                    <CardContent className="p-12 text-center">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Нет товаров
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Добавьте первый товар в маркетплейс
                      </p>
                      <Button
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="gradient-solana text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить товар
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="games">
            <GameManagement />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Настройки системы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Сеть Solana</label>
                  <Badge variant="outline">Devnet (Тестовая)</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Статус подключения
                  </label>
                  <Badge variant={connected ? "default" : "destructive"}>
                    {connected ? "Подключено" : "Не подключено"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Версия приложения
                  </label>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
