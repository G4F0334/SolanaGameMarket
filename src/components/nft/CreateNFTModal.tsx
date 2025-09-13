import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/services/api";

interface CreateNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userAddress: string;
}

interface NFTFormData {
  name: string;
  description: string;
  price: string;
  image: File | null;
  type: string;
  game: string;
  rarity: string;
}

const CreateNFTModal = ({ isOpen, onClose, onSuccess, userAddress }: CreateNFTModalProps) => {
  const [formData, setFormData] = useState<NFTFormData>({
    name: "",
    description: "",
    price: "",
    image: null,
    type: "",
    game: "",
    rarity: "Common",
  });
  const [creating, setCreating] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const nftTypes = [
    { value: "weapon", label: "Оружие" },
    { value: "armor", label: "Броня" },
    { value: "accessory", label: "Аксессуар" },
    { value: "consumable", label: "Расходник" },
    { value: "material", label: "Материал" },
    { value: "tool", label: "Инструмент" },
    { value: "mount", label: "Транспорт" },
    { value: "currency", label: "Валюта" },
  ];

  const nftRarities = [
    { value: "Common", label: "Обычный", color: "bg-gray-500" },
    { value: "Uncommon", label: "Необычный", color: "bg-green-500" },
    { value: "Rare", label: "Редкий", color: "bg-blue-500" },
    { value: "Epic", label: "Эпический", color: "bg-purple-500" },
    { value: "Legendary", label: "Легендарный", color: "bg-orange-500" },
    { value: "Mythic", label: "Мифический", color: "bg-red-500" },
  ];

  const games = [
    "Counter-Strike 2",
    "Dota 2", 
    "Team Fortress 2",
    "Rust",
    "Path of Exile",
    "Warframe",
    "Rocket League",
    "Diablo 4",
    "World of Warcraft",
    "Guild Wars 2",
    "EVE Online",
    "Albion Online",
    "Lost Ark",
    "Final Fantasy XIV",
    "Black Desert Online",
    "Elder Scrolls Online",
    "Destiny 2",
    "Apex Legends",
    "Fortnite",
    "Minecraft"
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Размер файла не должен превышать 5MB");
        return;
      }

      // Проверяем тип файла
      if (!file.type.startsWith("image/")) {
        toast.error("Пожалуйста, выберите изображение");
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      // Создаем превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Введите название NFT");
      return;
    }

    if (!formData.type) {
      toast.error("Выберите тип предмета");
      return;
    }

    if (!formData.game) {
      toast.error("Выберите игру");
      return;
    }

    if (!formData.rarity) {
      toast.error("Выберите редкость");
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Введите корректную цену");
      return;
    }

    try {
      setCreating(true);

      // В реальном приложении здесь была бы загрузка изображения на сервер
      // Пока используем placeholder или base64
      let imageUrl = "/placeholder.svg";
      
      if (formData.image) {
        // Здесь можно добавить загрузку на сервер или использовать сервис изображений
        imageUrl = imagePreview || "/placeholder.svg";
      }

      const nftData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: imageUrl,
        userAddress: userAddress,
        type: formData.type,
        game: formData.game,
        rarity: formData.rarity
      };

      // Вызов API для создания NFT
      const response = await apiService.createUserNFT(nftData);
      
      if (!response.success) {
        throw new Error(response.error || 'Ошибка при создании NFT');
      }
      
      console.log("NFT created successfully:", response.nft);
      
      toast.success(`NFT "${formData.name}" успешно создан!`);
      
      // Сбрасываем форму
      setFormData({
        name: "",
        description: "",
        price: "",
        image: null,
        type: "",
        game: "",
        rarity: "Common",
      });
      setImagePreview(null);
      
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error("Error creating NFT:", error);
      toast.error("Ошибка при создании NFT");
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setFormData({
        name: "",
        description: "",
        price: "",
        image: null,
        type: "",
        game: "",
        rarity: "Common",
      });
      setImagePreview(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать NFT</DialogTitle>
          <DialogDescription>
            Создайте свой уникальный NFT предмет. Заполните все необходимые поля.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Загрузка изображения */}
          <div className="space-y-2">
            <Label>Изображение</Label>
            {!imagePreview ? (
              <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Загрузите изображение</p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG до 5MB
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Выбрать файл
                      </label>
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Название */}
          <div className="space-y-2">
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              placeholder="Введите название NFT"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={creating}
            />
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Опишите ваш NFT предмет"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={creating}
              rows={3}
            />
          </div>

          {/* Тип предмета и игра */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Тип предмета *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {nftTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Игра *</Label>
              <Select 
                value={formData.game} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, game: value }))}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите игру" />
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game} value={game}>
                      {game}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Редкость */}
          <div className="space-y-2">
            <Label>Редкость *</Label>
            <Select 
              value={formData.rarity} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value }))}
              disabled={creating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите редкость" />
              </SelectTrigger>
              <SelectContent>
                {nftRarities.map((rarity) => (
                  <SelectItem key={rarity.value} value={rarity.value}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${rarity.color}`} />
                      <span>{rarity.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Цена */}
          <div className="space-y-2">
            <Label htmlFor="price">Цена (SOL) *</Label>
            <Input
              id="price"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="0.0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              disabled={creating}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={creating}>
              Отмена
            </Button>
            <Button type="submit" disabled={creating} className="gradient-solana text-white">
              {creating ? "Создание..." : "Создать NFT"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNFTModal;
