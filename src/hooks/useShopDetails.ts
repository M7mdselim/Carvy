import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Shop, Product } from '../types'

interface ShopCategory {
  categories: {
    name: string | null
  } | null
}

interface ProductCarModel {
  car_models: {
    make: string
    model: string
    year_start: number
    year_end?: number | null
  }
}

export function useShopDetails(shopId: string) {
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchShopDetails() {
      try {
        // Fetch shop details with categories
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select(`
            *,
            shop_categories (
              categories (name)
            )
          `)
          .eq('id', shopId)
          .single()

        if (shopError) throw shopError

        const uniqueCategories = Array.from(
          new Set<string>(
            shopData.shop_categories
              ?.map((item: ShopCategory) => item.categories?.name)
              .filter((name: string | null | undefined): name is string => Boolean(name))
          )
        )

        setShop({
          id: shopData.id,
          name: shopData.name,
          description: shopData.description || '',
          logo: shopData.logo || 'https://via.placeholder.com/500',
          categories: uniqueCategories,
          rating: shopData.rating || 0,
          reviewCount: shopData.review_count || 0,
        })

        // Fetch shop's products
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
          .eq('shop_id', shopId)
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
        setError(e instanceof Error ? e : new Error('Failed to fetch shop details'))
      } finally {
        setLoading(false)
      }
    }

    fetchShopDetails()
  }, [shopId])

  return { shop, products, loading, error }
}