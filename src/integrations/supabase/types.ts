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
      addresses: {
        Row: {
          apartment: string | null
          area: string | null
          building: string
          city: string
          created_at: string
          district: string
          floor: string | null
          id: string
          is_default: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string
          postal_code: string | null
          recipient_name: string
          street: string
          user_id: string
        }
        Insert: {
          apartment?: string | null
          area?: string | null
          building: string
          city: string
          created_at?: string
          district: string
          floor?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone: string
          postal_code?: string | null
          recipient_name: string
          street: string
          user_id: string
        }
        Update: {
          apartment?: string | null
          area?: string | null
          building?: string
          city?: string
          created_at?: string
          district?: string
          floor?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string
          postal_code?: string | null
          recipient_name?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      areas: {
        Row: {
          city_id: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
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
      chat_feedback: {
        Row: {
          car_model: string | null
          category: string | null
          created_at: string
          email: string | null
          feedback_type: string
          id: string
          message: string
          notes: string | null
          phone_number: string | null
          priority: string | null
          product_name: string | null
          resolved: boolean | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          car_model?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          feedback_type: string
          id?: string
          message: string
          notes?: string | null
          phone_number?: string | null
          priority?: string | null
          product_name?: string | null
          resolved?: boolean | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          car_model?: string | null
          category?: string | null
          created_at?: string
          email?: string | null
          feedback_type?: string
          id?: string
          message?: string
          notes?: string | null
          phone_number?: string | null
          priority?: string | null
          product_name?: string | null
          resolved?: boolean | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          shipping_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          shipping_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          shipping_cost?: number
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string | null
          id: string
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          id?: string
          order_id?: string | null
          used_at?: string | null
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
          owner_benefit_type: string | null
          owner_benefit_value: number | null
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
          owner_benefit_type?: string | null
          owner_benefit_value?: number | null
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
          owner_benefit_type?: string | null
          owner_benefit_value?: number | null
          owner_id?: string | null
          times_used?: number
          usage_limit?: number
        }
        Relationships: []
      }
      credit_adjustments: {
        Row: {
          amount: number
          coupon_code: string | null
          created_at: string | null
          id: string
          order_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          coupon_code?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          coupon_code?: string | null
          created_at?: string | null
          id?: string
          order_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_adjustments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_adjustments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          related_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read?: boolean
          related_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
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
          coupon_id: string | null
          created_at: string
          discount_amount: number | null
          email: string
          first_name: string
          id: string
          last_name: string
          payment_method: string | null
          phone: string
          postal_code: string
          shipping_cost: number | null
          status: string
          subtotal: number
          total_amount: number
          user_id: string
        }
        Insert: {
          address: string
          city: string
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          email: string
          first_name: string
          id?: string
          last_name: string
          payment_method?: string | null
          phone: string
          postal_code: string
          shipping_cost?: number | null
          status?: string
          subtotal?: number
          total_amount: number
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          discount_amount?: number | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          payment_method?: string | null
          phone?: string
          postal_code?: string
          shipping_cost?: number | null
          status?: string
          subtotal?: number
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
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
      product_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          original_name: string | null
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          original_name?: string | null
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          original_name?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          product_id: string
          rating: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          rating: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          rating?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_ratings_product_id_fkey"
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
          product_number: string | null
          rating: number | null
          returnable: boolean | null
          review_count: number | null
          shop_id: string
          status: string
          stock: number
          type: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price: number
          product_number?: string | null
          rating?: number | null
          returnable?: boolean | null
          review_count?: number | null
          shop_id: string
          status?: string
          stock?: number
          type?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          product_number?: string | null
          rating?: number | null
          returnable?: boolean | null
          review_count?: number | null
          shop_id?: string
          status?: string
          stock?: number
          type?: string | null
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
          balance_credits: number | null
          created_at: string | null
          id: string
          is_admin: boolean | null
          owner_id: string | null
          username: string | null
        }
        Insert: {
          balance_credits?: number | null
          created_at?: string | null
          id: string
          is_admin?: boolean | null
          owner_id?: string | null
          username?: string | null
        }
        Update: {
          balance_credits?: number | null
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          owner_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          created_at: string
          id: string
          order_id: string
          reason: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          reason: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          reason?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      shop_ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          shop_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          shop_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          shop_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_ratings_shop_id_fkey"
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
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      image_usage_status: {
        Row: {
          created_at: string | null
          image_url: string | null
          is_used: boolean | null
          original_name: string | null
          source_table: string | null
        }
        Insert: {
          created_at?: string | null
          image_url?: string | null
          is_used?: never
          original_name?: string | null
          source_table?: never
        }
        Update: {
          created_at?: string | null
          image_url?: string | null
          is_used?: never
          original_name?: string | null
          source_table?: never
        }
        Relationships: []
      }
    }
    Functions: {
      add_owner_benefit: {
        Args: {
          p_owner_id: string
          p_order_id: string
          p_benefit_type: string
          p_benefit_value: number
          p_status: string
        }
        Returns: undefined
      }
      apply_coupon: {
        Args: { coupon_code: string; order_id: string }
        Returns: Json
      }
      decrement_stock: {
        Args: { row_id: string; amount: number }
        Returns: number
      }
      grant_admin_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      increment_balance: {
        Args: { row_id: string; amount: number }
        Returns: number
      }
      increment_usage: {
        Args: { coupon_id: string }
        Returns: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
