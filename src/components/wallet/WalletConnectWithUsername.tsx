import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
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
  User,
  AlertCircle 
} from 'lucide-react';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { useUserData } from '@/hooks/useUserData';
import { toast } from 'sonner';

interface WalletConnectWithUsernameProps {
  variant?: 'button' | 'card';
  size?: 'sm' | 'default' | 'lg';
}

export const WalletConnectWithUsername = ({ 
  variant = 'button', 
  size = 'default' 
}: WalletConnectWithUsernameProps) => {
  const {
    connected,
    connecting,
    connect,
    isPhantomInstalled
  } = useSolanaWallet();
  
  const { setUsername } = useUserData();
  
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'wallet' | 'username'>('wallet');
  const [username, setUsernameLocal] = useState('');

  const handleConnect = async () => {
    try {
      await connect();
      setStep('username');
      toast.success('Кошелек успешно подключен!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка подключения кошелька');
    }
  };

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setUsername(username.trim());
      setUsernameLocal('');
      setIsOpen(false);
      setStep('wallet');
      toast.success('Добро пожаловать! Авторизация завершена успешно!');
    } else {
      toast.error('Введите корректный никнейм');
    }
  };

  const handleModalClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setStep('wallet');
      setUsernameLocal('');
    }
  };

  // Если уже подключен, не показываем кнопку
  if (connected) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogTrigger asChild>
        {variant === 'button' ? (
          <Button size={size} disabled={connecting} className="gradient-solana text-white">
            <Wallet className="mr-2 h-4 w-4" />
            {connecting ? 'Подключение...' : 'Авторизоваться'}
          </Button>
        ) : (
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardContent className="p-6 text-center">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Подключить кошелек</h3>
              <p className="text-muted-foreground text-sm">
                Подключите Solana кошелек для начала работы
              </p>
            </CardContent>
          </Card>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        {step === 'wallet' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Авторизация - Шаг 1
              </DialogTitle>
              <DialogDescription>
                Подключите ваш Solana кошелек для создания аккаунта на маркетплейсе
              </DialogDescription>
            </DialogHeader>
            
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
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Wallet className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Phantom кошелек найден</h3>
                    <p className="text-muted-foreground text-sm">
                      Нажмите кнопку ниже для подключения
                    </p>
                  </div>
                  <Button 
                    onClick={handleConnect} 
                    disabled={connecting}
                    className="w-full gradient-solana text-white"
                  >
                    {connecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Подключение...
                      </>
                    ) : (
                      <>
                        <Wallet className="mr-2 h-4 w-4" />
                        Подключить Phantom
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Авторизация - Шаг 2
              </DialogTitle>
              <DialogDescription>
                Создайте свой профиль, введя никнейм для завершения регистрации
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-3">
                  <User className="h-8 w-8 text-white" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Отлично! Кошелек подключен. Теперь создайте свой уникальный профиль.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Никнейм</Label>
                <Input
                  id="username"
                  placeholder="Введите ваш никнейм"
                  value={username}
                  onChange={(e) => setUsernameLocal(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                  className="text-center"
                />
              </div>
              
              <Button 
                onClick={handleUsernameSubmit} 
                disabled={!username.trim()}
                className="w-full gradient-solana text-white"
              >
                Завершить авторизацию
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
