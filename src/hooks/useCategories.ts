import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        if (error) throw error

        setCategories(
          data.map((category) => ({
            id: category.id,
            name: category.name,
            icon: category.icon,
          }))
        )
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to fetch categories'))
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}