
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Profile } from "./types";
import { Loader2 } from "lucide-react";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile | null;
  onUserUpdated: () => void;
}

const EditUserDialog = ({ open, onOpenChange, user, onUserUpdated }: EditUserDialogProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerId, setOwnerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Reset form when dialog opens with a new user
  useEffect(() => {
    if (user) {
      setIsAdmin(!!user.is_admin);
      setIsOwner(!!user.owner_id);
      setOwnerId(user.owner_id || "");
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update is_admin status
      const { error: adminError } = await supabase
        .from("profiles")
        .update({ is_admin: isAdmin })
        .eq("id", user.id);

      if (adminError) throw adminError;

      // Update owner status and ownerId
      // If isOwner is true, use the provided ownerId
      // If isOwner is false, set owner_id to null
      const finalOwnerId = isOwner ? (ownerId || null) : null;

      const { error: ownerError } = await supabase
        .from("profiles")
        .update({ owner_id: finalOwnerId })
        .eq("id", user.id);

      if (ownerError) throw ownerError;

      toast({
        title: "User updated",
        description: "User permissions have been updated successfully",
      });
      
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error updating user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Permissions</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admin-switch">Admin User</Label>
              <p className="text-xs text-muted-foreground">
                Can access all areas and manage users
              </p>
            </div>
            <Switch
              id="admin-switch"
              checked={isAdmin}
              onCheckedChange={setIsAdmin}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="owner-switch">Shop Owner</Label>
              <p className="text-xs text-muted-foreground">
                Can manage their own shops and products
              </p>
            </div>
            <Switch
              id="owner-switch"
              checked={isOwner}
              onCheckedChange={setIsOwner}
              disabled={isLoading}
            />
          </div>

          {isOwner && (
            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner ID</Label>
              <Input
                id="ownerId"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="Enter Owner ID (optional)"
                disabled={isLoading}
              />
              <div className="text-xs text-muted-foreground">
                Leave blank to set as null
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
