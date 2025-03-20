export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          created_at?: string
        }
      }
      shops: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          logo: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          logo?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          logo?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          shop_id: string
          category_id: string | null
          name: string
          description: string | null
          price: number
          image: string | null
          stock: number
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          category_id?: string | null
          name: string
          description?: string | null
          price: number
          image?: string | null
          stock?: number
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          price?: number
          image?: string | null
          stock?: number
          created_at?: string
        }
      }
      product_compatibility: {
        Row: {
          id: string
          product_id: string
          car_model: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          car_model: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          car_model?: string
          created_at?: string
        }
      }
    }
  }
}