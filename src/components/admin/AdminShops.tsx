import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ShopForm from "./forms/ShopForm";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { debounce } from "lodash";
import { useAuth } from "@/contexts/AuthContext";

interface Shop {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  rating: number | null;
  review_count: number | null;
  logo: string | null;
  created_at: string | null;
}

const AdminShops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const { toast } = useToast();
  const { isAdmin, user, ownerId } = useAuth();

  // Create storage bucket if it doesn't exist
  async function createStorageBucket() {
    try {
      const { data, error } = await supabase.storage.createBucket('Shops Photos', {
        public: true,
      });

      if (error) {
        if (error.message.includes('already exists')) {
          console.log('Bucket already exists');
        } else {
          console.error('Error creating bucket:', error);
        }
      } else {
        console.log('Bucket created successfully:', data);
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
    }
}


  // Fetch shops with debouncing
  const fetchShops = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("shops")
        .select("*");
      
      if (!isAdmin && ownerId) {
        query = query.eq("owner_id", ownerId);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      setShops(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching shops",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchShops = debounce(fetchShops, 300); // Debounced fetch

  useEffect(() => {
    createStorageBucket();
    debouncedFetchShops(); // Use debounced fetch
  }, [ownerId, isAdmin]);

  // Handle add/edit shop
  const handleAddEdit = (shop: Shop | null) => {
    // Only admins can add shops and only admins or shop owners can edit their own shops
    if (!isAdmin && (!shop || (shop && shop.owner_id !== ownerId))) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to edit this shop",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedShop(shop);
    setOpenDialog(true);
  };

  // Handle delete shop with optimistic updates
  const handleDelete = async (id: string) => {
    // Only admins can delete shops
    if (!isAdmin) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete shops",
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm("Are you sure you want to delete this shop?")) return;

    const previousShops = [...shops]; // Store previous state for rollback
    setShops(shops.filter(shop => shop.id !== id)); // Optimistic update

    try {
      const { error } = await supabase
        .from("shops")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Shop deleted",
        description: "Shop has been removed successfully",
      });
    } catch (error: any) {
      setShops(previousShops); // Rollback on error
      toast({
        title: "Error deleting shop",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle save shop (add or edit)
  const handleSave = async (shop: Shop) => {
    try {
      let result;

      if (!isAdmin && ownerId) {
        shop.owner_id = ownerId;
      }

      if (shop.id) {
        if (!isAdmin) {
          const { data } = await supabase
            .from("shops")
            .select("owner_id")
            .eq("id", shop.id)
            .single();
            
          if (data?.owner_id !== ownerId) {
            throw new Error("You don't have permission to edit this shop");
          }
        }
        
        result = await supabase
          .from("shops")
          .update({
            name: shop.name,
            description: shop.description,
            logo: shop.logo,
            rating: shop.rating,
            review_count: shop.review_count,
            owner_id: shop.owner_id,
          })
          .eq("id", shop.id)
          .select();
      } else {
        result = await supabase
          .from("shops")
          .insert({
            name: shop.name,
            description: shop.description,
            logo: shop.logo,
            owner_id: shop.owner_id || (ownerId || "00000000-0000-0000-0000-000000000000"),
            rating: shop.rating || 0,
            review_count: shop.review_count || 0,
          })
          .select();
      }

      if (result.error) throw result.error;

      sonnerToast.success(shop.id ? "Shop updated" : "Shop created", {
        description: shop.id
          ? "Shop has been updated successfully"
          : "New shop has been created successfully",
      });

      setOpenDialog(false);
      debouncedFetchShops(); // Use debounced fetch
    } catch (error: any) {
      toast({
        title: "Error saving shop",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Shops</h2>
        {isAdmin && (
          <Button onClick={() => handleAddEdit(null)}>
            <Plus className="mr-2 h-4 w-4" /> Add Shop
          </Button>
        )}
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
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviews</TableHead>
                {isAdmin && <TableHead>Owner ID</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    No shops found.
                  </TableCell>
                </TableRow>
              ) : (
                shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>
                      {shop.logo ? (
                        <img
                          src={shop.logo}
                          alt={shop.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                          {shop.name.charAt(0)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>{shop.rating ? shop.rating.toFixed(1) : "N/A"}</TableCell>
                    <TableCell>{shop.review_count || 0}</TableCell>
                    {isAdmin && <TableCell className="font-mono text-xs">{shop.owner_id}</TableCell>}
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* Only allow admins to edit any shop, or shop owners to edit their own shops */}
                        {(isAdmin || shop.owner_id === ownerId) && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddEdit(shop)}
                            aria-label="Edit shop"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Only allow admins to delete shops */}
                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(shop.id)}
                            aria-label="Delete shop"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
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
              {selectedShop ? "Edit Shop" : "Add New Shop"}
            </DialogTitle>
          </DialogHeader>
          <ShopForm
            shop={selectedShop}
            onSave={handleSave}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminShops;
