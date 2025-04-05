
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

        if (productsError) throw productsError

        // Shuffle the array to get random ordering
        const shuffledProducts = [...productsData].sort(() => Math.random() - 0.5)

        setProducts(
          shuffledProducts.map((product: any) => ({
            id: product.id,
            shopId: product.shop_id,
            name: product.name,
            description: product.description || '',
            price: product.price,
            image: product.image || '', // Empty string if no image is set
            category: product.categories?.name || 'Uncategorized',
            compatibility: product.product_car_models?.map((pcm: ProductCarModel) => {
              const car = pcm.car_models
              return `${car.make} ${car.model} (${car.year_start}${car.year_end ? `-${car.year_end}` : '+'})`
            }) || [],
            stock: product.stock,
            status: product.status || 'active',
            type: product.type || determineProductType(product.categories?.name || ''),
            productNumber: product.product_number || generateProductNumber(product.id)
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

  // Helper function to determine product type based on category
  const determineProductType = (category: string): string => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('engine')) return 'Engine Parts';
    if (categoryLower.includes('brake')) return 'Brake System';
    if (categoryLower.includes('transmission')) return 'Transmission';
    if (categoryLower.includes('oil') || categoryLower.includes('fluid')) return 'Oil & Fluids';
    if (categoryLower.includes('tyre') || categoryLower.includes('tire')) return 'Tyres';
    if (categoryLower.includes('electric')) return 'Electrical';
    if (categoryLower.includes('body')) return 'Body Parts';
    if (categoryLower.includes('interior')) return 'Interior';
    if (categoryLower.includes('exhaust')) return 'Exhaust System';
    return 'Other';
  }

  // Helper function to generate a mock product number
  const generateProductNumber = (id: string): string => {
    // Create a product number format: ABC-12345
    const prefix = 'CP'; // CP for Car Parts
    const numberId = id.replace(/[^0-9]/g, '').substring(0, 5).padStart(5, '0');
    return `${prefix}-${numberId}`;
  }

  return { products, loading, error }
}
