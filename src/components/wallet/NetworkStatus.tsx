import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { connection } from '@/lib/solana';
import { Wifi, WifiOff } from 'lucide-react';

export const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const start = Date.now();
        await connection.getVersion();
        const end = Date.now();
        
        setIsConnected(true);
        setLatency(end - start);
      } catch (error) {
        setIsConnected(false);
        setLatency(null);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Проверка каждые 30 секунд

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge 
      variant={isConnected ? "default" : "destructive"} 
      className="text-xs"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3 mr-1" />
          Devnet {latency && `(${latency}ms)`}
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Нет подключения
        </>
      )}
    </Badge>
  );
};
