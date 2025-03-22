
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash' | 'cash_on_delivery' | 'credit_card' | 'debit_card';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_postal?: string;
  shipping_country?: string;
  total_amount: number;
  items?: OrderItem[];
  promo_code?: string;
  discount_amount?: number;
}

export interface FilterParams {
  status?: OrderStatus;
  paymentMethod?: PaymentMethod;
  dateRange?: {
    from: Date;
    to?: Date;
  };
  productId?: string;
  productName?: string;
}

export interface ChartDataPayload {
  name: string;
  value: number;
  date?: Date;
  product_id?: string;
  method?: PaymentMethod;
}
