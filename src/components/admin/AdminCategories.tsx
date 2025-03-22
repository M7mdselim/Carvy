
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CategoryForm from "./forms/CategoryForm";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  id: string;
  name: string;
  icon: string;
  created_at: string | null;
}

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching categories",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = (category: Category | null) => {
    setSelectedCategory(category);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Category deleted",
        description: "Category has been removed successfully",
      });
      
      setCategories(categories.filter(category => category.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async (category: Category) => {
    try {
      let result;
      
      if (category.id) {
        // Update existing category
        result = await supabase
          .from("categories")
          .update({
            name: category.name,
            icon: category.icon
          })
          .eq("id", category.id)
          .select();
      } else {
        // Insert new category
        result = await supabase
          .from("categories")
          .insert({
            name: category.name,
            icon: category.icon
          })
          .select();
      }

      if (result.error) throw result.error;
      
      toast({
        title: category.id ? "Category updated" : "Category created",
        description: category.id 
          ? "Category has been updated successfully" 
          : "New category has been created successfully",
      });
      
      setOpenDialog(false);
      fetchCategories();
    } catch (error: any) {
      toast({
        title: "Error saving category",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Helper function to determine if a string is a URL
  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        {isAdmin && (
          <Button onClick={() => handleAddEdit(null)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
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
                <TableHead>Name</TableHead>
                <TableHead>Icon</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 3 : 2} className="text-center py-8 text-muted-foreground">
                    No categories found. {isAdmin ? "Add your first category!" : ""}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      {isValidUrl(category.icon) ? (
                        <img 
                          src={category.icon} 
                          alt={category.name} 
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground">{category.icon || "No icon"}</span>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleAddEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {isAdmin && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedCategory ? "Edit Category" : "Add New Category"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm 
              category={selectedCategory} 
              onSave={handleSave} 
              onCancel={() => setOpenDialog(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminCategories;
