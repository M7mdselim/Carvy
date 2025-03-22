import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Key, Shield, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { NewUserForm } from "./types";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

const AddUserDialog = ({ open, onOpenChange, onUserAdded }: AddUserDialogProps) => {
  const { toast } = useToast();
  
  // Form data for new user
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: "",
    password: "",
    isAdmin: false,
    isOwner: false,
    ownerId: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle switch toggles
  const handleSwitchChange = (name: keyof NewUserForm, value: boolean) => {
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  // Create a new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create user with supabase auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            is_admin: newUser.isAdmin,
            owner_id: newUser.isOwner ? newUser.ownerId : null
          }
        }
      });
      
      if (authError) throw authError;
      
      // Fix: Now we're using data instead of authData
      const userId = data.user?.id;
      if (!userId) throw new Error("Failed to create user");
      
      // For shop owner, only use the ownerId if it's provided, otherwise keep as null
      const ownerId = newUser.isOwner && newUser.ownerId ? newUser.ownerId : null;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_admin: newUser.isAdmin,
          owner_id: ownerId
        })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      toast({
        title: "User Created",
        description: `Successfully created user ${newUser.email}`,
      });
      
      // Reset form and close dialog
      setNewUser({
        email: "",
        password: "",
        isAdmin: false,
        isOwner: false,
        ownerId: ""
      });
      
      onOpenChange(false);
      
      // Notify parent component to refresh the list
      onUserAdded();
      
    } catch (error: any) {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account with specific permissions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <Label htmlFor="isAdmin">Admin User</Label>
              </div>
              <Switch
                id="isAdmin"
                checked={newUser.isAdmin}
                onCheckedChange={(checked) => handleSwitchChange('isAdmin', checked)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-500" />
                <Label htmlFor="isOwner">Shop Owner</Label>
              </div>
              <Switch
                id="isOwner"
                checked={newUser.isOwner}
                onCheckedChange={(checked) => handleSwitchChange('isOwner', checked)}
              />
            </div>
          </div>
          
          {newUser.isOwner && (
            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner ID (Optional)</Label>
              <Input
                id="ownerId"
                name="ownerId"
                value={newUser.ownerId}
                onChange={handleChange}
                placeholder="Enter Owner ID if needed"
              />
              <div className="text-xs text-gray-500">
                Leave blank to set as null (can be edited later)
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
