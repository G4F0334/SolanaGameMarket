import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  LogOut, 
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { toast } from 'sonner';

interface WalletConnectProps {
  variant?: 'button' | 'card';
  size?: 'sm' | 'default' | 'lg';
}

export const WalletConnect = ({ variant = 'button', size = 'default' }: WalletConnectProps) => {
  const {
    connected,
    connecting,
    balance,
    address,
    connect,
    disconnect,
    refreshBalance,
    formatAddress,
    isPhantomInstalled
  } = useSolanaWallet();

  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('Кошелек успешно подключен!');
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка подключения кошелька');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success('Кошелек отключен');
      setIsOpen(false);
    } catch (error) {
      toast.error('Ошибка отключения кошелька');
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Адрес скопирован в буфер обмена');
    }
  };

  const openInExplorer = () => {
    if (address) {
      window.open(`https://explorer.solana.com/address/${address}?cluster=devnet`, '_blank');
    }
  };

  const handleRefreshBalance = async () => {
    try {
      await refreshBalance();
      toast.success('Баланс обновлен');
    } catch (error) {
      toast.error('Ошибка обновления баланса');
    }
  };

  // Если кошелек не подключен
  if (!connected) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {variant === 'button' ? (
            <Button size={size} disabled={connecting}>
              <Wallet className="mr-2 h-4 w-4" />
              {connecting ? 'Подключение...' : 'Подключить кошелек'}
            </Button>
          ) : (
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-6 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Подключить кошелек</h3>
                <p className="text-muted-foreground text-sm">
                  Подключите Solana кошелек для начала торговли
                </p>
              </CardContent>
            </Card>
          )}
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Подключение кошелька</DialogTitle>
            <DialogDescription>
              Выберите кошелек для подключения к маркетплейсу
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {!isPhantomInstalled ? (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-orange-700">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Phantom не установлен</p>
                      <p className="text-sm">
                        Установите расширение Phantom для подключения
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="mt-3 w-full" 
                    variant="outline"
                    onClick={() => window.open('https://phantom.app/', '_blank')}
                  >
                    Установить Phantom
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full h-14 text-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">
                      {connecting ? 'Подключение...' : 'Phantom'}
                    </div>
                    <div className="text-sm opacity-70">
                      Популярный Solana кошелек
                    </div>
                  </div>
                </div>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Если кошелек подключен
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === 'button' ? (
          <Button size={size} variant="outline">
            <Wallet className="mr-2 h-4 w-4" />
            {formatAddress(address)}
          </Button>
        ) : (
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Подключен
                </Badge>
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">
                  {balance.toFixed(4)} SOL
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {formatAddress(address)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Кошелек подключен</DialogTitle>
          <DialogDescription>
            Управление подключенным кошельком
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Баланс:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-primary">
                      {balance.toFixed(4)} SOL
                    </span>
                    <Button size="sm" variant="ghost" onClick={handleRefreshBalance}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Адрес:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {formatAddress(address)}
                    </span>
                    <Button size="sm" variant="ghost" onClick={copyAddress}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={openInExplorer}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleDisconnect}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Отключить кошелек
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
