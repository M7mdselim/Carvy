
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Box, 
  ShoppingBag, 
  Tags, 
  Car, 
  Users, 
  LogOut, 
  Menu, 
  ChevronLeft, 
  Receipt, 
  Ribbon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  signOut: () => Promise<void>;
}

const AdminSidebar = ({ 
  collapsed, 
  setCollapsed, 
  activeTab, 
  setActiveTab, 
  signOut 
}: AdminSidebarProps) => {
  const { isAdmin, isOwner, user, userRole } = useAuth();
  const isMobile = useIsMobile();
  const [hovering, setHovering] = useState(false);
  
  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile, setCollapsed]);
  
  // Filter sidebar items based on user role
  const sidebarItems = [
    // Only show Dashboard for admin users
    ...(isAdmin ? [{ id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> }] : []),
    { id: "products", label: "Products", icon: <Box className="h-5 w-5" /> },
    { id: "shops", label: "Shops", icon: <ShoppingBag className="h-5 w-5" /> },
    { id: "categories", label: "Categories", icon: <Tags className="h-5 w-5" /> },
    { id: "car-models", label: "Car Models", icon: <Car className="h-5 w-5" /> },
    { id: "orders", label: "Orders", icon: <Ribbon className="h-5 w-5" /> },
    { id: "transactions", label: "Transactions", icon: <Receipt className="h-5 w-5" /> },
    // Only show Users tab for admin users
    ...(isAdmin ? [{ id: "users", label: "Users", icon: <Users className="h-5 w-5" /> }] : [])
  ];

  // Helper to get the user role display text
  const getUserRoleDisplay = () => {
    if (isAdmin) return "Administrator";
    if (isOwner) return "Shop Owner";
    return "User";
  };

  return (
    <div 
      className={cn(
        "border-r bg-background h-screen transition-all duration-300 fixed top-0 left-0 z-40",
        collapsed ? "w-16" : "w-64",
        hovering && collapsed && !isMobile ? "w-64 shadow-lg" : ""
      )}
      onMouseEnter={() => !isMobile && setHovering(true)}
      onMouseLeave={() => !isMobile && setHovering(false)}
    >
      <div className="border-b p-2 sm:p-4 flex items-center justify-between">
        {(!collapsed || (hovering && !isMobile)) && (
          <div className="font-semibold text-lg truncate">{user?.email || "Admin Panel"}</div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)} 
          className={cn(collapsed && !hovering && "mx-auto")}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1 sm:space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                (collapsed && !hovering) ? "px-2" : "px-4"
              )}
              onClick={() => setActiveTab(item.id)}
              size={isMobile ? "sm" : "default"}
            >
              {item.icon}
              {(!collapsed || (hovering && !isMobile)) && <span className="ml-2 whitespace-nowrap">{item.label}</span>}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t p-2 sm:p-4">
        {(!collapsed || (hovering && !isMobile)) && user?.email && (
          <div className="px-4 py-2">
            <div className="text-sm truncate mb-1">{user.email}</div>
            <div className="text-xs text-muted-foreground font-medium">{getUserRoleDisplay()}</div>
          </div>
        )}
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start",
            (collapsed && !hovering) ? "px-2" : "px-4"
          )}
          onClick={signOut}
          size={isMobile ? "sm" : "default"}
        >
          <LogOut className="h-5 w-5" />
          {(!collapsed || (hovering && !isMobile)) && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
