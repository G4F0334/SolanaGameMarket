import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Share2, Flag, Clock, ShoppingCart, Loader2 } from "lucide-react";
import { NFT } from "@/components/nft/NFTCard";
import { apiService } from "@/services/api";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useNFTStore } from "@/contexts/NFTContext";
import { toast } from "sonner";
import dragonSwordImg from "@/assets/dragon-sword.jpg";

const NFTDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const { connected, address, balance, updateBalance } = useSolanaWallet();
  const { buyNFT, addToPurchaseHistory } = useNFTStore();

  // Загрузка данных NFT
  useEffect(() => {
    const loadNFT = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.getNFTById(id);
        
        if (response.success && response.nft) {
          // Конвертируем данные с сервера в формат NFT
          const nftData: NFT = {
            id: response.nft.id.toString(),
            title: response.nft.name,
            image: response.nft.image || "/placeholder.svg",
            price: response.nft.price || 0,
            currency: "SOL",
            game: response.nft.game,
            rarity: response.nft.rarity || "Common",
            seller: response.nft.seller || "Unknown",
            sellerUsername: response.nft.sellerUsername,
            ownerAddress: response.nft.ownerAddress,
            description: response.nft.description
          };
          setNft(nftData);
        } else {
          setError("NFT не найден");
        }
      } catch (error) {
        console.error("Error loading NFT:", error);
        setError("Ошибка загрузки NFT");
      } finally {
        setLoading(false);
      }
    };

    loadNFT();
  }, [id]);

  // Проверяем, является ли пользователь владельцем
  const isOwner = address && nft && (nft.ownerAddress === address || nft.seller === address);

  const rarityColors = {
    Common: "bg-slate-500",
    Rare: "bg-blue-500",
    Epic: "bg-purple-500",
    Legendary: "bg-amber-500",
  };

  const handleBuy = async () => {
    if (!nft || !address) {
      toast.error("Подключите кошелек для покупки NFT");
      return;
    }

    if (balance < nft.price) {
      toast.error("Недостаточно средств на балансе");
      return;
    }

    try {
      setPurchasing(true);
      
      const result = await buyNFT(nft.id, address);
      
      if (result && result.success) {
        addToPurchaseHistory(nft);
        
        if (updateBalance) {
          await updateBalance();
        }
        
        toast.success(`Вы успешно купили ${nft.title} за ${nft.price} ${nft.currency}!`);
        
        // Обновляем данные NFT после покупки
        setNft(prev => prev ? { ...prev, ownerAddress: address } : null);

        // Редирект на страницу профиля после покупки
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        throw new Error(result?.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Ошибка при покупке NFT. Попробуйте еще раз.");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-screen-2xl py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="gradient-card border-border/50">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-semibold mb-2">Загрузка NFT...</h3>
                <p className="text-muted-foreground">
                  Получаем данные с сервера
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-screen-2xl py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="gradient-card border-border/50">
              <CardContent className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">Ошибка</h3>
                <p className="text-muted-foreground mb-4">
                  {error || "NFT не найден"}
                </p>
                <Link to="/catalog">
                  <Button variant="outline">
                    Вернуться в каталог
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const similarNFTs: NFT[] = [
    // TODO: Загружать похожие NFT из API
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-screen-2xl py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">
            Главная
          </Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-primary">
            Каталог
          </Link>
          <span>/</span>
          <span className="text-foreground">{nft.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={nft.image}
                alt={nft.title}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute top-4 left-4">
                <Badge
                  className={`${
                    rarityColors[nft.rarity]
                  } text-white border-none`}
                >
                  {nft.rarity}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {nft.game}
              </Badge>
              <h1 className="text-3xl font-bold mb-4">{nft.title}</h1>

              {/* Price */}
              <Card className="gradient-card border-border/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Текущая цена
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {nft.price} {nft.currency}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ $156.25 USD
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Заканчивается через
                    </div>
                    <div className="flex items-center text-sm font-semibold">
                      <Clock className="h-4 w-4 mr-1" />
                      2д 14ч 23м
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {connected && !isOwner ? (
                <Button
                  onClick={handleBuy}
                  className="w-full gradient-solana text-white glow-solana"
                  size="lg"
                  disabled={purchasing || balance < nft.price}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {purchasing
                    ? "Покупка..."
                    : balance < nft.price
                    ? "Недостаточно SOL"
                    : "Купить сейчас"}
                </Button>
              ) : isOwner ? (
                <Button variant="outline" size="lg" className="w-full" disabled>
                  Это ваш NFT
                </Button>
              ) : (
                <Button variant="outline" size="lg" className="w-full">
                  Подключите кошелек для покупки
                </Button>
              )}
            </div>

            <Separator />

            {/* Seller Info */}
            <div>
              <h3 className="font-semibold mb-4">Продавец</h3>
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-secondary">
                <Avatar>
                  <AvatarFallback>
                    {(nft.sellerUsername || nft.seller || "U")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">
                    {nft.sellerUsername || nft.seller || "Неизвестно"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Подтвержденный продавец
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Профиль
                </Button>
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div>
              <h3 className="font-semibold mb-4">Детали</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Тип контракта</span>
                  <span>Metaplex NFT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Блокчейн</span>
                  <span>Solana</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Редкость</span>
                  <span>{nft.rarity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Создан</span>
                  <span>15 мая 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar NFTs */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Похожие NFT</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarNFTs.map((similarNft) => (
              <Card
                key={similarNft.id}
                className="group overflow-hidden transition-all duration-300 hover:shadow-card gradient-card border-border/50"
              >
                <Link to={`/nft/${similarNft.id}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={similarNft.image}
                      alt={similarNft.title}
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{similarNft.title}</h3>
                    <div className="text-lg font-bold text-primary">
                      {similarNft.price} {similarNft.currency}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default NFTDetail;
