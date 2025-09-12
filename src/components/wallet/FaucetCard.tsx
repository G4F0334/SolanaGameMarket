import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, RefreshCw, ExternalLink, Loader2 } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { toast } from 'sonner';

export const FaucetCard = () => {
  const [isRequesting, setIsRequesting] = useState(false);
  const [lastRequest, setLastRequest] = useState<number | null>(null);
  const { connected, address, refreshBalance } = useSolanaWallet();

  // Проверка cooldown (5 минут между запросами)
  const canRequest = () => {
    if (!lastRequest) return true;
    const cooldownTime = 5 * 60 * 1000; // 5 минут
    return Date.now() - lastRequest > cooldownTime;
  };

  const getRemainingCooldown = () => {
    if (!lastRequest) return 0;
    const cooldownTime = 5 * 60 * 1000;
    const remaining = cooldownTime - (Date.now() - lastRequest);
    return Math.max(0, Math.ceil(remaining / 60)); // возвращаем минуты
  };

  const requestTokens = async () => {
    if (!connected || !address) {
      toast.error('Подключите кошелек для получения токенов');
      return;
    }

    if (!canRequest()) {
      const remaining = getRemainingCooldown();
      toast.error(`Подождите ${remaining} мин. перед следующим запросом`);
      return;
    }

    setIsRequesting(true);
    
    try {
      // Используем Solana RPC API для получения airdrop
      const response = await fetch('https://api.devnet.solana.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'requestAirdrop',
          params: [
            address,
            1000000000 // 1 SOL в lamports
          ]
        })
      });

      const data = await response.json();
      
      if (data.result) {
        setLastRequest(Date.now());
        toast.success('1 SOL успешно получен! Баланс обновится через несколько секунд.');
        
        // Обновляем баланс через 5 секунд
        setTimeout(() => {
          refreshBalance();
        }, 5000);
      } else {
        throw new Error(data.error?.message || 'RPC Error');
      }
    } catch (error) {
      console.error('Ошибка faucet:', error);
      toast.error('RPC faucet недоступен. Используйте кнопку справа для официального faucet.');
    } finally {
      setIsRequesting(false);
    }
  };

  const openSolanaFaucet = () => {
    if (address) {
      // Открываем официальный faucet с предзаполненным адресом
      window.open(`https://faucet.solana.com/?address=${address}`, '_blank');
    } else {
      window.open('https://faucet.solana.com/', '_blank');
    }
  };

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
            <Droplets className="mr-2 h-4 w-4 text-blue-400" />
            Testnet Faucet
          </CardTitle>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-xs">
            Devnet
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-blue-400">
          {canRequest() ? '1.0 SOL' : `${getRemainingCooldown()}m`}
        </div>
        <p className="text-xs text-muted-foreground">
          {canRequest() 
            ? 'Доступно для получения' 
            : `Следующий запрос через ${getRemainingCooldown()} мин.`
          }
        </p>
        
        <div className="flex space-x-2">
          <Button
            onClick={requestTokens}
            disabled={!connected || isRequesting || !canRequest()}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
          >
            {isRequesting ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Получение...
              </>
            ) : canRequest() ? (
              <>
                <Droplets className="mr-1 h-3 w-3" />
                Получить
              </>
            ) : (
              `${getRemainingCooldown()}m`
            )}
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={openSolanaFaucet}
                  variant="outline"
                  size="sm"
                  className="px-2"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Официальный Solana Faucet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {!connected && (
          <p className="text-xs text-amber-500">
            ⚠️ Подключите кошелек
          </p>
        )}
      </CardContent>
    </Card>
  );
};
