
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

interface CouponInputProps {
  onApply: (discountData: { percentage?: number, amount?: number }) => void;
}

interface CouponResponse {
  valid: boolean;
  discount_percentage?: number;
  discount_amount?: number;
  message: string;
}

export const CouponInput = ({ onApply }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const { t } = useLanguage();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t('enterCouponCode'));
      return;
    }

    setIsApplying(true);
    try {
      const { data, error } = await supabase.rpc('apply_coupon', {
        coupon_code: couponCode,
        order_id: null // Will be set when order is created
      });

      if (error) throw error;

      // Safely parse the response data
      const response = data as unknown;
      // Validate that response has the expected structure
      if (
        typeof response === 'object' && 
        response !== null && 
        'valid' in response && 
        'message' in response
      ) {
        const couponResponse = response as CouponResponse;
        
        if (couponResponse.valid) {
          // Pass either percentage or amount discount to parent component
          onApply({
            percentage: couponResponse.discount_percentage,
            amount: couponResponse.discount_amount
          });
          toast.success(couponResponse.message);
        } else {
          toast.error(couponResponse.message);
        }
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error(t('errorApplyingCoupon'));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder={t('enterCouponCode')}
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
        className="flex-1"
      />
      <Button
        onClick={handleApplyCoupon}
        disabled={isApplying}
        variant="outline"
      >
        {isApplying ? t('applying') : t('apply')}
      </Button>
    </div>
  );
};
