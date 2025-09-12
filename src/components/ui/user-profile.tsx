import { User, Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface UserProfileProps {
  username: string;
  walletAddress: string;
  onDisconnect: () => void;
}

const UserProfile = ({ username, walletAddress, onDisconnect }: UserProfileProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80">
          <User className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>Мой профиль</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <div className="px-2 py-1.5">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              <span className="font-mono">
                {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center space-x-2 cursor-pointer">
              <User className="h-4 w-4" />
              <span>Профиль</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onDisconnect}
            className="flex items-center space-x-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Отключить кошелек</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;