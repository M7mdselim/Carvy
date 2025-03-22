
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Clipboard, 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Package,
  CreditCard,
  Banknote,
  Tag
} from "lucide-react";
import { Order, OrderStatus, PaymentMethod } from "./types";
import { format } from "date-fns";
import { formatCurrency } from "./utils";
import { useAuth } from "@/contexts/AuthContext";

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: string) => void;
}

const OrderDetails = ({ order, onClose, onStatusUpdate }: OrderDetailsProps) => {
  const { isAdmin, isOwner } = useAuth();
  const canEdit = isAdmin;
  
  const handleStatusChange = (status: string) => {
    onStatusUpdate(order.id, status);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return 'Cash on Delivery';
      case 'cash_on_delivery': return 'Cash on Delivery';
      case 'credit_card': return 'Credit Card';
      default: return 'Credit Card';
    }
  };

  const getPaymentMethodColor = (method: PaymentMethod) => {
    return method === 'cash' || method === 'cash_on_delivery' ? 'text-green-500' : 'text-blue-500';
  };

  const PaymentIcon = order.payment_method === 'cash' || order.payment_method === 'cash_on_delivery' ? Banknote : CreditCard;

  // Calculate total before discount
  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const hasDiscount = order.promo_code || (subtotal > order.total_amount);
  const discountAmount = subtotal - (order.total_amount || 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col space-y-1.5">
          <CardTitle className="text-lg flex items-center gap-2">
            Order #{order.id.substring(0, 8)}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => copyToClipboard(order.id)}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), 'MMMM d, yyyy h:mm a')}
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit ? (
            <Select defaultValue={order.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={
              order.status === 'cancelled' ? 'destructive' : 
              order.status === 'delivered' ? 'default' : 
              'outline'
            }>
              {order.status.toUpperCase()}
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-none tracking-tight">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{order.first_name} {order.last_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{order.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <PaymentIcon className={`h-4 w-4 ${getPaymentMethodColor(order.payment_method)}`} />
                <span className={`${getPaymentMethodColor(order.payment_method)}`}>
                  {getPaymentMethodLabel(order.payment_method)}
                </span>
              </div>
              {order.promo_code && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-500" />
                  <span className="text-purple-500">
                    Promocode: <span className="font-medium">{order.promo_code}</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold leading-none tracking-tight">
              Shipping Information
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{order.address || order.shipping_address || "—"}</span>
              </div>
              <div className="ml-6">
                {(order.city || order.shipping_city) && (order.postal_code || order.shipping_postal) ? 
                  `${order.city || order.shipping_city}, ${order.postal_code || order.shipping_postal}` : 
                  "—"}
              </div>
              {order.shipping_country && (
                <div className="ml-6">
                  {order.shipping_country}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-semibold leading-none tracking-tight flex items-center gap-2">
            <Package className="h-4 w-4" />
            Order Items
          </h3>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.product_id.substring(0, 8)}
                  </TableCell>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <div className="flex flex-col gap-2">
          <Badge 
            variant={
              order.status === 'cancelled' ? 'destructive' : 
              order.status === 'delivered' ? 'default' : 
              'outline'
            }
          >
            {order.status.toUpperCase()}
          </Badge>
          <span className={`text-xs ${getPaymentMethodColor(order.payment_method)}`}>
            {getPaymentMethodLabel(order.payment_method)}
          </span>
          {order.promo_code && (
            <span className="text-xs text-purple-500">
              Promocode: {order.promo_code}
            </span>
          )}
        </div>
        <div className="text-right">
          {hasDiscount && (
            <>
              <div className="text-sm text-muted-foreground">Subtotal</div>
              <div className="text-lg line-through text-muted-foreground mb-1">{formatCurrency(subtotal)}</div>
              <div className="text-sm text-purple-500">
                Discount: -{formatCurrency(discountAmount)}
              </div>
            </>
          )}
          <div className="text-sm text-muted-foreground mt-1">Total Amount</div>
          <div className="text-2xl font-bold">{formatCurrency(order.total_amount)}</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderDetails;
