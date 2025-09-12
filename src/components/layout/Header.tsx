import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { NetworkStatus } from "@/components/wallet/NetworkStatus";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";
import { useUserData } from "@/hooks/useUserData";
import UserProfile from "@/components/ui/user-profile";

const Header = () => {
  const [tempUsername, setTempUsername] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const location = useLocation();
  const { connected, address, connecting } = useSolanaWallet();
  const { username, isLoggedIn, joinDate, setUsername, logout } = useUserData();

  // Отслеживание подключения кошелька для показа модала имени пользователя
  useEffect(() => {
    console.log('Header: состояние изменилось', { connected, isLoggedIn, connecting, address });
    
    // Показываем модал только если кошелек подключен, но пользователь не авторизован
    // и процесс подключения завершен
    if (connected && !connecting && !isLoggedIn && address) {
      console.log('Header: показываем модал имени пользователя');
      setShowUsernameModal(true);
    }
  }, [connected, isLoggedIn, connecting, address]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      setTempUsername("");
      setShowUsernameModal(false);
    }
  };

  const handleDisconnect = () => {
    logout();
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
                className={`text-sm font-medium transition-all duration-300 hover:text-white ${
                  isActivePath("/") 
                    ? "text-white bg-gradient-to-r from-solana-purple to-solana-green px-4 py-2 rounded-full shadow-lg" 
                    : "text-muted-foreground"
                }`}
              >
                Главная
              </Link>
              <Link
                to="/catalog"
                className={`text-sm font-medium transition-all duration-300 hover:text-white ${
                  isActivePath("/catalog") 
                    ? "text-white bg-gradient-to-r from-solana-purple to-solana-green px-4 py-2 rounded-full shadow-lg" 
                    : "text-muted-foreground"
                }`}
              >
                Каталог
              </Link>
              <Link
                to="/profile"
                className={`text-sm font-medium transition-all duration-300 hover:text-white ${
                  isActivePath("/profile") 
                    ? "text-white bg-gradient-to-r from-solana-purple to-solana-green px-4 py-2 rounded-full shadow-lg" 
                    : "text-muted-foreground"
                }`}
              >
                Профиль
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <NetworkStatus />
            </div>
            {connected && isLoggedIn && !connecting ? (
              <UserProfile 
                username={username}
                walletAddress={address || ""}
                onDisconnect={handleDisconnect}
              />
            ) : (
              <WalletConnect />
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
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
              />
            </div>
            <Button 
              onClick={handleUsernameSubmit} 
              className="w-full gradient-solana text-white"
              disabled={!tempUsername.trim()}
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