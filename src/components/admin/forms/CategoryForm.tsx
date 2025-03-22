
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCategoryIcon } from "./category/useCategoryIcon";
import CategoryIconField from "./category/CategoryIconField";

interface Category {
  id?: string;
  name: string;
  icon: string;
}

interface CategoryFormProps {
  category: Category | null;
  onSave: (category: Category) => void;
  onCancel: () => void;
}

const CategoryForm = ({ category, onSave, onCancel }: CategoryFormProps) => {
  const [formData, setFormData] = useState<Category>({
    id: category?.id || "",
    name: category?.name || "",
    icon: category?.icon || "",
  });

  const {
    uploading,
    imageFile,
    previewUrl,
    isDirectUrl,
    handleFileChange,
    handleDirectUrlChange,
    clearImage,
    uploadImage
  } = useCategoryIcon(formData.icon);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // If changing icon URL directly
    if (name === 'icon' && value) {
      handleDirectUrlChange(value);
    }
  };

  const handleClearImage = () => {
    setFormData({
      ...formData,
      icon: clearImage()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's a new image, upload it first
    if (imageFile) {
      const iconUrl = await uploadImage();
      if (iconUrl) {
        formData.icon = iconUrl;
      }
    }
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter category name"
          required
        />
      </div>
      
      <CategoryIconField
        previewUrl={previewUrl}
        isDirectUrl={isDirectUrl}
        uploading={uploading}
        iconUrl={formData.icon}
        onFileChange={handleFileChange}
        onIconUrlChange={handleChange}
        onClearImage={handleClearImage}
      />
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            category?.id ? "Update Category" : "Create Category"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;
