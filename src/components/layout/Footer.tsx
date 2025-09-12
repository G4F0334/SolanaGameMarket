import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container max-w-screen-2xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 gradient-solana rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold gradient-text">GameNFT</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Ведущий маркетплейс игровых NFT на блокчейне Solana
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h4 className="font-semibold">Платформа</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/catalog" className="hover:text-primary transition-colors">Каталог</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">Профиль</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Поддержка</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Помощь</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Связаться с нами</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Правовые вопросы</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Пользовательское соглашение</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 GameNFT. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;