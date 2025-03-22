import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "../orders/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calculator, CreditCard, ShoppingBag, TrendingUp, Users, Store, Package, DollarSign, ArrowUpRight, ArrowDownRight, Calendar, Banknote } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartDataPayload, FilterParams, OrderStatus, PaymentMethod } from "../orders/types";

type AnalyticsItem = {
  title: string;
  value: number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
};

interface DashboardOverviewProps {
  analytics: {
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
  };
  onFilterChange: (params: FilterParams) => void;
}

const DashboardOverview = ({ analytics, onFilterChange }: DashboardOverviewProps) => {
  // Main analytics cards data
  const items: AnalyticsItem[] = [
    {
      title: "Total Users",
      value: analytics.userCount,
      change: "+5% from last month",
      changeType: "positive",
      icon: <Users className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Active Shops",
      value: analytics.shopCount,
      change: "+12% from last month",
      changeType: "positive",
      icon: <Store className="h-5 w-5 text-indigo-500" />,
    },
    {
      title: "Products",
      value: analytics.productCount,
      change: "+18% from last month",
      changeType: "positive",
      icon: <Package className="h-5 w-5 text-purple-500" />,
    },
    {
      title: "Revenue",
      value: analytics.revenue,
      change: "-2% from last month",
      changeType: "negative",
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
    },
  ];

  // Additional order-specific analytics
  if (analytics.orderCount) {
    items.push({
      title: "Total Orders",
      value: analytics.orderCount,
      change: "+8% from last month",
      changeType: "positive",
      icon: <ShoppingBag className="h-5 w-5 text-orange-500" />,
    });
  }

  // Default data for charts if not provided
  const defaultSalesData: ChartDataPayload[] = [
    { name: 'Mon', value: 1200, date: new Date() },
    { name: 'Tue', value: 1900, date: new Date() },
    { name: 'Wed', value: 2100, date: new Date() },
    { name: 'Thu', value: 1500, date: new Date() },
    { name: 'Fri', value: 2300, date: new Date() },
    { name: 'Sat', value: 2900, date: new Date() },
    { name: 'Sun', value: 1800, date: new Date() },
  ];

  const defaultProductData: ChartDataPayload[] = [
    { name: 'Air Filter', value: 35, product_id: '1' },
    { name: 'Oil Filter', value: 28, product_id: '2' },
    { name: 'Brake Pads', value: 24, product_id: '3' },
    { name: 'Spark Plugs', value: 18, product_id: '4' },
    { name: 'Wiper Blades', value: 15, product_id: '5' },
  ];

  const defaultPaymentData: ChartDataPayload[] = [
    { name: 'Credit Card', value: 65, method: 'credit_card' as PaymentMethod },
    { name: 'Cash', value: 35, method: 'cash' as PaymentMethod },
  ];

  // Use provided data or fallback to defaults
  const salesData = analytics.salesByDay || defaultSalesData;
  const topProducts = analytics.topSellingProducts || defaultProductData;
  const paymentMethods = analytics.paymentMethodsData || defaultPaymentData;

  // Colors for pie charts
  const PAYMENT_COLORS = ['#3b82f6', '#22c55e'];
  const PRODUCT_COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

  // Order status stats with defaults
  const pendingOrders = analytics.pendingOrdersCount || 12;
  const shippedOrders = analytics.shippedOrdersCount || 24;
  const deliveredOrders = analytics.deliveredOrdersCount || 96;
  const totalOrders = pendingOrders + shippedOrders + deliveredOrders;

  // Revenue by payment method
  const cashRevenue = analytics.cashRevenue || 0;
  const cardRevenue = analytics.cardRevenue || 0;
  const averageOrderValue = analytics.averageOrderValue || 0;

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-amber-50 text-amber-500 dark:bg-amber-900/20';
      case 'processing': return 'bg-blue-50 text-blue-500 dark:bg-blue-900/20';
      case 'shipped': return 'bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20';
      case 'delivered': return 'bg-green-50 text-green-500 dark:bg-green-900/20';
      case 'cancelled': return 'bg-red-50 text-red-500 dark:bg-red-900/20';
      default: return 'bg-gray-50 text-gray-500 dark:bg-gray-900/20';
    }
  };

  // Badge variant for status
  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'pending': return 'secondary';
      case 'shipped': return 'default';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  // Handle order status filter
  const handleOrderStatusClick = (status: OrderStatus) => {
    onFilterChange({ status });
  };

  // Handle sales day filter
  const handleSalesDayClick = (day: ChartDataPayload) => {
    if (day.date) {
      onFilterChange({
        dateRange: {
          from: day.date,
          to: day.date
        }
      });
    }
  };

  // Handle product filter
  const handleProductClick = (product: ChartDataPayload) => {
    if (product.product_id) {
      onFilterChange({
        productId: product.product_id,
        productName: product.name
      });
    }
  };

  // Handle payment method filter
  const handlePaymentMethodClick = (data: ChartDataPayload) => {
    if (data.method) {
      onFilterChange({
        paymentMethod: data.method
      });
    }
  };

  // Handle revenue type click
  const handleRevenueTypeClick = (type: 'cash' | 'card') => {
    onFilterChange({
      paymentMethod: type === 'cash' ? 'cash' : 'credit_card'
    });
  };

  return (
    <div className="space-y-8">
      {/* Main analytics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-gray-500">{item.title}</CardTitle>
              <div className="bg-muted/50 p-2 rounded-full">{item.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.title === "Revenue" ? formatCurrency(item.value) : item.value}
              </div>
              <p className={`text-xs flex items-center mt-1 ${
                item.changeType === 'positive' ? 'text-green-500' : 
                item.changeType === 'negative' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {item.changeType === 'positive' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                 item.changeType === 'negative' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                {item.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue by payment method and average order */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleRevenueTypeClick('cash')}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Banknote className="h-5 w-5 mr-2 text-green-500" />
              Cash Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{formatCurrency(cashRevenue)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Cash and cash on delivery payments
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleRevenueTypeClick('card')}
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
              Card Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{formatCurrency(cardRevenue)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Credit card and other electronic payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-indigo-500" />
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-500">{formatCurrency(averageOrderValue)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Average amount per order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Weekly Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6" 
                  cursor="pointer"
                  onClick={(data) => handleSalesDayClick(data as ChartDataPayload)}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-purple-500" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  onClick={(data) => handleProductClick(data as ChartDataPayload)}
                  cursor="pointer"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} units`, 'Sales']} />
                <Legend 
                  onClick={(data) => handleProductClick(data as ChartDataPayload)}
                  cursor="pointer"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment methods and order stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-500" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  onClick={(data) => handlePaymentMethodClick(data as ChartDataPayload)}
                  cursor="pointer"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend 
                  onClick={(data) => handlePaymentMethodClick(data as ChartDataPayload)}
                  cursor="pointer"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-orange-500" />
              Order Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="ghost" 
                className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-center h-auto block"
                onClick={() => handleOrderStatusClick('pending')}
              >
                <div className="text-amber-500 font-bold text-xl">{pendingOrders}</div>
                <div className="text-sm mt-1">Pending</div>
                <div className="text-xs text-muted-foreground mt-1">{Math.round((pendingOrders / totalOrders) * 100)}%</div>
              </Button>
              <Button 
                variant="ghost" 
                className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center h-auto block"
                onClick={() => handleOrderStatusClick('shipped')}
              >
                <div className="text-blue-500 font-bold text-xl">{shippedOrders}</div>
                <div className="text-sm mt-1">Shipped</div>
                <div className="text-xs text-muted-foreground mt-1">{Math.round((shippedOrders / totalOrders) * 100)}%</div>
              </Button>
              <Button 
                variant="ghost" 
                className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center h-auto block"
                onClick={() => handleOrderStatusClick('delivered')}
              >
                <div className="text-green-500 font-bold text-xl">{deliveredOrders}</div>
                <div className="text-sm mt-1">Delivered</div>
                <div className="text-xs text-muted-foreground mt-1">{Math.round((deliveredOrders / totalOrders) * 100)}%</div>
              </Button>
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Recent Performance</div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Previous: {formatCurrency(18240)}</span>
                <span>Current: {formatCurrency(24300)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      {analytics.recentOrders && analytics.recentOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">ID</th>
                    <th className="text-left py-2 font-medium">Customer</th>
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b hover:bg-muted/30 cursor-pointer"
                      onClick={() => onFilterChange({ status: order.status as OrderStatus })}
                    >
                      <td className="py-3 font-mono text-xs">{order.id.substring(0, 8)}</td>
                      <td className="py-3">{`${order.first_name} ${order.last_name}`}</td>
                      <td className="py-3">{format(new Date(order.created_at), 'MMM d, yyyy')}</td>
                      <td className="py-3">
                        <Badge variant={getStatusBadgeVariant(order.status) as any}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">{formatCurrency(order.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardOverview;
