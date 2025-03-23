
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch the user's orders
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

      // Get the order items for each order
      try {
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

              // Ensure status is of the correct type
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
      } catch (batchErr) {
        console.error('Error processing orders batch:', batchErr);
        // If batch processing fails, still show orders without items
        setOrders(ordersData.map(order => ({
          ...order,
          status: order.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
          items: []
        })));
        toast.error('Some order details could not be loaded. Please refresh the page.');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load your orders. Please try again later.');
      toast.error('Failed to load your orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setOrders([]);
      setLoading(false);
    }
  }, [fetchOrders, user]);

  return { orders, loading, error, refetch: fetchOrders };
};
