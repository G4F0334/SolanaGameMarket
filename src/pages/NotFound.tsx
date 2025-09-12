import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold gradient-text">404</h1>
          <h2 className="text-2xl font-semibold">Страница не найдена</h2>
          <p className="text-muted-foreground max-w-md">
            К сожалению, запрашиваемая страница не существует или была перемещена
          </p>
        </div>
        <Link to="/">
          <Button className="gradient-solana text-white">
            Вернуться на главную
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
