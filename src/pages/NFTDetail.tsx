import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Share2, Flag, Clock, ShoppingCart } from "lucide-react";
import { NFT } from "@/components/nft/NFTCard";
import dragonSwordImg from "@/assets/dragon-sword.jpg";

const NFTDetail = () => {
  const { id } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isConnected] = useState(true); // Mock - будет получаться из контекста авторизации

  // Mock данные - в будущем будут загружаться с бэкенда по ID
  const nft: NFT = {
    id: id || "1",
    title: "Dragon Sword of Flames",
    image: dragonSwordImg,
    price: 2.5,
    currency: "SOL",
    game: "Fantasy Quest",
    rarity: "Legendary",
    seller: "DragonMaster"
  };

  const rarityColors = {
    Common: "bg-slate-500",
    Rare: "bg-blue-500",
    Epic: "bg-purple-500", 
    Legendary: "bg-amber-500"
  };

  const handleBuy = () => {
    // Логика покупки NFT
    console.log("Покупка NFT", nft.id);
  };

  const similarNFTs: NFT[] = [
    {
      id: "2",
      title: "Lightning Bow",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop",
      price: 1.2,
      currency: "SOL",
      game: "Fantasy Quest",
      rarity: "Rare",
      seller: "ElvenArcher"
    },
    {
      id: "4",
      title: "Fire Staff",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=300&fit=crop",
      price: 1.8,
      currency: "SOL",
      game: "Fantasy Quest",
      rarity: "Epic",
      seller: "FireMage"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-screen-2xl py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Главная</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-primary">Каталог</Link>
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
                <Badge className={`${rarityColors[nft.rarity]} text-white border-none`}>
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
                    <div className="text-sm text-muted-foreground">Текущая цена</div>
                    <div className="text-3xl font-bold text-primary">
                      {nft.price} {nft.currency}
                    </div>
                    <div className="text-sm text-muted-foreground">≈ $156.25 USD</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Заканчивается через</div>
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
              {isConnected ? (
                <Button 
                  onClick={handleBuy}
                  className="w-full gradient-solana text-white glow-solana"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Купить сейчас
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
                  <AvatarFallback>{nft.seller[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{nft.seller}</div>
                  <div className="text-sm text-muted-foreground">Подтвержденный продавец</div>
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
              <Card key={similarNft.id} className="group overflow-hidden transition-all duration-300 hover:shadow-card gradient-card border-border/50">
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