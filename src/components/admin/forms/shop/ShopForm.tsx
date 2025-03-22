
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ShopLogoField from "./ShopLogoField";
import { useShopImage } from "./useShopImage";
import { Shop, ShopFormProps } from "./types";
import ShopCategoryManager from "./ShopCategoryManager";

const ShopForm = ({ shop, onSave, onCancel }: ShopFormProps) => {
  const { isAdmin, ownerId } = useAuth();
  
  const [formData, setFormData] = useState<Shop>({
    id: shop?.id || "",
    name: shop?.name || "",
    description: shop?.description || "",
    logo: shop?.logo || null,
    rating: shop?.rating || 0,
    review_count: shop?.review_count || 0,
    owner_id: shop?.owner_id || (ownerId || "00000000-0000-0000-0000-000000000000"),
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
  } = useShopImage(formData.logo);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // If changing logo URL directly
    if (name === 'logo' && value) {
      handleDirectUrlChange(value);
    }
  };

  const handleClearImage = () => {
    setFormData({
      ...formData,
      logo: clearImage()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there's a new image, upload it first
    if (imageFile) {
      const logoUrl = await uploadImage();
      if (logoUrl) {
        formData.logo = logoUrl;
      }
    }
    
    // If not admin, use the owner_id from context
    if (!isAdmin && ownerId) {
      formData.owner_id = ownerId;
    }
    
    // Make sure owner_id is set
    if (!formData.owner_id) {
      formData.owner_id = "00000000-0000-0000-0000-000000000000";
    }
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Shop Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter shop name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Enter shop description"
          rows={3}
        />
      </div>
      
      <ShopLogoField
        previewUrl={previewUrl}
        isDirectUrl={isDirectUrl}
        uploading={uploading}
        logoUrl={formData.logo}
        onFileChange={handleFileChange}
        onLogoUrlChange={handleChange}
        onClearImage={handleClearImage}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            name="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating || ""}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="review_count">Review Count</Label>
          <Input
            id="review_count"
            name="review_count"
            type="number"
            min="0"
            value={formData.review_count || ""}
            onChange={handleChange}
          />
        </div>
      </div>
      
      {isAdmin && (
        <div className="space-y-2">
          <Label htmlFor="owner_id">Owner ID</Label>
          <Input
            id="owner_id"
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            placeholder="Owner ID"
            required
          />
        </div>
      )}

      {/* Shop categories manager (only visible when editing an existing shop) */}
      {shop?.id && (
        <ShopCategoryManager shopId={shop.id} />
      )}
      
      <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-white pb-2">
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
            shop ? "Update Shop" : "Create Shop"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ShopForm;
