
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CarModel {
  id?: string;
  make: string;
  model: string;
  year_start: number;
  year_end: number | null;
}

interface CarModelFormProps {
  carModel: CarModel | null;
  onSave: (carModel: CarModel) => void;
  onCancel: () => void;
}

const CarModelForm = ({ carModel, onSave, onCancel }: CarModelFormProps) => {
  const [formData, setFormData] = useState<CarModel>({
    id: carModel?.id || "",
    make: carModel?.make || "",
    model: carModel?.model || "",
    year_start: carModel?.year_start || new Date().getFullYear(),
    year_end: carModel?.year_end || null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes("year") ? (value ? parseInt(value) : null) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="make">Make</Label>
        <Input
          id="make"
          name="make"
          value={formData.make}
          onChange={handleChange}
          placeholder="Enter car make (e.g. Toyota)"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Enter car model (e.g. Camry)"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year_start">Start Year</Label>
          <Input
            id="year_start"
            name="year_start"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.year_start}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="year_end">End Year (optional)</Label>
          <Input
            id="year_end"
            name="year_end"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.year_end || ""}
            onChange={handleChange}
            placeholder="Leave empty if still in production"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {carModel ? "Update Car Model" : "Create Car Model"}
        </Button>
      </div>
    </form>
  );
};

export default CarModelForm;
