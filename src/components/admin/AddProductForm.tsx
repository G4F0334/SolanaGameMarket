import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Package,
  Gamepad2,
  DollarSign,
  Star,
  Save,
  Eye,
  X,
} from "lucide-react";
import { useNFTStore } from "@/contexts/NFTContext";
import { useGamesStore } from "@/contexts/GamesContext";
import { toast } from "sonner";

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  game: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  image: string;
  category: string;
  attributes: Array<{ trait: string; value: string }>;
}

interface AddProductFormProps {
  onClose?: () => void;
}

const AddProductForm = ({ onClose }: AddProductFormProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    price: "",
    currency: "SOL",
    game: "",
    rarity: "Common",
    image: "",
    category: "",
    attributes: [],
  });

  const [isPreview, setIsPreview] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ trait: "", value: "" });
  const { addOwnedNFT } = useNFTStore();
  const { getActiveGames } = useGamesStore();

  // Получаем активные игры из контекста
  const availableGames = getActiveGames().map((game) => game.name);

  // Категории товаров
  const categories = [
    "Оружие",
    "Броня",
    "Аксессуары",
    "Скины",
    "Предметы",
    "Зелья",
    "Кристаллы",
    "Другое",
  ];

  const rarityColors = {
    Common: "bg-slate-500",
    Rare: "bg-blue-500",
    Epic: "bg-purple-500",
    Legendary: "bg-amber-500",
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddAttribute = () => {
    if (newAttribute.trait && newAttribute.value) {
      setFormData((prev) => ({
        ...prev,
        attributes: [...prev.attributes, newAttribute],
      }));
      setNewAttribute({ trait: "", value: "" });
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
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

  const handleSubmit = () => {
    // Валидация
    if (
      !formData.title ||
      !formData.price ||
      !formData.game ||
      !formData.image
    ) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    // Создание нового NFT
    const newNFT = {
      id: Date.now().toString(),
      title: formData.title,
      image: formData.image,
      price: parseFloat(formData.price),
      currency: formData.currency,
      game: formData.game,
      rarity: formData.rarity,
      seller: "Admin", // В реальном приложении будет текущий пользователь
      description: formData.description,
      category: formData.category,
      attributes: formData.attributes,
    };

    // Добавление в коллекцию
    addOwnedNFT(newNFT);

    // Сохранение в localStorage (имитация devnet)
    const existingProducts = JSON.parse(
      localStorage.getItem("admin_products") || "[]"
    );
    existingProducts.push(newNFT);
    localStorage.setItem("admin_products", JSON.stringify(existingProducts));

    toast.success(`Товар "${formData.title}" успешно добавлен!`);

    // Сброс формы
    setFormData({
      title: "",
      description: "",
      price: "",
      currency: "SOL",
      game: "",
      rarity: "Common",
      image: "",
      category: "",
      attributes: [],
    });

    // Закрыть модальное окно
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      {/* Форма */}
      <div className="space-y-6">
        {/* Основная информация */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Основная информация</h3>

          <div className="space-y-2">
            <Label htmlFor="title">Название товара *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Например: Dragon Sword of Flames"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Подробное описание товара..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="2.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Валюта</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Игровая информация */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Игровая информация</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="game">Игра *</Label>
              <Select
                value={formData.game}
                onValueChange={(value) => handleInputChange("game", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите игру" />
                </SelectTrigger>
                <SelectContent>
                  {availableGames.map((game) => (
                    <SelectItem key={game} value={game}>
                      {game}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rarity">Редкость</Label>
            <Select
              value={formData.rarity}
              onValueChange={(value: any) => handleInputChange("rarity", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Rare">Rare</SelectItem>
                <SelectItem value="Epic">Epic</SelectItem>
                <SelectItem value="Legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Изображение */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Изображение</h3>

          <div className="space-y-2">
            <Label htmlFor="image">Загрузить изображение *</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {formData.image && (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
              <img
                src={formData.image}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Атрибуты */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Атрибуты</h3>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Название атрибута"
                value={newAttribute.trait}
                onChange={(e) =>
                  setNewAttribute((prev) => ({
                    ...prev,
                    trait: e.target.value,
                  }))
                }
              />
              <Input
                placeholder="Значение"
                value={newAttribute.value}
                onChange={(e) =>
                  setNewAttribute((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
              />
              <Button onClick={handleAddAttribute} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {formData.attributes.length > 0 && (
            <div className="space-y-2">
              {formData.attributes.map((attr, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-secondary rounded-md"
                >
                  <span className="text-sm">
                    <strong>{attr.trait}:</strong> {attr.value}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveAttribute(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-4">
          <Button onClick={handleSubmit} className="gradient-solana text-white">
            <Save className="mr-2 h-4 w-4" />
            Сохранить товар
          </Button>
          <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
            <Eye className="mr-2 h-4 w-4" />
            {isPreview ? "Скрыть превью" : "Показать превью"}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
          )}
        </div>
      </div>

      {/* Превью */}
      {isPreview && (
        <div className="border border-border/50 rounded-lg p-6 bg-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Превью товара
          </h3>
          <div>
            {formData.title ? (
              <div className="space-y-4">
                {formData.image && (
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={formData.image}
                      alt={formData.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge
                        className={`${
                          rarityColors[formData.rarity]
                        } text-white border-none`}
                      >
                        {formData.rarity}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {formData.game || "Игра не выбрана"}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg">{formData.title}</h3>

                  {formData.description && (
                    <p className="text-sm text-muted-foreground">
                      {formData.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">
                      {formData.price
                        ? `${formData.price} ${formData.currency}`
                        : "Цена не указана"}
                    </div>
                  </div>

                  {formData.attributes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Атрибуты:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {formData.attributes.map((attr, index) => (
                          <div
                            key={index}
                            className="text-xs bg-secondary p-2 rounded"
                          >
                            <strong>{attr.trait}:</strong> {attr.value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Заполните форму для просмотра превью
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductForm;
