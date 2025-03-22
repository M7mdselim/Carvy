
import { useMemo } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order } from "./types";
import { format } from "date-fns";
import { formatCurrency } from "./utils";
import { CreditCard, Banknote } from "lucide-react";

interface OrdersListProps {
  orders: Order[];
  selectedOrderId?: string;
  onOrderSelect: (order: Order) => void;
  loading: boolean;
}

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'pending': return 'outline';
      case 'processing': return 'secondary';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  }, [status]);

  return <Badge variant={variant}>{status}</Badge>;
};

const PaymentMethodIndicator = ({ method }: { method: Order['payment_method'] }) => {
  const getPaymentLabel = (method: Order['payment_method']) => {
    // Ensure correct display based on the exact values from the database
    switch (method) {
      case 'cash': return 'Cash';
      case 'cash_on_delivery': return 'Cash';
      case 'credit_card': return 'CC';
      default: return 'CC';
    }
  };

  const getPaymentColor = (method: Order['payment_method']) => {
    return method === 'cash' || method === 'cash_on_delivery' 
      ? 'text-green-500' 
      : 'text-blue-500';
  };

  // Use Banknote icon for cash/cash_on_delivery, CreditCard for everything else
  const PaymentIcon = method === 'cash' || method === 'cash_on_delivery' 
    ? Banknote 
    : CreditCard;

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${getPaymentColor(method)}`}>
      <PaymentIcon className="h-3 w-3" />
      {getPaymentLabel(method)}
    </span>
  );
};

const OrdersList = ({ orders, selectedOrderId, onOrderSelect, loading }: OrdersListProps) => {
  const formatOrderId = (id: string) => {
    return id.substring(0, 4) + '-' + id.substring(4, 8) + '-' + id.substring(8, 12);
  };

  return (
    <div className="border rounded-md">
      <div className="px-4 py-3 border-b bg-muted/20">
        <h3 className="text-sm sm:text-base font-medium">Orders</h3>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No orders found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className={`cursor-pointer hover:bg-muted/50 ${order.id === selectedOrderId ? 'bg-muted/50' : ''}`}
                  onClick={() => onOrderSelect(order)}
                >
                  <TableCell className="font-mono text-xs font-medium">
                    #{formatOrderId(order.id.substring(0, 12))}
                  </TableCell>
                  <TableCell>
                    {order.first_name} {order.last_name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.phone || "—"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <PaymentMethodIndicator method={order.payment_method} />
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(order.total_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
