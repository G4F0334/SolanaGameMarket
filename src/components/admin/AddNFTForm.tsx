import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useGamesStore } from "@/contexts/GamesContext";

interface AddNFTFormProps {
  onClose: () => void;
}

const AddNFTForm = ({ onClose }: AddNFTFormProps) => {
  const { games } = useGamesStore();
  const [form, setForm] = useState({
    name: "",
    image: "",
    game: games[0]?.name || "",
    typeRarity: "",
    description: "",
    nft: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setForm({ ...form, image: file.name });
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: здесь должен быть асинхронный запрос на добавление NFT
    // await manageNFTs.create({ ...form, image: imageFile });
    setLoading(false);
    onClose();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1">Название</label>
        <Input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Фото</label>
        <Input
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            className="mt-2 h-32 object-contain rounded"
          />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Игра</label>
        <select
          name="game"
          value={form.game}
          onChange={(e) => setForm({ ...form, game: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-md bg-background"
          required
        >
          {games.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Тип/Редкость</label>
        <Input
          name="typeRarity"
          value={form.typeRarity}
          onChange={handleChange}
          placeholder="например: Weapon/Legendary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <Textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          NFT (ID или ссылка)
        </label>
        <Input name="nft" value={form.nft} onChange={handleChange} required />
      </div>
      {/* created_at и updated_at заполняются автоматически */}
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          className="gradient-solana text-white"
          disabled={loading}
        >
          {loading ? "Добавление..." : "Добавить NFT"}
        </Button>
      </div>
    </form>
  );
};

export default AddNFTForm;
