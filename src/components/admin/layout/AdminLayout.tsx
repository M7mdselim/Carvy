
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminLayoutProps {
  activeTab: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  signOut: () => Promise<void>;
  loading: boolean;
  children: ReactNode;
}

const AdminLayout = ({
  activeTab,
  collapsed,
  setCollapsed,
  setActiveTab,
  signOut,
  loading,
  children
}: AdminLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <AdminSidebar
        activeTab={activeTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setActiveTab={setActiveTab}
        signOut={signOut}
      />

      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "ml-16" : "ml-16 sm:ml-64",
      )}>
        <AdminHeader activeTab={activeTab} />

        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-auto">
            <div className="max-w-full">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
