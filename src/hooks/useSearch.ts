import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, Shop } from '../types'

interface SearchResults {
  products: Product[]
  shops: Shop[]
  loading: boolean
  error: Error | null
}

interface ProductCarModel {
  car_models: {
    make: string
    model: string
    year_start: number
    year_end?: number | null
  }
}

interface ShopCategory {
  categories: {
    name: string | null
  } | null
}

export function useSearch(query: string): SearchResults {
  const [results, setResults] = useState<SearchResults>({
    products: [],
    shops: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults({
          products: [],
          shops: [],
          loading: false,
          error: null,
        })
        return
      }

      setResults(prev => ({ ...prev, loading: true, error: null }))

      try {
        // Search products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories (name),
            product_car_models (
              car_models (
                make,
                model,
                year_start,
                year_end
              )
            )
          `)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .eq('status', 'active')
          .order('name')
          .limit(5)

        if (productsError) throw productsError

        // Search shops
        const { data: shopsData, error: shopsError } = await supabase
          .from('shops')
          .select(`
            *,
            shop_categories (
              categories (name)
            )
          `)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .order('name')
          .limit(5)

        if (shopsError) throw shopsError

        setResults({
          products: productsData.map(product => ({
            id: product.id,
            shopId: product.shop_id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            image: product.image || 'https://via.placeholder.com/500',
            category: product.categories?.name || 'Uncategorized',
            compatibility: product.product_car_models?.map((pcm: ProductCarModel) => {
              const car = pcm.car_models
              return `${car.make} ${car.model} (${car.year_start}${car.year_end ? `-${car.year_end}` : '+'})`
            }) || [],
            stock: product.stock,
          })),
          shops: shopsData.map(shop => ({
            id: shop.id,
            name: shop.name,
            description: shop.description || '',
            logo: shop.logo || 'https://via.placeholder.com/500',
            categories: shop.shop_categories
              ?.map((sc: ShopCategory) => sc.categories?.name)
              .filter((name: string | null | undefined): name is string => !!name) || [],
            rating: shop.rating || 0,
            reviewCount: shop.review_count || 0,
          })),
          loading: false,
          error: null,
        })
      } catch (e) {
        setResults(prev => ({
          ...prev,
          loading: false,
          error: e instanceof Error ? e : new Error('Failed to perform search'),
        }))
      }
    }

    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  return results
}