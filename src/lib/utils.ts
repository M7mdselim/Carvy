
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

/**
 * Calculate the coupon benefit amount based on benefit type
 * @param benefitValue The benefit value (fixed amount or percentage)
 * @param benefitType The benefit type ('amount' or 'percentage')
 * @param orderTotal The total amount of the order (required for percentage type)
 * @param shippingCost The shipping cost to exclude from percentage calculations
 * @returns The calculated benefit amount
 */
export function calculateCouponBenefit(
  benefitValue: number, 
  benefitType: string | null, 
  orderTotal: number = 0,
  shippingCost: number = 0
): number {
  if (benefitType === 'percentage' && orderTotal > 0) {
    // Calculate percentage discount based on order subtotal (excluding shipping)
    const subtotal = orderTotal - shippingCost;
    return (subtotal * benefitValue) / 100;
  }
  return benefitValue;
}
