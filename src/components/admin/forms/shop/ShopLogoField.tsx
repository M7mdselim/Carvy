
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";

interface ShopLogoFieldProps {
  previewUrl: string | null;
  isDirectUrl: boolean;
  uploading: boolean;
  logoUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLogoUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
}

const ShopLogoField = ({
  previewUrl,
  isDirectUrl,
  uploading,
  logoUrl,
  onFileChange,
  onLogoUrlChange,
  onClearImage
}: ShopLogoFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>Shop Logo</Label>
      <div className="space-y-3">
        {previewUrl && (
          <div className="relative inline-block">
            <div className="w-24 h-24 border rounded-md overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Logo preview" 
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
              htmlFor="logo-file" 
              className="cursor-pointer flex items-center justify-center w-full h-24 rounded-md border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-gray-400" />
                <span className="mt-2 block text-sm text-gray-600">Upload logo</span>
              </div>
              <Input
                id="logo-file"
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
        
        <div className="text-sm text-gray-600">Or enter logo URL directly:</div>
        <Input
          id="logo"
          name="logo"
          value={isDirectUrl ? (logoUrl || "") : ""}
          onChange={onLogoUrlChange}
          placeholder="Enter logo URL"
          className="max-w-sm"
        />
      </div>
    </div>
  );
};

export default ShopLogoField;
