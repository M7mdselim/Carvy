import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, filterOrdersByDate, getStatusBadgeVariant } from "../orders/utils";
import { Loader2, CalendarIcon, Download, Filter, RefreshCw, CreditCard, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { DatePickerWithSingleDefault } from "@/components/ui/date-picker-with-single-default";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PaymentMethod } from "../orders/types";

type Transaction = {
  id: string;
  user: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shop_id?: string;
  payment_method?: PaymentMethod;
};

interface TransactionsTableProps {
  initialFilter?: string;
  initialDateRange?: {
    from: Date;
    to: Date;
  };
}

const TransactionsTable = ({ initialFilter, initialDateRange }: TransactionsTableProps) => {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialDateRange || {
      from: today,
      to: today,
    }
  );
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>(initialFilter || "all");
  const { toast } = useToast();
  const { isAdmin, ownerId } = useAuth();
  const [ownerShopIds, setOwnerShopIds] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalCash, setTotalCash] = useState<number>(0);
  const [totalOnline, setTotalOnline] = useState<number>(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchOwnerShops = async () => {
      if (!isAdmin && ownerId) {
        try {
          const { data, error } = await supabase
            .from("shops")
            .select("id")
            .eq("owner_id", ownerId);

          if (error) throw error;
          setOwnerShopIds(data.map(shop => shop.id));
        } catch (error: any) {
          console.error("Error fetching owner shops:", error);
          toast({
            title: "Error fetching shops",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    };

    fetchOwnerShops();
  }, [isAdmin, ownerId, toast]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("orders")
          .select(`
            id, 
            email, 
            total_amount, 
            status, 
            created_at,
            payment_method,
            order_items!inner (
              product_id,
              products!inner (
                shop_id
              )
            )
          `);
        
        if (!isAdmin && ownerShopIds.length > 0) {
          const { data: ownerOrders, error: ownerOrdersError } = await supabase
            .from("order_items")
            .select(`
              order_id,
              products!inner (shop_id)
            `)
            .in("products.shop_id", ownerShopIds);

          if (ownerOrdersError) throw ownerOrdersError;
          
          const ownerOrderIds = [...new Set(ownerOrders?.map(item => item.order_id))];
          
          if (ownerOrderIds.length > 0) {
            query = query.in("id", ownerOrderIds);
          } else {
            setTransactions([]);
            setTotalAmount(0);
            setTotalCash(0);
            setTotalOnline(0);
            setLoading(false);
            setRefreshing(false);
            return;
          }
        }
        
        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;

        const processedTransactions: Transaction[] = [];
        const processedOrderIds = new Set<string>();

        data?.forEach(order => {
          if (!processedOrderIds.has(order.id)) {
            processedOrderIds.add(order.id);
            
            const validStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order.status) 
              ? order.status as Transaction['status'] 
              : 'pending' as Transaction['status'];
            
            processedTransactions.push({
              id: `TX-${order.id.substring(0, 6)}`,
              user: order.email,
              amount: order.total_amount,
              status: validStatus,
              date: new Date(order.created_at).toISOString().split('T')[0],
              shop_id: order.order_items[0]?.products?.shop_id,
              payment_method: order.payment_method as PaymentMethod || 'credit_card'
            });
          }
        });

        let filteredTransactions = processedTransactions.filter(tx => {
          if (!dateRange?.from) return true;
          
          const txDate = new Date(tx.date);
          
          if (!dateRange.to || 
              (dateRange.from.getDate() === dateRange.to.getDate() &&
               dateRange.from.getMonth() === dateRange.to.getMonth() &&
               dateRange.from.getFullYear() === dateRange.to.getFullYear())) {
            return (
              txDate.getFullYear() === dateRange.from.getFullYear() &&
              txDate.getMonth() === dateRange.from.getMonth() &&
              txDate.getDate() === dateRange.from.getDate()
            );
          }
          
          return txDate >= dateRange.from && txDate <= dateRange.to;
        });
        
        if (filterPaymentMethod !== 'all') {
          filteredTransactions = filteredTransactions.filter(tx => 
            tx.payment_method === filterPaymentMethod || 
            (filterPaymentMethod === 'cash' && tx.payment_method === 'cash_on_delivery')
          );
        }

        setTransactions(filteredTransactions);
        
        const totalAll = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalCashAmount = filteredTransactions
          .filter(tx => tx.payment_method === 'cash' || tx.payment_method === 'cash_on_delivery')
          .reduce((sum, tx) => sum + tx.amount, 0);
        const totalOnlineAmount = filteredTransactions
          .filter(tx => tx.payment_method !== 'cash' && tx.payment_method !== 'cash_on_delivery')
          .reduce((sum, tx) => sum + tx.amount, 0);
        
        setTotalAmount(totalAll);
        setTotalCash(totalCashAmount);
        setTotalOnline(totalOnlineAmount);
      } catch (error: any) {
        console.error("Error fetching transactions:", error);
        toast({
          title: "Error fetching transactions",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    if (isAdmin || ownerShopIds.length > 0 || (!isAdmin && !ownerId)) {
      fetchTransactions();
    }
  }, [isAdmin, ownerShopIds, toast, ownerId, dateRange, filterPaymentMethod]);

  useEffect(() => {
    if (initialFilter && initialFilter !== filterPaymentMethod) {
      setFilterPaymentMethod(initialFilter);
    }
    
    if (initialDateRange && initialDateRange !== dateRange) {
      setDateRange(initialDateRange);
    }
  }, [initialFilter, initialDateRange]);

  const handleClearFilters = () => {
    setDateRange({
      from: today,
      to: today,
    });
    setFilterPaymentMethod("all");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const tempDateRange = dateRange;
    setDateRange(undefined);
    setTimeout(() => setDateRange(tempDateRange), 100);
  };

  const formatTransactionId = (id: string) => {
    if (id.startsWith('TX-')) {
      const idPart = id.substring(3);
      return `TX-${idPart.substring(0, 3)}-${idPart.substring(3)}`;
    }
    return id;
  };

  const getPaymentMethodLabel = (method: PaymentMethod | undefined) => {
    switch(method) {
      case 'cash': return 'Cash';
      case 'cash_on_delivery': return 'Cash on Delivery';
      case 'credit_card': return 'Credit Card';
      case 'debit_card': return 'Debit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'other': return 'Other';
      default: return 'Credit Card';
    }
  };

  const getPaymentMethodColor = (method: PaymentMethod | undefined) => {
    return method === 'cash' || method === 'cash_on_delivery' ? 'text-green-500' : 'text-blue-500';
  };

  const getPaymentIcon = (method: PaymentMethod | undefined) => {
    return method === 'cash' || method === 'cash_on_delivery' ? 
      <Banknote className="h-3 w-3" /> : 
      <CreditCard className="h-3 w-3" />;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>
                {isAdmin 
                  ? "Overview of all transactions across the platform" 
                  : "Transactions from your shop's orders"}
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRefresh}
              disabled={refreshing}
              className="self-end sm:self-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center flex-wrap">
            <div className="w-full sm:w-auto">
              <DatePickerWithSingleDefault
                date={dateRange}
                setDate={setDateRange}
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="h-10"
                size={isMobile ? "sm" : "default"}
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-md">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-xl font-bold">{formatCurrency(totalAmount)}</div>
            </div>
            
            <div className="p-4 border rounded-md bg-green-50 dark:bg-green-900/10">
              <div className="text-sm text-muted-foreground">Cash Payments</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalCash)}
              </div>
            </div>
            
            <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-900/10">
              <div className="text-sm text-muted-foreground">Online Payments</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totalOnline)}
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-full h-12" />
              ))}
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    {!isMobile && <TableHead>User</TableHead>}
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    {!isMobile && <TableHead>Payment</TableHead>}
                    {!isMobile && <TableHead>Date</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isMobile ? 3 : 6} className="text-center text-muted-foreground py-8">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction, i) => (
                      <TableRow key={i} className="group hover:bg-muted/50 transition-colors">
                        <TableCell className="font-mono text-xs">
                          {formatTransactionId(transaction.id)}
                        </TableCell>
                        {!isMobile && (
                          <TableCell className="max-w-[200px] truncate" title={transaction.user}>
                            {transaction.user}
                          </TableCell>
                        )}
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transaction.status) as any}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </TableCell>
                        {!isMobile && (
                          <TableCell className={getPaymentMethodColor(transaction.payment_method)}>
                            <div className="flex items-center gap-1">
                              {getPaymentIcon(transaction.payment_method)}
                              <span className="text-xs">
                                {getPaymentMethodLabel(transaction.payment_method)}
                              </span>
                            </div>
                          </TableCell>
                        )}
                        {!isMobile && <TableCell>{transaction.date}</TableCell>}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {transactions.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => {
                  toast({
                    title: "Export feature",
                    description: "Export functionality coming soon",
                  });
                }}
              >
                <Download className="h-4 w-4" />
                <span className={isMobile ? "sr-only" : ""}>Export</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsTable;
