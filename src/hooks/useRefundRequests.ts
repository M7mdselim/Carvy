
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface RefundRequest {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const useRefundRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);

  const fetchRefundRequests = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('refund_requests')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Cast the data to ensure it matches the RefundRequest type
      setRefundRequests((data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'approved' | 'rejected'
      })));
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createRefundRequest = useCallback(async (orderId: string, reason: string) => {
    if (!user) {
      toast.error('You must be logged in to request a refund');
      return null;
    }

    try {
      setLoading(true);
      
      // Check if request already exists
      const { data: existingRequests, error: checkError } = await supabase
        .from('refund_requests')
        .select('id')
        .eq('order_id', orderId)
        .eq('user_id', user.id);
        
      if (checkError) throw checkError;
      
      if (existingRequests && existingRequests.length > 0) {
        toast.error('You have already submitted a refund request for this order');
        return null;
      }

      const { data, error } = await supabase
        .from('refund_requests')
        .insert({
          order_id: orderId,
          user_id: user.id,
          reason
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Refund request submitted successfully');
      return data;
    } catch (error) {
      console.error('Error creating refund request:', error);
      toast.error('Failed to submit refund request');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    refundRequests,
    loading,
    fetchRefundRequests,
    createRefundRequest
  };
};
