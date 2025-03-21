export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      car_models: {
        Row: {
          created_at: string | null
          id: string
          make: string
          model: string
          year_end: number | null
          year_start: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          make: string
          model: string
          year_end?: number | null
          year_start: number
        }
        Update: {
          created_at?: string | null
          id?: string
          make?: string
          model?: string
          year_end?: number | null
          year_start?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          id: string
          order_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_amount: number | null
          discount_percentage: number
          id: string
          owner_id: string | null
          times_used: number
          usage_limit: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_amount?: number | null
          discount_percentage: number
          id?: string
          owner_id?: string | null
          times_used?: number
          usage_limit?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_amount?: number | null
          discount_percentage?: number
          id?: string
          owner_id?: string | null
          times_used?: number
          usage_limit?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          city: string
          coupon_code: string | null
          created_at: string
          discount_amount: number | null
          email: string
          first_name: string
          id: string
          last_name: string
          payment_method: string | null
          phone: string
          postal_code: string
          status: string
          total_amount: number
          user_id: string
        }
        Insert: {
          address: string
          city: string
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          email: string
          first_name: string
          id?: string
          last_name: string
          payment_method?: string | null
          phone: string
          postal_code: string
          status?: string
          total_amount: number
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          payment_method?: string | null
          phone?: string
          postal_code?: string
          status?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          changed_at: string | null
          id: string
          price: number
          product_id: string
        }
        Insert: {
          changed_at?: string | null
          id?: string
          price: number
          product_id: string
        }
        Update: {
          changed_at?: string | null
          id?: string
          price?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_car_models: {
        Row: {
          car_model_id: string
          created_at: string | null
          id: string
          product_id: string
        }
        Insert: {
          car_model_id: string
          created_at?: string | null
          id?: string
          product_id: string
        }
        Update: {
          car_model_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_car_models_car_model_id_fkey"
            columns: ["car_model_id"]
            isOneToOne: false
            referencedRelation: "car_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_car_models_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          name: string
          price: number
          shop_id: string
          status: string
          stock: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price: number
          shop_id: string
          status?: string
          stock?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          shop_id?: string
          status?: string
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          owner_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          is_admin?: boolean | null
          owner_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          owner_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      shop_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          shop_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          shop_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_categories_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo: string | null
          name: string
          owner_id: string
          rating: number | null
          review_count: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name: string
          owner_id: string
          rating?: number | null
          review_count?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo?: string | null
          name?: string
          owner_id?: string
          rating?: number | null
          review_count?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_coupon: {
        Args: {
          coupon_code: string
          order_id: string
        }
        Returns: Json
      }
      grant_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
