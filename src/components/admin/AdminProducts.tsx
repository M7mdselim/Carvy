
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductForm from "./forms/ProductForm";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "./orders/utils";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  status: string;
  shop_id: string;
  category_id: string | null;
  image: string | null;
  created_at: string | null;
  shop_name?: string;
  car_models?: string[];
}

interface Shop {
  id: string;
  name: string;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin, ownerId } = useAuth();
  const [ownerShopIds, setOwnerShopIds] = useState<string[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | "all">("all");

  // Fetch owner's shops
  useEffect(() => {
    const fetchOwnerShops = async () => {
      if (!isAdmin && ownerId) {
        try {
          const { data, error } = await supabase
            .from("shops")
            .select("id, name")
            .eq("owner_id", ownerId);

          if (error) throw error;
          setOwnerShopIds(data.map(shop => shop.id));
          setShops(data);
          
          // If owner has shops, set the default selected shop to the first one
          if (data.length > 0) {
            setSelectedShopId(data[0].id);
          }
        } catch (error: any) {
          console.error("Error fetching owner shops:", error);
        }
      } else if (isAdmin) {
        // Fetch all shops for admin
        try {
          const { data, error } = await supabase
            .from("shops")
            .select("id, name")
            .order("name");

          if (error) throw error;
          setShops(data || []);
        } catch (error: any) {
          console.error("Error fetching shops:", error);
        }
      }
    };

    fetchOwnerShops();
  }, [isAdmin, ownerId]);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          shops:shop_id (
            name
          )
        `);
      
      // Filter by selected shop if not "all"
      if (selectedShopId !== "all") {
        query = query.eq("shop_id", selectedShopId);
      }
      // If user is not admin and has shops, filter products by shop_id
      else if (!isAdmin && ownerShopIds.length > 0) {
        query = query.in("shop_id", ownerShopIds);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to include shop_name
      const productsWithShopName = data?.map(product => ({
        ...product,
        shop_name: product.shops?.name
      })) || [];
      
      setProducts(productsWithShopName);
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || ownerShopIds.length > 0 || (!isAdmin && !ownerId)) {
      fetchProducts();
    }
  }, [isAdmin, ownerShopIds, selectedShopId]);

  // Handle add/edit product
  const handleAddEdit = async (product: Product | null) => {
    let productWithCarModels = product;
    
    if (product?.id) {
      try {
        // Fetch associated car models for the product
        const { data: carModelData, error } = await supabase
          .from("product_car_models")
          .select("car_model_id")
          .eq("product_id", product.id);
          
        if (error) throw error;
        
        const carModelIds = carModelData.map(item => item.car_model_id);
        productWithCarModels = {
          ...product,
          car_models: carModelIds
        };
      } catch (error) {
        console.error("Error fetching product car models:", error);
      }
    }
    
    setSelectedProduct(productWithCarModels);
    setOpenDialog(true);
  };

  // Handle delete product
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: "Product has been removed successfully",
      });

      setProducts(products.filter(product => product.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle save product
  const handleSave = async (product: Product) => {
    setIsSaving(true);
    try {
      console.log("Saving product with shop_id:", product.shop_id);
      
      // For non-admin users, verify the shop belongs to them
      if (!isAdmin && !ownerShopIds.includes(product.shop_id)) {
        throw new Error("You don't have permission to add products to this shop");
      }

      // Validate shop_id
      if (!product.shop_id || product.shop_id === "") {
        throw new Error("Shop ID is required");
      }

      let result;
      let productId = product.id;

      if (product.id) {
        // Update existing product
        result = await supabase
          .from("products")
          .update({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            status: product.status,
            shop_id: product.shop_id,
            category_id: product.category_id,
            image: product.image
          })
          .eq("id", product.id)
          .select();
      } else {
        // Insert new product
        result = await supabase
          .from("products")
          .insert({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            status: product.status,
            shop_id: product.shop_id,
            category_id: product.category_id,
            image: product.image
          })
          .select();
          
        if (result.data && result.data.length > 0) {
          productId = result.data[0].id;
        }
      }

      if (result.error) throw result.error;
      
      // Save car model relationships if productId exists
      if (productId && product.car_models && product.car_models.length > 0) {
        try {
          // First delete existing relationships
          await supabase
            .from("product_car_models")
            .delete()
            .eq("product_id", productId);
            
          // Create array of objects for insert
          const carModelRelations = product.car_models.map((modelId: string) => ({
            product_id: productId,
            car_model_id: modelId
          }));
          
          // Insert new relationships
          const { error } = await supabase
            .from("product_car_models")
            .insert(carModelRelations);
          
          if (error) throw error;
        } catch (error) {
          console.error("Error saving product car models:", error);
          // Don't throw here, we still want to show success for the product save
        }
      } else if (productId) {
        // If no car models selected, clear existing relationships
        try {
          await supabase
            .from("product_car_models")
            .delete()
            .eq("product_id", productId);
        } catch (error) {
          console.error("Error clearing product car models:", error);
        }
      }

      toast({
        title: product.id ? "Product updated" : "Product created",
        description: product.id
          ? "Product has been updated successfully"
          : "New product has been created successfully",
      });

      setOpenDialog(false);
      fetchProducts();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error saving product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShopChange = (value: string) => {
    setSelectedShopId(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Products</h2>
        <Button onClick={() => handleAddEdit(null)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Shop Filter */}
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
        <div className="w-full sm:w-64">
          <Label htmlFor="shop-filter" className="mb-2 block">
            Filter by Shop
          </Label>
          <Select 
            value={selectedShopId.toString()} 
            onValueChange={handleShopChange}
          >
            <SelectTrigger className="w-full" id="shop-filter">
              <SelectValue placeholder="Select a shop" />
            </SelectTrigger>
            <SelectContent>
              {isAdmin && (
                <SelectItem value="all">All Shops</SelectItem>
              )}
              {shops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}
                </SelectItem>
              ))}
              {shops.length === 0 && (
                <SelectItem value="no-shops" disabled>
                  No shops available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Shop</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {!isAdmin && ownerShopIds.length === 0 
                      ? "You don't have any shops yet. Create a shop first to add products."
                      : "No products found. Add your first product!"}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.shop_name}</TableCell>
                    <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddEdit(product)}
                          aria-label="Edit product"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          aria-label="Delete product"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              Fill in the product details below.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onSave={handleSave}
            onCancel={() => setOpenDialog(false)}
            isSaving={isSaving}
            ownerShopIds={!isAdmin ? ownerShopIds : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
