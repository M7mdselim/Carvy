export interface Shop {
  id: string;
  name: string;
  description: string;
  logo: string;
  categories: string[];
  rating?: number;
  reviewCount?: number;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  compatibility: string[];
  stock: number;
  status?: string;
  type?: string;
  productNumber?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface CarModel {
  id: string;
  make: string;
  model: string;
  yearStart: number;
  yearEnd?: number;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  district: string;
  city: string;
  area: string;
  postal_code: string;
  phone: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
}

export interface City {
  id: string;
  name: string;
  shipping_cost: number;
}

export interface Area {
  id: string;
  city_id: string;
  name: string;
}

export interface ProfileData {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  balanceCredits: number;
  isAdmin?: boolean;
  ownerId?: string | null;
}

export type PaymentMethod = 'cash' | 'cash_on_delivery' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';

export type CouponOwnerBenefitType = 'percentage' | 'amount' | null;

export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  discount_amount: number | null;
  active: boolean;
  usage_limit: number;
  times_used: number;
  owner_id: string | null;
  owner_benefit_type: CouponOwnerBenefitType;
  owner_benefit_value: number;
}
