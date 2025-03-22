
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CarModelForm from "./forms/CarModelForm";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CarModel {
  id: string;
  make: string;
  model: string;
  year_start: number;
  year_end: number | null;
  created_at: string | null;
}

const AdminCarModels = () => {
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCarModel, setSelectedCarModel] = useState<CarModel | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchCarModels();
  }, []);

  const fetchCarModels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("car_models")
        .select("*")
        .order("make")
        .order("model");

      if (error) throw error;
      setCarModels(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching car models",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEdit = (carModel: CarModel | null) => {
    setSelectedCarModel(carModel);
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car model?")) return;

    try {
      const { error } = await supabase
        .from("car_models")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Car model deleted",
        description: "Car model has been removed successfully",
      });
      
      setCarModels(carModels.filter(carModel => carModel.id !== id));
    } catch (error: any) {
      toast({
        title: "Error deleting car model",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async (carModel: CarModel) => {
    try {
      let result;
      
      if (carModel.id) {
        // Update existing car model
        result = await supabase
          .from("car_models")
          .update({
            make: carModel.make,
            model: carModel.model,
            year_start: carModel.year_start,
            year_end: carModel.year_end,
          })
          .eq("id", carModel.id)
          .select();
      } else {
        // Insert new car model
        result = await supabase
          .from("car_models")
          .insert({
            make: carModel.make,
            model: carModel.model,
            year_start: carModel.year_start,
            year_end: carModel.year_end,
          })
          .select();
      }

      if (result.error) throw result.error;
      
      toast({
        title: carModel.id ? "Car model updated" : "Car model created",
        description: carModel.id 
          ? "Car model has been updated successfully" 
          : "New car model has been created successfully",
      });
      
      setOpenDialog(false);
      fetchCarModels();
    } catch (error: any) {
      toast({
        title: "Error saving car model",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Car Models</h2>
        {isAdmin && (
          <Button onClick={() => handleAddEdit(null)}>
            <Plus className="mr-2 h-4 w-4" /> Add Car Model
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
                <TableHead>Make</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Year Range</TableHead>
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {carModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-muted-foreground">
                    No car models found. {isAdmin ? "Add your first car model!" : ""}
                  </TableCell>
                </TableRow>
              ) : (
                carModels.map((carModel) => (
                  <TableRow key={carModel.id}>
                    <TableCell className="font-medium">{carModel.make}</TableCell>
                    <TableCell>{carModel.model}</TableCell>
                    <TableCell>
                      {carModel.year_start} - {carModel.year_end || "Present"}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleAddEdit(carModel)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDelete(carModel.id)}
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
                {selectedCarModel ? "Edit Car Model" : "Add New Car Model"}
              </DialogTitle>
            </DialogHeader>
            <CarModelForm 
              carModel={selectedCarModel} 
              onSave={handleSave} 
              onCancel={() => setOpenDialog(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminCarModels;
