import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Shop {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface CarModel {
  id: string;
  make: string;
  model: string;
  year_start: number;
  year_end: number | null;
  originalMake?: string;
}

interface Product {
  id?: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  status: string;
  shop_id: string;
  category_id: string | null;
  image: string | null;
  car_models?: string[];
}

interface ProductFormProps {
  product: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  isSaving: boolean;
  ownerShopIds?: string[];
}

const ProductForm = ({ product, onSave, onCancel, isSaving, ownerShopIds }: ProductFormProps) => {
  const [formData, setFormData] = useState<Product>({
    id: product?.id || "",
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    stock: product?.stock || 0,
    status: product?.status || "active",
    shop_id: product?.shop_id || "",
    category_id: product?.category_id || null,
    image: product?.image || null,
    car_models: product?.car_models || [],
  });
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopCategories, setShopCategories] = useState<Category[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [filteredCarModels, setFilteredCarModels] = useState<CarModel[]>([]);
  const [categoryCarModels, setCategoryCarModels] = useState<CarModel[]>([]);
  const [selectedCarModels, setSelectedCarModels] = useState<string[]>(product?.car_models || []);
  const [carModelSearch, setCarModelSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(formData.image);
  const { isAdmin, ownerId } = useAuth();
  const [categoryMakes, setCategoryMakes] = useState<string[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let shopQuery = supabase.from("shops").select("id, name");
        
        if (ownerShopIds && ownerShopIds.length > 0) {
          shopQuery = shopQuery.in("id", ownerShopIds);
        } else if (!isAdmin && ownerId) {
          shopQuery = shopQuery.eq("owner_id", ownerId);
        }
        
        shopQuery = shopQuery.order("name");
        const { data: shopData, error: shopError } = await shopQuery;
        
        if (shopError) throw shopError;
        setShops(shopData || []);
        
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id, name")
          .order("name");
        
        if (categoryError) throw categoryError;
        setCategories(categoryData || []);
        
        const { data: carModelData, error: carModelError } = await supabase
          .from("car_models")
          .select("*")
          .order("make")
          .order("model");
        
        if (carModelError) throw carModelError;
        
        const normalizedCarModels = carModelData?.map(model => ({
          ...model,
          originalMake: model.make,
          make: model.make.toLowerCase()
        })) || [];
        
        setCarModels(normalizedCarModels);
        
        if (!product && shopData && shopData.length > 0) {
          setFormData(prev => ({
            ...prev,
            shop_id: shopData[0].id
          }));
          
          await fetchShopCategories(shopData[0].id);
        } else if (product?.shop_id) {
          await fetchShopCategories(product.shop_id);
        }
      } catch (error: any) {
        console.error("Error fetching form data:", error);
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [product, ownerShopIds, isAdmin, ownerId]);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (product?.category_id && formData.shop_id) {
        await filterCarModelsByCategory(product.category_id);
      }
    };
    
    loadCategoryData();
  }, [formData.shop_id, carModels]);

  const fetchShopCategories = async (shopId: string) => {
    try {
      const { data, error } = await supabase
        .from("shop_categories")
        .select(`
          category_id,
          categories:category_id(id, name)
        `)
        .eq("shop_id", shopId);
      
      if (error) throw error;
      
      const shopCats = data?.map(item => item.categories) || [];
      setShopCategories(shopCats);
      
      if (formData.category_id) {
        await filterCarModelsByCategory(formData.category_id);
      } else {
        setCategoryCarModels([]);
        setFilteredCarModels([]);
        setCategoryMakes([]);
        setSelectedCategoryName(null);
      }
    } catch (error) {
      console.error("Error fetching shop categories:", error);
    }
  };

  const filterCarModelsByCategory = async (categoryId: string | null) => {
    setCategoryCarModels([]);
    setFilteredCarModels([]);
    setCategoryMakes([]);
    setSelectedCategoryName(null);
    
    if (!categoryId) {
      return;
    }
    
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("name")
        .eq("id", categoryId)
        .single();
      
      if (categoryError) throw categoryError;
      
      const categoryName = categoryData?.name;
      setSelectedCategoryName(categoryName);
      
      if (carModels.length === 0) {
        console.log("Car models not loaded yet, cannot filter");
        return;
      }
      
      const lowercaseCategoryName = categoryName.toLowerCase();
      const matchingModels = carModels.filter(model => 
        (model.originalMake || model.make).toLowerCase() === lowercaseCategoryName
      );
      
      console.log(`Found ${matchingModels.length} car models matching category "${categoryName}"`);
      
      if (matchingModels.length > 0) {
        const makesSet = new Set(matchingModels.map(model => model.originalMake || model.make));
        setCategoryMakes(Array.from(makesSet));
        setCategoryCarModels(matchingModels);
        setFilteredCarModels(matchingModels);
      } else {
        setCategoryCarModels([]);
        setFilteredCarModels([]);
        setCategoryMakes([]);
      }
    } catch (error) {
      console.error("Error filtering car models by category:", error);
      setCategoryCarModels([]);
      setFilteredCarModels([]);
      setCategoryMakes([]);
      setSelectedCategoryName(null);
    }
  };

  useEffect(() => {
    if (!categoryCarModels.length) {
      setFilteredCarModels([]);
      return;
    }
    
    if (carModelSearch.trim() === '') {
      setFilteredCarModels(categoryCarModels);
    } else {
      const searchLower = carModelSearch.toLowerCase();
      const filtered = categoryCarModels.filter(
        model => 
          model.make.toLowerCase().includes(searchLower) || 
          model.model.toLowerCase().includes(searchLower) ||
          `${model.year_start}`.includes(searchLower)
      );
      setFilteredCarModels(filtered);
    }
  }, [carModelSearch, categoryCarModels]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "shop_id") {
      fetchShopCategories(value);
      
      setFormData({
        ...formData,
        shop_id: value,
        category_id: null,
      });
      
      setCategoryCarModels([]);
      setFilteredCarModels([]);
      setCategoryMakes([]);
      setSelectedCategoryName(null);
    } else if (name === "category_id") {
      const categoryId = value === "none" ? null : value;
      filterCarModelsByCategory(categoryId);
      
      setFormData({
        ...formData,
        [name]: categoryId,
      });
      
      if (value === "none") {
        setSelectedCarModels([]);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value === "none" ? null : value,
      });
    }
  };

  const handleCarModelToggle = (modelId: string) => {
    setSelectedCarModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image;
  
    setUploading(true);
    try {
      const fileExt = imageFile?.name?.split('.').pop() || 'jpg'; 
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('Shops Photos')
        .upload(filePath, imageFile, {
          upsert: true,
          cacheControl: '3153600',
        });
  
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('Shops Photos').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const isValidUUID = (uuid: string | null): boolean => {
    if (!uuid) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUUID(formData.shop_id)) {
      toast({
        title: "Error",
        description: "Please select a valid shop.",
        variant: "destructive",
      });
      return;
    }

    if (!isAdmin && ownerShopIds && !ownerShopIds.includes(formData.shop_id)) {
      toast({
        title: "Permission denied", 
        description: "You don't have permission to add products to this shop",
        variant: "destructive",
      });
      return;
    }

    if (formData.category_id && !isValidUUID(formData.category_id)) {
      toast({
        title: "Error",
        description: "Please select a valid category.",
        variant: "destructive",
      });
      return;
    }

    if (imageFile) {
      const imageUrl = await uploadImage();
      if (imageUrl) {
        formData.image = imageUrl;
      }
    }

    try {
      const productData = {
        ...formData,
        car_models: selectedCarModels
      };

      onSave(productData);
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error saving product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const carModelsByMake = categoryMakes.reduce((acc, make) => {
    acc[make] = filteredCarModels.filter(model => 
      (model.originalMake || model.make).toLowerCase() === make.toLowerCase()
    );
    return acc;
  }, {} as Record<string, CarModel[]>);

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter product name"
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
          placeholder="Enter product description"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="shop_id">Shop</Label>
        <Select 
          value={formData.shop_id} 
          onValueChange={(value) => handleSelectChange("shop_id", value)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a shop" />
          </SelectTrigger>
          <SelectContent>
            {shops.length === 0 ? (
              <SelectItem value="no-shop" disabled>No shops available</SelectItem>
            ) : (
              shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category_id">Category</Label>
        <Select 
          value={formData.category_id || "none"} 
          onValueChange={(value) => handleSelectChange("category_id", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {shopCategories.length > 0 ? (
              shopCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-categories" disabled>
                No categories for this shop
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => handleSelectChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Compatible Car Models</Label>
        <div className="border rounded-md p-3">
          {selectedCategoryName ? (
            <>
              <div className="mb-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search car models..."
                    value={carModelSearch}
                    onChange={(e) => setCarModelSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              {Object.keys(carModelsByMake).length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto mt-2">
                  {Object.keys(carModelsByMake).map((make) => (
                    <div key={make} className="mb-3">
                      <h3 className="font-medium mb-1">{make}</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {carModelsByMake[make].map((model) => (
                          <div key={model.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`model-${model.id}`}
                              checked={selectedCarModels.includes(model.id)}
                              onCheckedChange={() => handleCarModelToggle(model.id)}
                            />
                            <Label htmlFor={`model-${model.id}`} className="text-sm cursor-pointer">
                              {model.model} ({model.year_start}{model.year_end ? ` - ${model.year_end}` : '+'})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No car models found matching category "{selectedCategoryName}"
                </div>
              )}
              
              <div className="mt-2 text-sm text-muted-foreground">
                {selectedCarModels.length} car models selected
              </div>
            </>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              {formData.category_id 
                ? "No car models available for this category" 
                : "Select a category to see compatible car models"}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">Product Image</Label>
        <div className="flex flex-col gap-4">
          {previewUrl && (
            <div className="relative w-32 h-32 border rounded-md overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Product preview" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              id="image-file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="max-w-sm"
            />
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <Input
            id="image"
            name="image"
            value={formData.image || ""}
            onChange={handleChange}
            placeholder="Or enter image URL directly"
            className="max-w-sm"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving || uploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving || uploading}>
          {isSaving || uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? "Uploading..." : "Saving..."}
            </>
          ) : (
            product ? "Update Product" : "Create Product"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
