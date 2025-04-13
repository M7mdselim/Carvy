import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "EGP"): string {
  return `${amount.toFixed(2)} ${currency}`
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
  orderTotal = 0,
  shippingCost = 0,
): number {
  if (benefitType === "percentage" && orderTotal > 0) {
    // Calculate percentage discount based on order subtotal (excluding shipping)
    const subtotal = orderTotal - shippingCost
    return (subtotal * benefitValue) / 100
  }
  return benefitValue
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
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  // Identify potential questions
  return sentences.filter((sentence) => {
    const lowerSentence = sentence.toLowerCase()
    return (
      lowerSentence.includes("?") ||
      lowerSentence.startsWith("what") ||
      lowerSentence.startsWith("how") ||
      lowerSentence.startsWith("where") ||
      lowerSentence.startsWith("when") ||
      lowerSentence.startsWith("why") ||
      lowerSentence.startsWith("which") ||
      lowerSentence.startsWith("who") ||
      lowerSentence.startsWith("can") ||
      lowerSentence.startsWith("do") ||
      lowerSentence.startsWith("does") ||
      lowerSentence.startsWith("is") ||
      lowerSentence.startsWith("are") ||
      lowerSentence.includes("tell me about")
    )
  })
}

/**
 * Check if a year falls within a compatibility year range
 * @param compatibilityString The compatibility string containing year information
 * @param selectedYear The year to check
 * @returns Boolean indicating if the year is compatible
 */
export function isYearInRange(compatibilityString: string, selectedYear: number): boolean {
  console.log(`Checking year ${selectedYear} against "${compatibilityString}"`)

  // Super simple approach - just look for patterns we know exist

  // Check for "YYYY+" pattern (with or without parentheses)
  const plusPattern = /(\d{4})\+/
  const plusMatch = compatibilityString.match(plusPattern)
  if (plusMatch) {
    const startYear = Number.parseInt(plusMatch[1])
    console.log(`Found year with plus: ${startYear}+`)
    return selectedYear >= startYear
  }

  // Check for "YYYY-Present" pattern (with or without parentheses)
  const presentPattern = /(\d{4})[-\s]+(to\s+)?[Pp]resent/
  const presentMatch = compatibilityString.match(presentPattern)
  if (presentMatch) {
    const startYear = Number.parseInt(presentMatch[1])
    console.log(`Found year to present: ${startYear}-Present`)
    return selectedYear >= startYear
  }

  // Check for "YYYY-YYYY" pattern (with or without parentheses)
  const rangePattern = /(\d{4})[-\s]+(to\s+)?(\d{4})/
  const rangeMatch = compatibilityString.match(rangePattern)
  if (rangeMatch) {
    const startYear = Number.parseInt(rangeMatch[1])
    const endYear = Number.parseInt(rangeMatch[3])
    console.log(`Found year range: ${startYear}-${endYear}`)
    return selectedYear >= startYear && selectedYear <= endYear
  }

  // Check for single year (with or without parentheses)
  const singleYearPattern = /$$(\d{4})$$/
  const singleYearMatch = compatibilityString.match(singleYearPattern)
  if (singleYearMatch) {
    const year = Number.parseInt(singleYearMatch[1])
    console.log(`Found single year in parentheses: ${year}`)
    return selectedYear === year
  }

  // Last resort - just find any 4-digit number
  const anyYearPattern = /\b(\d{4})\b/
  const anyYearMatch = compatibilityString.match(anyYearPattern)
  if (anyYearMatch) {
    const year = Number.parseInt(anyYearMatch[1])
    console.log(`Found year: ${year}`)
    return selectedYear === year
  }

  console.log("No year pattern matched")
  return false
}
