
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Select } from '../../components/ui/select';
import { CouponOwnerBenefitType } from '../../types';

interface CreateCouponFormProps {
  onCreateCoupon: (couponData: {
    code: string;
    discount_percentage: number;
    discount_amount?: number | null;
    usage_limit: number;
    owner_benefit_type: CouponOwnerBenefitType;
    owner_benefit_value: number;
  }) => Promise<{ success: boolean; message?: string }>;
}

export function CreateCouponForm({ onCreateCoupon }: CreateCouponFormProps) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: 0,
    discount_amount: 0,
    usage_limit: 0,
    owner_benefit_type: 'percentage' as CouponOwnerBenefitType,
    owner_benefit_value: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // For numeric fields, convert to number
    if (['discount_percentage', 'discount_amount', 'usage_limit', 'owner_benefit_value'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    
    if (formData.discount_percentage <= 0) {
      toast.error('Discount percentage must be greater than 0');
      return;
    }

    if (formData.owner_benefit_value <= 0) {
      toast.error('Owner benefit value must be greater than 0');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const result = await onCreateCoupon({
        ...formData,
        discount_amount: formData.discount_amount > 0 ? formData.discount_amount : null
      });
      
      if (result.success) {
        toast.success(t('couponCreated'));
        // Reset form
        setFormData({
          code: '',
          discount_percentage: 0,
          discount_amount: 0,
          usage_limit: 0,
          owner_benefit_type: 'percentage',
          owner_benefit_value: 0
        });
      } else {
        toast.error(result.message || t('couponCreationError'));
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error(t('couponCreationError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800">{t('createCoupon')}</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-600">{t('couponCode')}</label>
        <Input
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="SUMMER25"
          className="mt-1"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600">{t('discountPercentage')}</label>
        <Input
          type="number"
          name="discount_percentage"
          value={formData.discount_percentage}
          onChange={handleChange}
          placeholder="25"
          className="mt-1"
          min={0}
          max={100}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600">{t('discountAmount')}</label>
        <Input
          type="number"
          name="discount_amount"
          value={formData.discount_amount}
          onChange={handleChange}
          placeholder="0"
          className="mt-1"
          min={0}
        />
        <p className="text-xs text-gray-500 mt-1">Optional, leave 0 if not applicable</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600">{t('usageLimit')}</label>
        <Input
          type="number"
          name="usage_limit"
          value={formData.usage_limit}
          onChange={handleChange}
          placeholder="100"
          className="mt-1"
          min={0}
        />
        <p className="text-xs text-gray-500 mt-1">0 for unlimited uses</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600">{t('ownerBenefitType')}</label>
        <select
          name="owner_benefit_type"
          value={formData.owner_benefit_type || 'percentage'}
          onChange={handleChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="percentage">{t('percentage')}</option>
          <option value="amount">{t('amount')}</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-600">{t('ownerBenefitValue')}</label>
        <Input
          type="number"
          name="owner_benefit_value"
          value={formData.owner_benefit_value}
          onChange={handleChange}
          placeholder="10"
          className="mt-1"
          min={0}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.owner_benefit_type === 'percentage' ? 
            'Percentage of order total you will receive as credits' : 
            'Fixed amount you will receive as credits per use'}
        </p>
      </div>
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? '...' : t('createCoupon')}
      </Button>
    </form>
  );
}
