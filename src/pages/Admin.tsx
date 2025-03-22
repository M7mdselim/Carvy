
import { useState, useEffect } from "react";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminShops from "@/components/admin/AdminShops";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminCarModels from "@/components/admin/AdminCarModels";
import AdminUsers from "@/components/admin/users/AdminUsers";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/admin/layout/AdminLayout";
import { useAdminSetup } from "@/hooks/useAdminSetup";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import DashboardOverview from "@/components/admin/dashboard/DashboardOverview";
import TransactionsTable from "@/components/admin/transactions/TransactionsTable";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import AdminOrders from "@/components/admin/orders/AdminOrders";
import { FilterParams } from "@/components/admin/orders/types";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin, isOwner, signOut, isLoading } = useAuth();
  const { loading: setupLoading } = useAdminSetup();
  const { analytics, loading: analyticsLoading } = useAdminAnalytics();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filterParams, setFilterParams] = useState<FilterParams | undefined>();

  const loading = setupLoading || analyticsLoading;

  // Set default active tab based on user role
  useEffect(() => {
    if (!isLoading) {
      if (isAdmin) {
        setActiveTab("dashboard");
      } else if (isOwner) {
        setActiveTab("products");
      }
    }
  }, [isAdmin, isOwner, isLoading]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // Redirect users who are not admin or shop owners to homepage
  useEffect(() => {
    if (!isLoading && !isAdmin && !isOwner) {
      navigate("/");
    }
  }, [isAdmin, isOwner, isLoading, navigate]);

  // Handle dashboard filter navigation
  const handleDashboardFilterChange = (params: FilterParams) => {
    setFilterParams(params);
    setActiveTab("orders");
  };

  // Function to render the active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case "products":
        return <AdminProducts />;
      case "shops":
        return <AdminShops />;
      case "categories":
        return <AdminCategories />;
      case "car-models":
        return <AdminCarModels />;
      case "users":
        return isAdmin ? <AdminUsers /> : null;
      case "transactions":
        return <TransactionsTable initialFilter={filterParams?.paymentMethod === 'cash' || filterParams?.paymentMethod === 'cash_on_delivery' ? 'cash' : 
                                 filterParams?.paymentMethod === 'credit_card' || filterParams?.paymentMethod === 'debit_card' ? 'credit_card' : undefined} 
                                 initialDateRange={filterParams?.dateRange} />;
      case "orders":
        return <AdminOrders initialFilter={filterParams} />;
      case "dashboard":
        return isAdmin ? <DashboardOverview analytics={analytics} onFilterChange={handleDashboardFilterChange} /> : null;
      default:
        return isAdmin ? <DashboardOverview analytics={analytics} onFilterChange={handleDashboardFilterChange} /> : <AdminProducts />;
    }
  };

  // If user is neither admin nor shop owner, don't render admin page
  if (!isLoading && !isAdmin && !isOwner) {
    return null;
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      setActiveTab={setActiveTab}
      signOut={signOut}
      loading={loading}
    >
      {renderActiveTab()}
    </AdminLayout>
  );
};

export default Admin;
