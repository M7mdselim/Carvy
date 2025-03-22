
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";

interface CategoryIconFieldProps {
  previewUrl: string | null;
  isDirectUrl: boolean;
  uploading: boolean;
  iconUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIconUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
}

const CategoryIconField = ({
  previewUrl,
  isDirectUrl,
  uploading,
  iconUrl,
  onFileChange,
  onIconUrlChange,
  onClearImage
}: CategoryIconFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>Category Icon</Label>
      <div className="space-y-3">
        {previewUrl && (
          <div className="relative inline-block">
            <div className="w-24 h-24 border rounded-md overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Icon preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <Button 
              type="button" 
              size="icon" 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={onClearImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {!previewUrl && (
          <div className="flex items-center space-x-2">
            <Label 
              htmlFor="icon-file" 
              className="cursor-pointer flex items-center justify-center w-full h-24 rounded-md border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-gray-400" />
                <span className="mt-2 block text-sm text-gray-600">Upload icon</span>
              </div>
              <Input
                id="icon-file"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="sr-only"
              />
            </Label>
          </div>
        )}
        
        {uploading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading image...</span>
          </div>
        )}
        
        <div className="text-sm text-gray-600">Or enter icon URL directly:</div>
        <Input
          id="icon"
          name="icon"
          value={isDirectUrl ? (iconUrl || "") : ""}
          onChange={onIconUrlChange}
          placeholder="Enter icon URL"
          className="max-w-sm"
        />
      </div>
    </div>
  );
};

export default CategoryIconField;
