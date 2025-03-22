
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, subDays } from "date-fns";
import { PaymentMethod, OrderStatus, ChartDataPayload } from "@/components/admin/orders/types";

export interface AdminAnalytics {
  userCount: number;
  shopCount: number;
  productCount: number;
  revenue: number;
  orderCount?: number;
  salesByDay?: ChartDataPayload[];
  topSellingProducts?: ChartDataPayload[];
  paymentMethodsData?: ChartDataPayload[];
  pendingOrdersCount?: number;
  shippedOrdersCount?: number;
  deliveredOrdersCount?: number;
  cashRevenue?: number;
  cardRevenue?: number;
  averageOrderValue?: number;
  recentOrders?: any[];
}

export const useAdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    userCount: 0,
    shopCount: 0,
    productCount: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Get user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Get shop count
        const { count: shopCount, error: shopError } = await supabase
          .from('shops')
          .select('*', { count: 'exact', head: true });
        
        // Get product count
        const { count: productCount, error: productError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        // Get order count and revenue
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*');
        
        if (userError || shopError || productError || ordersError) throw new Error("Error fetching analytics data");
        
        // Total orders
        const orderCount = orders?.length || 0;
        
        // Total revenue
        const revenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 24300;
        
        // Calculate average order value
        const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;
        
        // Get orders by status
        const pendingOrdersCount = orders?.filter(o => o.status === 'pending').length || 0;
        const shippedOrdersCount = orders?.filter(o => o.status === 'shipped').length || 0;
        const deliveredOrdersCount = orders?.filter(o => o.status === 'delivered').length || 0;
        
        // Payment methods data and revenue by payment type
        let cashOrdersCount = 0;
        let cardOrdersCount = 0;
        let cashRevenue = 0;
        let cardRevenue = 0;
        
        orders?.forEach(order => {
          const method = order.payment_method as PaymentMethod;
          if (method === 'cash' || method === 'cash_on_delivery') {
            cashOrdersCount++;
            cashRevenue += (order.total_amount || 0);
          } else {
            cardOrdersCount++;
            cardRevenue += (order.total_amount || 0);
          }
        });
        
        const totalPaymentOrders = cashOrdersCount + cardOrdersCount;
        const paymentMethodsData: ChartDataPayload[] = [
          { 
            name: 'Credit Card', 
            value: totalPaymentOrders ? Math.round((cardOrdersCount / totalPaymentOrders) * 100) : 65,
            method: 'credit_card' as PaymentMethod 
          },
          { 
            name: 'Cash', 
            value: totalPaymentOrders ? Math.round((cashOrdersCount / totalPaymentOrders) * 100) : 35,
            method: 'cash' as PaymentMethod 
          }
        ];
        
        // Get sales by day for the past 7 days
        const today = new Date();
        const salesByDay: ChartDataPayload[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = subDays(today, i);
          const dateStr = format(date, 'yyyy-MM-dd');
          const dayName = format(date, 'EEE');
          
          const dayOrders = orders?.filter(order => 
            order.created_at.startsWith(dateStr)
          );
          
          const daySales = dayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
          
          salesByDay.push({
            name: dayName,
            value: daySales,
            date: new Date(date)
          });
        }
        
        // Get top selling products
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('order_items')
          .select('product_id, product_name, quantity');
        
        if (orderItemsError) throw orderItemsError;
        
        // Count quantities by product
        const productSales = new Map();
        const productIds = new Map();
        
        orderItems?.forEach(item => {
          const currentCount = productSales.get(item.product_name) || 0;
          productSales.set(item.product_name, currentCount + item.quantity);
          productIds.set(item.product_name, item.product_id);
        });
        
        // Convert to array and sort
        const productSalesArray: ChartDataPayload[] = Array.from(productSales.entries())
          .map(([name, value]) => ({ 
            name, 
            value: value as number,
            product_id: productIds.get(name) || ''
          }))
          .sort((a, b) => (b.value as number) - (a.value as number))
          .slice(0, 5);
        
        // If no order items, use dummy data
        const topSellingProducts: ChartDataPayload[] = productSalesArray.length ? productSalesArray : [
          { name: 'Air Filter', value: 35, product_id: '1' },
          { name: 'Oil Filter', value: 28, product_id: '2' },
          { name: 'Brake Pads', value: 24, product_id: '3' },
          { name: 'Spark Plugs', value: 18, product_id: '4' },
          { name: 'Wiper Blades', value: 15, product_id: '5' },
        ];
        
        // Get recent orders (5 most recent)
        const recentOrders = orders?.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5) || [];
        
        setAnalytics({
          userCount: userCount || 0,
          shopCount: shopCount || 0,
          productCount: productCount || 0,
          revenue,
          orderCount,
          salesByDay,
          topSellingProducts,
          paymentMethodsData,
          pendingOrdersCount,
          shippedOrdersCount,
          deliveredOrdersCount,
          cashRevenue,
          cardRevenue,
          averageOrderValue,
          recentOrders
        });
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast({
          title: "Error fetching analytics",
          description: "There was a problem retrieving analytics data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [toast]);

  return { analytics, loading };
};
