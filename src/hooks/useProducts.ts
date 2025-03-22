
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'

interface ProductCarModel {
  car_models: {
    make: string
    model: string
    year_start: number
    year_end?: number | null
  }
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
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
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (productsError) throw productsError

        setProducts(
          productsData.map((product) => ({
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
          }))
        )
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch products'))
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return { products, loading, error }
}
