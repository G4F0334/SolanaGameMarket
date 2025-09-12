import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useNFTStore } from "@/contexts/NFTContext";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { toast } from "sonner";
import React from "react";

export interface NFT {
  id: string;
  title: string;
  image: string;
  price: number;
  currency: string;
  game: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  seller: string;
}

interface NFTCardProps {
  nft: NFT;
  showBuyButton?: boolean;
  onPurchase?: (nft: NFT) => void;
}

const rarityColors = {
  Common: "bg-slate-500",
  Rare: "bg-blue-500", 
  Epic: "bg-purple-500",
  Legendary: "bg-amber-500"
};

const NFTCard = ({ nft, showBuyButton = true, onPurchase }: NFTCardProps) => {
  const { addToPurchaseHistory } = useNFTStore();
  const { connected, balance } = useSolanaWallet();

  const handlePurchase = (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    
    if (!connected) {
      toast.error('Подключите кошелек для покупки NFT');
      return;
    }

    if (balance < nft.price) {
      toast.error('Недостаточно средств на балансе');
      return;
    }

    // Имитация покупки
    addToPurchaseHistory(nft);
    toast.success(`Вы успешно купили ${nft.title} за ${nft.price} ${nft.currency}!`);
    
    if (onPurchase) {
      onPurchase(nft);
    }
  };

  return (
    <Link to={`/nft/${nft.id}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card hover:scale-105 gradient-card border-border/50">
        <div className="relative overflow-hidden">
          <img
            src={nft.image}
            alt={nft.title}
            className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Overlays */}
          <div className="absolute top-2 left-2">
            <Badge className={`${rarityColors[nft.rarity]} text-white border-none`}>
              {nft.rarity}
            </Badge>
          </div>
          
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {nft.game}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {nft.title}
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-primary">
                  {nft.price} {nft.currency}
                </div>
                <div className="text-xs text-muted-foreground">
                  by {nft.seller}
                </div>
              </div>
              
              {showBuyButton && (
                <Button 
                  size="sm" 
                  variant="default" 
                  className="gradient-solana text-white"
                  onClick={handlePurchase}
                  disabled={!connected || balance < nft.price}
                >
                  {!connected ? 'Подключите кошелек' : 
                   balance < nft.price ? 'Недостаточно SOL' : 'Купить'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default NFTCard;