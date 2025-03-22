
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import OrdersList from "./OrdersList";
import OrderDetails from "./OrderDetails";
import { Order, PaymentMethod, OrderStatus, FilterParams } from "./types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { DatePickerWithSingleDefault } from "@/components/ui/date-picker-with-single-default";

interface AdminOrdersProps {
  initialFilter?: FilterParams;
}

const AdminOrders = ({ initialFilter }: AdminOrdersProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter?.status || "all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>(
    initialFilter?.paymentMethod ? 
      (initialFilter.paymentMethod === 'cash' || initialFilter.paymentMethod === 'cash_on_delivery' ? 'cash' : initialFilter.paymentMethod) : 
      "all"
  );
  
  // Date range state
  const [filterDateRange, setFilterDateRange] = useState<DateRange | undefined>(
    initialFilter?.dateRange || undefined
  );
  
  const [filterName, setFilterName] = useState<string>("");
  const [filterPhone, setFilterPhone] = useState<string>("");
  const [filterOrderId, setFilterOrderId] = useState<string>("");
  const [filterProductId, setFilterProductId] = useState<string>(initialFilter?.productId || "");
  const [ownerShopIds, setOwnerShopIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { isAdmin, ownerId } = useAuth();

  const validStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
  const validPaymentMethods: PaymentMethod[] = ["cash", "credit_card"];

  useEffect(() => {
    const fetchOwnerShops = async () => {
      if (!isAdmin && ownerId) {
        try {
          const { data, error } = await supabase
            .from("shops")
            .select("id")
            .eq("owner_id", ownerId);

          if (error) throw error;
          setOwnerShopIds(data?.map(shop => shop.id) || []);
        } catch (error: any) {
          console.error("Error fetching owner shops:", error);
          toast({
            variant: "destructive",
            title: "Failed to load shops",
            description: error.message || "An error occurred while fetching shops.",
          });
        }
      }
    };

    fetchOwnerShops();
  }, [isAdmin, ownerId, toast]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (!isAdmin && ownerShopIds.length > 0) {
        const { data: ownerOrderItems, error: itemsError } = await supabase
          .from("order_items")
          .select(`
            order_id,
            product_id,
            products!inner (
              shop_id
            )
          `)
          .in("products.shop_id", ownerShopIds);

        if (itemsError) throw itemsError;

        const ownerOrderIds = [...new Set(ownerOrderItems?.map(item => item.order_id) || [])];

        if (ownerOrderIds.length === 0) {
          setOrders([]);
          setFilteredOrders([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .in("id", ownerOrderIds)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedOrders = (data || []).map(order => {
          let paymentMethod = order.payment_method;
          if (paymentMethod === 'cash_on_delivery') {
            paymentMethod = 'cash';
          }
          
          return {
            ...order,
            status: validStatuses.includes(order.status as OrderStatus) 
              ? (order.status as OrderStatus) 
              : "pending" as OrderStatus,
            payment_method: validPaymentMethods.includes(paymentMethod as PaymentMethod)
              ? (paymentMethod as PaymentMethod)
              : "credit_card" as PaymentMethod
          };
        });

        console.log("Fetched orders:", formattedOrders);
        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
      } else {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const formattedOrders = (data || []).map(order => {
          let paymentMethod = order.payment_method;
          if (paymentMethod === 'cash_on_delivery') {
            paymentMethod = 'cash';
          }
          
          return {
            ...order,
            status: validStatuses.includes(order.status as OrderStatus) 
              ? (order.status as OrderStatus) 
              : "pending" as OrderStatus,
            payment_method: validPaymentMethods.includes(paymentMethod as PaymentMethod)
              ? (paymentMethod as PaymentMethod)
              : "credit_card" as PaymentMethod
          };
        });

        console.log("Fetched orders:", formattedOrders);
        setOrders(formattedOrders);
        setFilteredOrders(formattedOrders);
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Failed to load orders",
        description: error.message || "An error occurred while fetching orders.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder({
          ...order,
          items: itemsData || []
        });
      }
    } catch (error: any) {
      console.error("Error loading order details:", error);
      toast({
        variant: "destructive",
        title: "Failed to load order details",
        description: error.message || "An error occurred while fetching order details.",
      });
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: status as OrderStatus } : order
      );

      setOrders(updatedOrders);
      applyFilters(updatedOrders);

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: status as OrderStatus });
      }

      toast({
        title: "Order status updated",
        description: `Order #${orderId.substring(0, 8)} status changed to ${status}`,
      });
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast({
        variant: "destructive",
        title: "Failed to update order status",
        description: error.message || "An error occurred while updating the order status.",
      });
    }
  };

  const loadOrdersWithProductId = async (productId: string) => {
    if (!productId) return;
    
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select("order_id")
        .eq("product_id", productId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const orderIds = data.map(item => item.order_id);
        
        const filteredByProduct = orders.filter(order => 
          orderIds.includes(order.id)
        );
        
        setFilteredOrders(filteredByProduct);
      } else {
        // No orders with this product
        setFilteredOrders([]);
      }
    } catch (error: any) {
      console.error("Error filtering by product:", error);
      toast({
        variant: "destructive",
        title: "Failed to filter by product",
        description: error.message || "An error occurred while filtering orders by product.",
      });
    }
  };

  const applyFilters = (ordersToFilter: Order[]) => {
    let filtered = ordersToFilter;

    if (filterStatus !== "all") {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    if (filterPaymentMethod !== "all") {
      filtered = filtered.filter(order => 
        order.payment_method === filterPaymentMethod as PaymentMethod ||
        (filterPaymentMethod === 'cash' && order.payment_method === 'cash_on_delivery' as PaymentMethod)
      );
    }

    // Updated date filtering to use date range
    if (filterDateRange?.from) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        
        // If both from and to dates are set, check if order date is within range
        if (filterDateRange.from && filterDateRange.to) {
          return isWithinInterval(orderDate, {
            start: filterDateRange.from,
            end: filterDateRange.to
          });
        }
        
        // If only from date is set, check if order date is on or after from date
        const orderDateStr = format(orderDate, "yyyy-MM-dd");
        const fromDateStr = format(filterDateRange.from, "yyyy-MM-dd");
        return orderDateStr >= fromDateStr;
      });
    }

    if (filterName) {
      filtered = filtered.filter(order => {
        const fullName = `${order.first_name || ""} ${order.last_name || ""}`.toLowerCase();
        return fullName.includes(filterName.toLowerCase());
      });
    }

    if (filterPhone) {
      filtered = filtered.filter(order => 
        order.phone?.includes(filterPhone)
      );
    }

    if (filterOrderId) {
      const cleanOrderId = filterOrderId.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      filtered = filtered.filter(order => 
        order.id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().includes(cleanOrderId)
      );
    }
    
    setFilteredOrders(filtered);
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case "status":
        setFilterStatus(value);
        break;
      case "paymentMethod":
        setFilterPaymentMethod(value);
        break;
      case "name":
        setFilterName(value);
        break;
      case "phone":
        setFilterPhone(value);
        break;
      case "orderId":
        setFilterOrderId(value);
        break;
      default:
        break;
    }
  };

  const clearFilters = () => {
    setFilterStatus("all");
    setFilterPaymentMethod("all");
    setFilterDateRange(undefined);
    setFilterName("");
    setFilterPhone("");
    setFilterOrderId("");
    setFilterProductId("");
    setFilteredOrders(orders);
  };

  // Apply regular filters
  useEffect(() => {
    if (filterProductId) {
      loadOrdersWithProductId(filterProductId);
    } else {
      applyFilters(orders);
    }
  }, [filterStatus, filterPaymentMethod, filterDateRange, filterName, filterPhone, filterOrderId, orders]);

  // Apply filter from props
  useEffect(() => {
    if (initialFilter) {
      // Update UI filter states
      if (initialFilter.status) {
        setFilterStatus(initialFilter.status);
      }
      
      if (initialFilter.paymentMethod) {
        setFilterPaymentMethod(initialFilter.paymentMethod === 'cash_on_delivery' ? 'cash' : initialFilter.paymentMethod);
      }
      
      if (initialFilter.dateRange) {
        setFilterDateRange(initialFilter.dateRange);
      }
      
      if (initialFilter.productId) {
        setFilterProductId(initialFilter.productId);
        loadOrdersWithProductId(initialFilter.productId);
      }
    }
  }, [initialFilter]);

  const { totalAmount, totalCash, totalOnline } = useMemo(() => {
    let totalAmount = 0;
    let totalCash = 0;
    let totalOnline = 0;

    filteredOrders.forEach(order => {
      const amount = order.total_amount || 0;
      totalAmount += amount;
      
      if (order.payment_method === 'cash' || order.payment_method === 'cash_on_delivery') {
        totalCash += amount;
      } else {
        totalOnline += amount;
      }
    });

    return { totalAmount, totalCash, totalOnline };
  }, [filteredOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    if (isAdmin || ownerShopIds.length > 0 || (!isAdmin && !ownerId)) {
      fetchOrders();
    }
  }, [isAdmin, ownerShopIds]);

  const handleOrderSelect = (order: Order) => {
    loadOrderDetails(order.id);
  };

  const handleClose = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Order Management</CardTitle>
          <CardDescription>
            {isAdmin 
              ? "View and manage all customer orders" 
              : "View and manage orders containing your shop's products"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Select value={filterStatus} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPaymentMethod} onValueChange={(value) => handleFilterChange("paymentMethod", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash on Delivery</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
              </SelectContent>
            </Select>

            <div className="col-span-1 lg:col-span-2">
              <DatePickerWithSingleDefault
                date={filterDateRange}
                setDate={setFilterDateRange}
              />
            </div>

            <div className="lg:col-span-1">
              <Button onClick={clearFilters} className="w-full">Clear Filters</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              placeholder="Filter by customer name"
              value={filterName}
              onChange={(e) => handleFilterChange("name", e.target.value)}
            />

            <Input
              placeholder="Filter by phone number"
              value={filterPhone}
              onChange={(e) => handleFilterChange("phone", e.target.value)}
            />

            <Input
              placeholder="Filter by order ID"
              value={filterOrderId}
              onChange={(e) => handleFilterChange("orderId", e.target.value)}
            />
          </div>

          <OrdersList 
            orders={filteredOrders}
            onOrderSelect={handleOrderSelect} 
            selectedOrderId={selectedOrder?.id} 
            loading={loading}
          />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md shadow-sm">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-green-50 dark:bg-green-900/10">
              <div className="text-sm text-muted-foreground">Cash Payments</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalCash)}</div>
            </div>
            <div className="p-4 border rounded-md shadow-sm bg-blue-50 dark:bg-blue-900/10">
              <div className="text-sm text-muted-foreground">Online Payments</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalOnline)}</div>
            </div>
          </div>

          {selectedOrder && (
            <div className="mt-6 animate-fade-in">
              <OrderDetails 
                order={selectedOrder} 
                onClose={handleClose}
                onStatusUpdate={updateOrderStatus}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
