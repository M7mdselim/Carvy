
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, Shop, CarModel } from '../types'

interface SearchResults {
  products: Product[]
  shops: Shop[]
  carModels: CarModel[]
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
    carModels: [],
    loading: false,
    error: null,
  })

  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setResults({
          products: [],
          shops: [],
          carModels: [],
          loading: false,
          error: null,
        })
        return
      }

      setResults(prev => ({ ...prev, loading: true, error: null }))

      try {
        // Search products - only search by name, not description
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
          .ilike('name', `%${query}%`)
          .eq('status', 'active')
          .order('name')
          .limit(5)

        if (productsError) throw productsError

        // Search shops - only by name, not description
        const { data: shopsData, error: shopsError } = await supabase
          .from('shops')
          .select(`
            *,
            shop_categories (
              categories (name)
            )
          `)
          .ilike('name', `%${query}%`)
          .order('name')
          .limit(5)

        if (shopsError) throw shopsError

        // Search car models
        const { data: carModelsData, error: carModelsError } = await supabase
          .from('car_models')
          .select('*')
          .or(`make.ilike.%${query}%,model.ilike.%${query}%`)
          .order('make', { ascending: true })
          .order('model', { ascending: true })
          .limit(5)
        
        if (carModelsError) throw carModelsError

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
          carModels: carModelsData.map(carModel => ({
            id: carModel.id,
            make: carModel.make,
            model: carModel.model,
            yearStart: carModel.year_start,
            yearEnd: carModel.year_end || undefined,
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
