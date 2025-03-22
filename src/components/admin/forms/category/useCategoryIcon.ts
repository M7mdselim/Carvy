
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCategoryIcon = (initialIconUrl: string | null) => {
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialIconUrl);
  const [isDirectUrl, setIsDirectUrl] = useState(Boolean(initialIconUrl && !imageFile));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setIsDirectUrl(false);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectUrlChange = (url: string) => {
    if (url) {
      setPreviewUrl(url);
      setIsDirectUrl(true);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setIsDirectUrl(false);
    return null;
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return initialIconUrl;
  
    setUploading(true);
    try {
      // Create a unique file name
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;
  
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('Shops Photos')
        .upload(filePath, imageFile, {
          upsert: true,
          cacheControl: '3153600', // Cache for 1 year (in seconds)
        });
  
      if (uploadError) throw uploadError;
  
      const { data } = supabase.storage.from('Shops Photos').getPublicUrl(filePath);
      const publicUrl = data?.publicUrl ?? null;
  
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    imageFile,
    previewUrl,
    isDirectUrl,
    handleFileChange,
    handleDirectUrlChange,
    clearImage,
    uploadImage
  };
};
