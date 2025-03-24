
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Shop } from '../types'

interface ShopCategory {
  categories: {
    name: string | null
  } | null
}

export function useShops() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchShops() {
      try {
        const { data: shopsData, error: shopsError } = await supabase
          .from('shops')
          .select(`
            *,
            shop_categories (
              categories (
                name
              )
            )
          `)
          .order('id', { ascending: false }) // Fetch in random order (newest first)

        if (shopsError) throw shopsError

        // Shuffle the array to get random ordering
        const shuffledShops = [...shopsData].sort(() => Math.random() - 0.5)

        setShops(
          shuffledShops.map((shop) => ({
            id: shop.id,
            name: shop.name,
            description: shop.description || '',
            logo: shop.logo || 'https://via.placeholder.com/500',
            categories: shop.shop_categories
              ?.map((sc: ShopCategory) => sc.categories?.name)
              .filter((name: string | null | undefined): name is string => !!name) || [],
            rating: shop.rating || 0,
            reviewCount: shop.review_count || 0,
          }))
        )
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch shops'))
      } finally {
        setLoading(false)
      }
    }

    fetchShops()
  }, [])

  return { shops, loading, error }
}
