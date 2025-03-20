
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Shop, Category } from '../types'

// Updated ShopData type
type ShopData = {
  id: string
  name: string
  description: string | null
  logo: string | null
  rating: number | null
  review_count: number | null
}

// Define the shape of the response from the shop_categories query
interface ShopCategoryResponse {
  shops: ShopData
}

export function useShopsByCategory(categoryId: string) {
  const [shops, setShops] = useState<Shop[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchShopsByCategory() {
      try {
        // Fetch category details
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single()

        if (categoryError) throw categoryError

        setCategory({
          id: categoryData.id,
          name: categoryData.name,
          icon: categoryData.icon,
        })

        // Fetch shops through the shop_categories junction table
        const { data: shopsData, error: shopsError } = await supabase
          .from('shop_categories')
          .select(`
            shops (
              id,
              name,
              description,
              logo,
              rating,
              review_count
            )
          `)
          .eq('category_id', categoryId)

        if (shopsError) throw shopsError

        // Transform and deduplicate shops data
        // First cast the response to the correct type
        const typedShopsData = shopsData as ShopCategoryResponse[];
        
        // Now transform the data
        const uniqueShops = Array.from(
          new Map(
            typedShopsData
              .map(item => item.shops) // Extract the shops data
              .filter((shop): shop is ShopData => shop !== null)
              .map(shop => [
                shop.id,
                {
                  id: shop.id,
                  name: shop.name,
                  description: shop.description || '',
                  logo: shop.logo || 'https://via.placeholder.com/500',
                  categories: [categoryData.name],
                  rating: shop.rating || 0,
                  reviewCount: shop.review_count || 0,
                },
              ])
          ).values()
        )

        setShops(uniqueShops)
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch shops'))
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchShopsByCategory()
    }
  }, [categoryId])

  return { shops, category, loading, error }
}
