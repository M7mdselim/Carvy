
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { v4 as uuidv4 } from 'uuid';
import { Address } from '../types';
import { calculateCouponBenefit } from '../lib/utils';

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
    couponData: any = {},
    contactPhone: string = '',
    firstName: string = '',
    lastName: string = ''
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
      // Check that all products are active before placing the order
      const statusCheckPromises = items.map(async (item) => {
        const { data, error } = await supabase
          .from('products')
          .select('status')
          .eq('id', item.product.id)
          .single();
          
        if (error) throw error;
        
        if (!data || data.status !== 'active') {
          throw new Error(`The product "${item.product.name}" is not available for purchase.`);
        }
        
        return true;
      });
      
      await Promise.all(statusCheckPromises);
      
      const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      let discount = 0;
      
      if (couponData.percentage) {
        // Calculate percentage discount based on subtotal (excluding shipping)
        discount = calculateCouponBenefit(
          couponData.percentage, 
          'percentage', 
          subtotal, 
          0 // No shipping cost to exclude from subtotal calculation
        );
      } else if (couponData.amount) {
        discount = couponData.amount;
      } else {
        discount = 0;
      }
      
      const total = subtotal + shippingCost - discount;
      
      const orderId = uuidv4();
      
      // Ensure we have proper contact information
      const phoneNumber = contactPhone && contactPhone.trim() !== '' 
        ? contactPhone 
        : (address.phone || '');
        
      // Use provided first name or extract from address recipient name
      const firstNameToUse = firstName && firstName.trim() !== ''
        ? firstName
        : address.recipient_name.split(' ')[0] || '';
        
      // Use provided last name or extract from address recipient name  
      const lastNameToUse = lastName && lastName.trim() !== ''
        ? lastName
        : address.recipient_name.split(' ').slice(1).join(' ') || '';
      
      // Construct a detailed address string with all non-null components
      const addressParts = [];
      if (address.building) addressParts.push(address.building);
      if (address.street) addressParts.push(address.street);
      if (address.apartment) addressParts.push(`Apt: ${address.apartment}`);
      if (address.floor) addressParts.push(`Floor: ${address.floor}`);
      if (address.district) addressParts.push(address.district);
      
      const fullAddressString = addressParts.join(', ');

      // Get city and area information for the order
      let cityName = address.city;
      let areaName = address.area || '';

      // Prepare combined city/area string for the city field
      const cityAreaString = areaName ? `${cityName} - ${areaName}` : cityName;
      
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
          coupon_code: couponData.couponCode || null,
          first_name: firstNameToUse,
          last_name: lastNameToUse,
          email: user.email || '',
          phone: phoneNumber,
          address: fullAddressString,
          city: cityAreaString,
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
      
      // Remove stock update logic since we're no longer tracking stock for checkout
      
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
            // Calculate the actual benefit value based on the benefit type
            let benefitAmount = couponData.ownerBenefitValue;
            
            // If it's a percentage type, calculate based on the order subtotal
            if (couponData.ownerBenefitType === 'percentage') {
              benefitAmount = calculateCouponBenefit(
                couponData.ownerBenefitValue, 
                couponData.ownerBenefitType, 
                subtotal, 
                0 // No shipping cost to exclude from owner benefit calculation
              );
            }
            
            await supabase.rpc('increment_balance', {
              row_id: couponData.ownerId,
              amount: benefitAmount
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
