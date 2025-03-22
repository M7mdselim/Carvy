
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Loader2, Check, X, Shield, User, Mail, Calendar, Key, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Profile } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import EditUserDialog from "./EditUserDialog";

interface UsersListProps {
  refreshTrigger?: number;
}

const UsersList = ({ refreshTrigger }: UsersListProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles from the 'profiles' table
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, is_admin, owner_id, created_at");

      if (profilesError) throw profilesError;

      // Map 'username' to 'email' for compatibility
      const profilesWithEmail: Profile[] = profilesData.map((profile) => ({
        ...profile,
        email: profile.username || "Unknown",
      }));

      setProfiles(profilesWithEmail);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch profiles on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.owner_id && profile.owner_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isMobile) {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: '2-digit'
      }).format(date);
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            Refresh
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredProfiles.length} users found
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className={isMobile ? "hidden sm:inline" : ""}>Email</span>
                </div>
              </TableHead>
              {!isMobile && (
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Key className="h-4 w-4" />
                    <span>ID</span>
                  </div>
                </TableHead>
              )}
              <TableHead>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className={isMobile ? "hidden sm:inline" : ""}>Admin</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className={isMobile ? "hidden sm:inline" : ""}>Owner</span>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className={isMobile ? "hidden sm:inline" : ""}>Created</span>
                </div>
              </TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isMobile ? 5 : 6} className="text-center py-4 sm:py-8 text-muted-foreground">
                  No users found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredProfiles.map((profile) => (
                <TableRow key={profile.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium truncate max-w-[120px] sm:max-w-full">
                    {profile.email}
                  </TableCell>
                  {!isMobile && (
                    <TableCell className="font-mono text-xs truncate max-w-[80px] sm:max-w-full">
                      {profile.id}
                    </TableCell>
                  )}
                  <TableCell>
                    {profile.is_admin ? (
                      <div className="flex items-center">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center">
                          <Check className="h-3 w-3 mr-0.5 sm:mr-1" />
                          {!isMobile ? "" : "Admin"}
                        </span>
                      </div>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {isMobile ? "✗" : "User"}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {profile.owner_id ? (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {isMobile ? "✓" : "Owner"}
                      </span>
                    ) : (
                      <span className="text-gray-400">{isMobile ? "✗" : "None"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs">{formatDate(profile.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditUser(profile)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit user</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditUserDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        user={selectedUser} 
        onUserUpdated={fetchUsers}
      />
    </div>
  );
};

export default UsersList;
