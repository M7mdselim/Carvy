
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
}

interface ShopCategory {
  id: string;
  shop_id: string;
  category_id: string;
  category?: Category;
}

interface ShopCategoryManagerProps {
  shopId: string;
}

const ShopCategoryManager = ({ shopId }: ShopCategoryManagerProps) => {
  const [shopCategories, setShopCategories] = useState<ShopCategory[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch existing shop categories
      const { data: shopCategoriesData, error: shopCategoriesError } = await supabase
        .from("shop_categories")
        .select(`
          id,
          shop_id,
          category_id,
          category:categories(id, name)
        `)
        .eq("shop_id", shopId);

      if (shopCategoriesError) throw shopCategoriesError;
      setShopCategories(shopCategoriesData || []);

      // Fetch all categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Filter out categories that are already assigned to this shop
      const assignedCategoryIds = shopCategoriesData?.map(sc => sc.category_id) || [];
      const filtered = categoriesData?.filter(c => !assignedCategoryIds.includes(c.id)) || [];
      
      setAvailableCategories(filtered);
      
      // Set initial selected category if available
      if (filtered.length > 0) {
        setSelectedCategoryId(filtered[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching shop categories:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  const handleAddCategory = async () => {
    if (!selectedCategoryId) return;
    
    setAdding(true);
    try {
      const { error } = await supabase
        .from("shop_categories")
        .insert({
          shop_id: shopId,
          category_id: selectedCategoryId,
        });

      if (error) throw error;
      
      toast({
        title: "Category added",
        description: "Category has been added to the shop successfully.",
      });
      
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error adding category",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCategory = async (shopCategoryId: string) => {
    try {
      const { error } = await supabase
        .from("shop_categories")
        .delete()
        .eq("id", shopCategoryId);

      if (error) throw error;
      
      toast({
        title: "Category removed",
        description: "Category has been removed from the shop successfully.",
      });
      
      fetchData(); // Refresh data
    } catch (error: any) {
      toast({
        title: "Error removing category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 border rounded-md p-4 mt-4">
      <h3 className="text-lg font-medium">Shop Categories</h3>
      
      <div className="space-y-2">
        {shopCategories.length > 0 ? (
          <div className="space-y-2">
            <Label>Assigned Categories</Label>
            <div className="flex flex-wrap gap-2">
              {shopCategories.map((sc) => (
                <div key={sc.id} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                  <span>{sc.category?.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => handleRemoveCategory(sc.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">No categories assigned to this shop yet.</p>
        )}
      </div>
      
      {availableCategories.length > 0 ? (
        <div className="flex items-end gap-2">
          <div className="space-y-2 flex-1">
            <Label htmlFor="category">Add Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddCategory} disabled={adding || !selectedCategoryId}>
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" /> Add
              </>
            )}
          </Button>
        </div>
      ) : (
        <p className="text-muted-foreground">All available categories are already assigned to this shop.</p>
      )}
    </div>
  );
};

export default ShopCategoryManager;
