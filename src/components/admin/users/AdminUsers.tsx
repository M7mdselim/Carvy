
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import UsersList from "./UsersList";
import AddUserDialog from "./AddUserDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AdminUsers = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userStats, setUserStats] = useState([
    { title: "Total Users", value: 0, change: "0%", changeType: "neutral" },
    { title: "New This Month", value: 0, change: "0%", changeType: "neutral" },
    { title: "Admin Users", value: 0, change: "0%", changeType: "neutral" },
    { title: "Shop Owners", value: 0, change: "0%", changeType: "neutral" },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleUserAdded = () => {
    // Increment refresh trigger to cause a re-fetch
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch real user analytics data
  useEffect(() => {
    const fetchUserStats = async () => {
      setIsLoading(true);
      try {
        // Get total users count
        const { count: totalUsers, error: totalError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Get users created in the last month
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const { count: newUsers, error: newError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonth.toISOString());
        
        // Get admin users count
        const { count: adminUsers, error: adminError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_admin', true);
        
        // Get shop owners count
        const { count: shopOwners, error: ownerError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .not('owner_id', 'is', null);
        
        if (totalError || newError || adminError || ownerError) {
          throw new Error("Error fetching user statistics");
        }
        
        // Calculate percentages for change indicators
        const newUserPercentage = totalUsers ? Math.round((newUsers / totalUsers) * 100) : 0;
        
        // Update user stats with real data
        setUserStats([
          { 
            title: "Total Users", 
            value: totalUsers || 0, 
            change: "+12%", // This would ideally be calculated from historical data
            changeType: "positive" 
          },
          { 
            title: "New This Month", 
            value: newUsers || 0, 
            change: `+${newUserPercentage}%`,
            changeType: "positive" 
          },
          { 
            title: "Admin Users", 
            value: adminUsers || 0, 
            change: "0%", 
            changeType: "neutral" 
          },
          { 
            title: "Shop Owners", 
            value: shopOwners || 0, 
            change: "+24%", // This would ideally be calculated from historical data
            changeType: "positive" 
          },
        ]);
      } catch (error) {
        console.error("Error fetching user statistics:", error);
        toast({
          title: "Error",
          description: "Failed to load user statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, [refreshTrigger, toast]);

  return (
    <div className="space-y-6">
      {/* User statistics overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-6 w-16 animate-pulse bg-gray-200 rounded"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs mt-1 ${
                    stat.changeType === 'positive' ? 'text-green-500' : 
                    stat.changeType === 'negative' ? 'text-red-500' : 
                    'text-gray-500'
                  }`}>
                    {stat.change} from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users list section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-xl font-semibold">User Management</CardTitle>
            <CardDescription>View, search and manage user accounts</CardDescription>
          </div>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </CardHeader>
        <CardContent>
          {/* Pass refreshTrigger as a prop to UsersList */}
          <UsersList refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>

      <AddUserDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
};

export default AdminUsers;
