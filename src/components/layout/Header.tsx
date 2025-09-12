import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet } from "lucide-react";
import UserProfile from "@/components/ui/user-profile";

const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [username, setUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const location = useLocation();

  const connectWallet = async () => {
    // Mock wallet connection - будет заменено реальной интеграцией с Solana
    const mockAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
    setWalletAddress(mockAddress);
    setShowUsernameModal(true);
  };

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsConnected(true);
      setShowUsernameModal(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    setUsername("");
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 gradient-solana rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold gradient-text">GameNFT</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
              <Link
                to="/"
                className={`text-sm font-medium transition-all duration-300 hover:text-primary ${
                  isActivePath("/") 
                    ? "text-white bg-gradient-to-r from-solana-purple to-solana-green px-4 py-2 rounded-full shadow-lg" 
                    : "text-muted-foreground"
                }`}
              >
                Главная
              </Link>
              <Link
                to="/catalog"
                className={`text-sm font-medium transition-all duration-300 hover:text-primary ${
                  isActivePath("/catalog") 
                    ? "text-white bg-gradient-to-r from-solana-purple to-solana-green px-4 py-2 rounded-full shadow-lg" 
                    : "text-muted-foreground"
                }`}
              >
                Каталог
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <UserProfile 
                username={username}
                walletAddress={walletAddress}
                onDisconnect={disconnect}
              />
            ) : (
              <Button onClick={connectWallet} variant="default" className="gradient-solana text-white">
                <Wallet className="mr-2 h-4 w-4" />
                Подключить кошелек
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Username Modal */}
      <Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добро пожаловать!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Введите ваш никнейм</Label>
              <Input
                id="username"
                placeholder="Введите никнейм"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
              />
            </div>
            <Button 
              onClick={handleUsernameSubmit} 
              className="w-full gradient-solana text-white"
              disabled={!username.trim()}
            >
              Продолжить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;