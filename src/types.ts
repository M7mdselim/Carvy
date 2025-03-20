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