import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { useUserData } from '@/hooks/useUserData';

type SaveStatus = 'saved' | 'saving' | 'error' | 'disconnected';

export const SaveStatus = () => {
  const [status, setStatus] = useState<SaveStatus>('disconnected');
  const { connected } = useSolanaWallet();
  const { isLoggedIn } = useUserData();

  useEffect(() => {
    if (connected && isLoggedIn) {
      setStatus('saved');
    } else {
      setStatus('disconnected');
    }
  }, [connected, isLoggedIn]);

  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          icon: CheckCircle,
          text: 'Данные сохранены',
          variant: 'default' as const,
          className: 'bg-green-500/20 text-green-400 border-green-500/30'
        };
      case 'saving':
        return {
          icon: Loader2,
          text: 'Сохранение...',
          variant: 'default' as const,
          className: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Ошибка сохранения',
          variant: 'destructive' as const,
          className: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
      case 'disconnected':
        return {
          icon: AlertCircle,
          text: 'Не подключен',
          variant: 'secondary' as const,
          className: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`text-xs ${config.className}`}>
      <Icon className={`h-3 w-3 mr-1 ${status === 'saving' ? 'animate-spin' : ''}`} />
      {config.text}
    </Badge>
  );
};
