
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DarkModeToggle from "@/components/DarkModeToggle";

interface AdminHeaderProps {
  activeTab: string;
}

const AdminHeader = ({ activeTab }: AdminHeaderProps) => {
  const navigate = useNavigate();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard": return "Dashboard";
      case "products": return "Products Management";
      case "shops": return "Shops Management";
      case "categories": return "Categories Management";
      case "car-models": return "Car Models Management";
      case "users": return "User Management";
      case "transactions": return "Transactions";
      default: return "Dashboard";
    }
  };

  return (
    <header className="sticky top-0 z-10 h-14 sm:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-full px-3 sm:px-6">
        <div>
          <h1 className="text-base sm:text-xl font-semibold truncate">{getTabTitle(activeTab)}</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <DarkModeToggle />
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="h-8 sm:h-9">
            <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> 
            <span className="text-xs sm:text-sm">Home</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
