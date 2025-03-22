
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface CategoryImageFieldProps {
  previewUrl: string | null;
  isDirectUrl: boolean;
  uploading: boolean;
  imageUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
}

const CategoryImageField = ({
  previewUrl,
  isDirectUrl,
  uploading,
  imageUrl,
  onFileChange,
  onImageUrlChange,
  onClearImage
}: CategoryImageFieldProps) => {
  return (
    <div className="space-y-4">
      <Label>Category Image</Label>
      
      {previewUrl && (
        <div className="relative w-32 h-32 bg-gray-100 rounded-md overflow-hidden">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={onClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="imageUpload">Upload Image</Label>
        <div className="flex items-center gap-2">
          <Input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            disabled={uploading}
          />
          {uploading && <Loader2 className="animate-spin h-4 w-4" />}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">Or Enter Image URL</Label>
        <Input
          id="image"
          name="image"
          value={imageUrl || ""}
          onChange={onImageUrlChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );
};

export default CategoryImageField;
