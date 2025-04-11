
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

/**
 * Extract questions from a text message
 * @param message The input text message
 * @returns Array of identified questions
 */
export function extractQuestionsFromText(message: string): string[] {
  // Split by punctuation and filter empty strings
  const sentences = message
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // Identify potential questions
  return sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    return (
      lowerSentence.includes('?') ||
      lowerSentence.startsWith('what') ||
      lowerSentence.startsWith('how') ||
      lowerSentence.startsWith('where') ||
      lowerSentence.startsWith('when') ||
      lowerSentence.startsWith('why') ||
      lowerSentence.startsWith('which') ||
      lowerSentence.startsWith('who') ||
      lowerSentence.startsWith('can') ||
      lowerSentence.startsWith('do') ||
      lowerSentence.startsWith('does') ||
      lowerSentence.startsWith('is') ||
      lowerSentence.startsWith('are') ||
      lowerSentence.includes('tell me about')
    );
  });
}

/**
 * Check if a year falls within a compatibility year range
 * @param yearStr The compatibility year string (e.g., "2005-2010", "2005+", "2005", "2005-Present")
 * @param selectedYear The year to check
 * @returns Boolean indicating if the year is compatible
 */
export function isYearInRange(yearStr: string, selectedYear: number): boolean {
  // Handle various formats including "Present" as the end year
  const yearRegex = /\((\d{4})(?:[-+](\d{4}|\+|Present))?\)/i;
  const yearMatch = yearStr.match(yearRegex);
  
  if (!yearMatch) return false;
  
  const startYear = parseInt(yearMatch[1]);
  const endPart = yearMatch[2]; // This could be a year, '+', 'Present', or undefined
  
  // Case 1: Single year format - e.g., "(2005)"
  if (!endPart) {
    return selectedYear === startYear;
  }
  
  // Case 2: Open-ended range - e.g., "(2005+)" or "(2005-Present)"
  if (endPart === '+' || endPart.toLowerCase() === 'present') {
    return selectedYear >= startYear;
  }
  
  // Case 3: Specific range - e.g., "(2005-2010)"
  const endYear = parseInt(endPart);
  return selectedYear >= startYear && selectedYear <= endYear;
}
