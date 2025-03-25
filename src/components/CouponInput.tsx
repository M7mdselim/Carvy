
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CouponInputProps {
  onApply: (discountData: {
    percentage?: number;
    amount?: number;
    couponId?: string;
    couponCode?: string;
    ownerId?: string;
    ownerBenefitValue?: number;
    ownerBenefitType?: string;
  }) => void;
}

export function CouponInput({ onApply }: CouponInputProps) {
  const { t } = useLanguage();
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t('enterCouponCode'));
      return;
    }

    setIsValidating(true);
    try {
      // Check if coupon exists and is valid
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim())
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Coupon validation error:', error);
        toast.error(t('invalidCoupon'));
        setIsValidating(false);
        return;
      }

      if (!coupon) {
        toast.error(t('invalidCoupon'));
        setIsValidating(false);
        return;
      }

      // Check if coupon has reached max usage
      if (coupon.usage_limit > 0 && coupon.times_used >= coupon.usage_limit) {
        toast.error(t('couponMaxUsed'));
        setIsValidating(false);
        return;
      }

      // Apply the coupon discount
      const discountData = {
        percentage: coupon.discount_percentage,
        amount: coupon.discount_amount,
        couponId: coupon.id,
        couponCode: coupon.code,
        ownerId: coupon.owner_id,
        ownerBenefitValue: coupon.owner_benefit_value,
        ownerBenefitType: coupon.owner_benefit_type
      };

      onApply(discountData);
      setIsApplied(true);
      toast.success(t('couponApplied'));
    } catch (err) {
      console.error('Error applying coupon:', err);
      toast.error(t('couponError'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onApply({});
    setIsApplied(false);
    setCouponCode('');
    toast.success(t('couponRemoved'));
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700">{t('haveCoupon')}</label>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder={t('enterCoupon')}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          disabled={isApplied || isValidating}
          className="flex-grow"
        />
        {isApplied ? (
          <Button 
            variant="outline" 
            onClick={handleRemoveCoupon}
            className="whitespace-nowrap"
          >
            {t('remove')}
          </Button>
        ) : (
          <Button 
            onClick={handleApplyCoupon}
            disabled={isValidating || !couponCode.trim()}
            className="whitespace-nowrap"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('validating')}
              </>
            ) : (
              t('apply')
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
