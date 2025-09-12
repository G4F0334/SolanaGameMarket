import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coins, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSolanaWallet } from "@/hooks/useSolanaWallet";

interface FaucetState {
  loading: boolean;
  success: boolean;
  error: string | null;
  lastRequest: number | null;
}

export const Faucet = () => {
  const { connected, address, refreshBalance } = useSolanaWallet();
  const [faucetState, setFaucetState] = useState<FaucetState>({
    loading: false,
    success: false,
    error: null,
    lastRequest: null
  });
  const [customAddress, setCustomAddress] = useState("");
  const [showCustomAddress, setShowCustomAddress] = useState(false);

  // Cooldown period in milliseconds (5 minutes)
  const COOLDOWN_PERIOD = 5 * 60 * 1000;

  const canRequestAgain = () => {
    if (!faucetState.lastRequest) return true;
    return Date.now() - faucetState.lastRequest > COOLDOWN_PERIOD;
  };

  const getRemainingCooldown = () => {
    if (!faucetState.lastRequest) return 0;
    const remaining = COOLDOWN_PERIOD - (Date.now() - faucetState.lastRequest);
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  const requestAirdrop = async (targetAddress?: string) => {
    const walletAddress = targetAddress || address;
    
    if (!walletAddress) {
      setFaucetState(prev => ({ ...prev, error: "Адрес кошелька не найден" }));
      return;
    }

    if (!canRequestAgain()) {
      setFaucetState(prev => ({ 
        ...prev, 
        error: `Подождите ${getRemainingCooldown()} секунд перед следующим запросом` 
      }));
      return;
    }

    setFaucetState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      success: false 
    }));

    try {
      // В реальном приложении здесь будет запрос к Solana Devnet faucet
      // Для демонстрации используем mock запрос
      const response = await fetch('https://faucet.solana.com/api/airdrop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pubkey: walletAddress,
          amount: 1000000000 // 1 SOL в lamports
        })
      });

      if (response.ok) {
        setFaucetState(prev => ({ 
          ...prev, 
          loading: false, 
          success: true,
          lastRequest: Date.now()
        }));
        
        // Обновляем баланс через 3 секунды
        setTimeout(() => {
          refreshBalance();
        }, 3000);
      } else {
        throw new Error('Ошибка получения токенов из фаусета');
      }
    } catch (error) {
      console.error('Faucet error:', error);
      setFaucetState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Не удалось получить токены. Попробуйте позже или используйте официальный faucet Solana.' 
      }));
    }
  };

  const handleQuickAirdrop = () => {
    if (connected) {
      requestAirdrop();
    }
  };

  const handleCustomAirdrop = () => {
    if (customAddress.trim()) {
      requestAirdrop(customAddress.trim());
      setCustomAddress("");
      setShowCustomAddress(false);
    }
  };

  const resetState = () => {
    setFaucetState(prev => ({ 
      ...prev, 
      error: null, 
      success: false 
    }));
  };

  return (
    <Dialog onOpenChange={resetState}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Coins className="h-4 w-4" />
          <span>Фаусет</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5" />
            <span>Solana Testnet Faucet</span>
          </DialogTitle>
          <DialogDescription>
            Получите бесплатные SOL токены для тестирования на Devnet/Testnet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Alerts */}
          {faucetState.error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-700">
                {faucetState.error}
              </AlertDescription>
            </Alert>
          )}

          {faucetState.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700">
                Токены успешно отправлены! Баланс обновится через несколько секунд.
              </AlertDescription>
            </Alert>
          )}

          {/* Cooldown Warning */}
          {!canRequestAgain() && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-700">
                Следующий запрос возможен через {getRemainingCooldown()} секунд
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Airdrop for Connected Wallet */}
          {connected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Быстрый запрос</CardTitle>
                <CardDescription>
                  Отправить 1 SOL на подключенный кошелек
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm font-medium">Адрес кошелька:</div>
                    <div className="text-xs text-muted-foreground font-mono break-all">
                      {address}
                    </div>
                  </div>
                  <Button 
                    onClick={handleQuickAirdrop}
                    disabled={faucetState.loading || !canRequestAgain()}
                    className="w-full"
                  >
                    {faucetState.loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Coins className="mr-2 h-4 w-4" />
                        Получить 1 SOL
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom Address Airdrop */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Отправить на другой адрес</CardTitle>
              <CardDescription>
                Введите адрес кошелька для получения токенов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="custom-address">Адрес кошелька</Label>
                  <Input
                    id="custom-address"
                    placeholder="Введите публичный адрес кошелька..."
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <Button 
                  onClick={handleCustomAirdrop}
                  disabled={faucetState.loading || !customAddress.trim() || !canRequestAgain()}
                  className="w-full"
                  variant="outline"
                >
                  {faucetState.loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Отправить 1 SOL
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Фаусет работает только на Devnet/Testnet</p>
            <p>• Максимум 1 SOL каждые 5 минут</p>
            <p>• Токены предназначены только для тестирования</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
