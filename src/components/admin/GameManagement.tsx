import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Gamepad2,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Star,
  Users,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { useGamesStore, Game } from "@/contexts/GamesContext";

const GameManagement = () => {
  const { games, addGame, updateGame, deleteGame, toggleGameStatus } =
    useGamesStore();
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "",
    status: "active" as "active" | "inactive",
  });

  const handleAddGame = () => {
    if (!formData.name || !formData.description) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    addGame({
      name: formData.name,
      description: formData.description,
      image: formData.image,
      category: formData.category,
      status: formData.status,
    });

    toast.success(`Игра "${formData.name}" успешно добавлена!`);
    setIsAddGameModalOpen(false);
    setFormData({
      name: "",
      description: "",
      image: "",
      category: "",
      status: "active",
    });
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description,
      image: game.image,
      category: game.category,
      status: game.status,
    });
  };

  const handleUpdateGame = () => {
    if (!editingGame || !formData.name || !formData.description) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    updateGame(editingGame.id, {
      name: formData.name,
      description: formData.description,
      image: formData.image,
      category: formData.category,
      status: formData.status,
    });

    toast.success(`Игра "${formData.name}" успешно обновлена!`);
    setEditingGame(null);
    setFormData({
      name: "",
      description: "",
      image: "",
      category: "",
      status: "active",
    });
  };

  const handleDeleteGame = (gameId: string) => {
    deleteGame(gameId);
    toast.success("Игра удалена");
  };

  const handleToggleStatus = (gameId: string) => {
    toggleGameStatus(gameId);
    toast.success("Статус игры изменен");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Управление играми</h2>
          <p className="text-muted-foreground">
            Добавляйте и управляйте играми в маркетплейсе
          </p>
        </div>
        <Dialog open={isAddGameModalOpen} onOpenChange={setIsAddGameModalOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-solana text-white">
              <Plus className="mr-2 h-4 w-4" />
              Добавить игру
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Добавить новую игру
              </DialogTitle>
            </DialogHeader>
            <GameForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddGame}
              onCancel={() => setIsAddGameModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Форма редактирования */}
      {editingGame && (
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Редактировать игру
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GameForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleUpdateGame}
              onCancel={() => {
                setEditingGame(null);
                setFormData({
                  name: "",
                  description: "",
                  image: "",
                  category: "",
                  status: "active",
                });
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Список игр */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="gradient-card border-border/50">
            <div className="relative">
              {game.image && (
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge
                  variant={game.status === "active" ? "default" : "secondary"}
                  className={
                    game.status === "active" ? "bg-green-500" : "bg-gray-500"
                  }
                >
                  {game.status === "active" ? "Активна" : "Неактивна"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-lg">{game.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {game.category}
                  </p>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {game.description}
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4 text-primary" />
                    <span>{game.nftCount} NFT</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-primary" />
                    <span>{game.totalVolume} SOL</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditGame(game)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(game.id)}
                  >
                    {game.status === "active"
                      ? "Деактивировать"
                      : "Активировать"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteGame(game.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {games.length === 0 && (
        <Card className="gradient-card border-border/50">
          <CardContent className="p-12 text-center">
            <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет игр</h3>
            <p className="text-muted-foreground mb-4">
              Добавьте первую игру в маркетплейс
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить игру
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Компонент формы игры
interface GameFormProps {
  formData: {
    name: string;
    description: string;
    image: string;
    category: string;
    status: "active" | "inactive";
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      description: string;
      image: string;
      category: string;
      status: "active" | "inactive";
    }>
  >;
  onSubmit: () => void;
  onCancel: () => void;
}

const GameForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: GameFormProps) => {
  const categories = [
    "RPG",
    "FPS",
    "Strategy",
    "Adventure",
    "Puzzle",
    "Racing",
    "Sports",
    "Other",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          image: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Название игры *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Например: Fantasy Quest"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Категория</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="">Выберите категорию</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Подробное описание игры..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Изображение игры</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Статус</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => handleInputChange("status", e.target.value)}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
        >
          <option value="active">Активная</option>
          <option value="inactive">Неактивная</option>
        </select>
      </div>

      <div className="flex gap-4">
        <Button onClick={onSubmit} className="gradient-solana text-white">
          <Save className="mr-2 h-4 w-4" />
          Сохранить
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default GameManagement;
