import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { v4 as uuidv4 } from 'uuid';
import { Address } from '../types';

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
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
}

export const useOrders = () => {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        setError('Failed to load your orders. Please try again later.');
        setLoading(false);
        toast.error('Failed to load your orders. Please try again later.');
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          try {
            const { data: itemsData, error: itemsError } = await supabase
              .from('order_items')
              .select('*')
              .eq('order_id', order.id);

            if (itemsError) {
              console.error('Error fetching order items:', itemsError);
              return {
                ...order,
                status: order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
                items: [],
              };
            }

            const typedStatus = order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

            return {
              ...order,
              status: typedStatus,
              items: itemsData || [],
            };
          } catch (itemErr) {
            console.error('Unexpected error fetching order items:', itemErr);
            return {
              ...order,
              status: order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
              items: [],
            };
          }
        })
      );

      setOrders(ordersWithItems as Order[]);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
      toast.error('Failed to load your orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const placeOrder = async (
    address: Address,
    paymentMethod: string,
    shippingCost: number,
    couponData: any = {}
  ) => {
    if (!user) {
      toast.error(t('loginToOrder'));
      navigate('/login');
      return null;
    }

    if (items.length === 0) {
      toast.error(t('cartEmpty'));
      return null;
    }

    if (!address) {
      toast.error(t('selectAddress'));
      return null;
    }

    if (!paymentMethod) {
      toast.error(t('selectPaymentMethod'));
      return null;
    }

    setIsSubmitting(true);
    
    try {
      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      let discount = 0;
      
      if (couponData.percentage) {
        discount = subtotal * (couponData.percentage / 100);
      } else if (couponData.amount) {
        discount = couponData.amount;
      } else {
        discount = 0;
      }
      
      const total = subtotal + shippingCost - discount;
      
      const orderId = uuidv4();
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user.id,
          status: 'pending',
          payment_method: paymentMethod,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          discount_amount: discount,
          total_amount: total,
          coupon_id: couponData.couponId || null,
          coupon_code: couponData.code || null,
          first_name: address.recipient_name.split(' ')[0] || '',
          last_name: address.recipient_name.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: address.phone || '',
          address: `${address.building} ${address.street}, ${address.apartment || ''}`,
          city: address.city,
          postal_code: address.postal_code || ''
        })
        .select('id')
        .single();
      
      if (orderError) {
        console.error('Order creation error:', orderError);
        throw new Error(t('orderCreationFailed'));
      }
      
      const orderItems = items.map(item => ({
        order_id: orderId,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw new Error(t('orderItemsCreationFailed'));
      }
      
      for (const item of items) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.product.stock - item.quantity })
          .eq('id', item.product.id)
          .gt('stock', 0);
        
        if (stockError) {
          console.error('Stock update error:', stockError);
        }
      }
      
      if (couponData.couponId) {
        const { data: coupon, error: couponError } = await supabase
          .from('coupons')
          .select('times_used')
          .eq('id', couponData.couponId)
          .single();
          
        if (!couponError && coupon) {
          await supabase
            .from('coupons')
            .update({ times_used: coupon.times_used + 1 })
            .eq('id', couponData.couponId);
            
          if (couponData.ownerId && couponData.ownerBenefitValue > 0) {
            await supabase.rpc('increment_balance', {
              row_id: couponData.ownerId,
              amount: couponData.ownerBenefitValue
            });
          }
        }
      }
      
      clearCart();
      
      toast.success(t('orderPlaced'));
      navigate(`/orders/${orderId}`);
      
      return orderId;
      
    } catch (error: any) {
      console.error('Order placement error:', error);
      toast.error(error.message || t('orderFailed'));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [fetchOrders, user]);

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    placeOrder,
    isSubmitting
  };
};
