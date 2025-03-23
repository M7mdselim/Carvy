
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Product } from '../types';
import { toast } from 'sonner';

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // First, get the user's wishlist items
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);

      if (wishlistError) {
        console.error('Error fetching wishlist data:', wishlistError);
        throw wishlistError;
      }
      
      if (!wishlistData || wishlistData.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }
      
      // Get the product IDs from the wishlist
      const productIds = wishlistData.map(item => item.product_id);
      
      // Then fetch the full product details for each wishlist item
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:category_id(name),
          product_car_models(
            car_model:car_model_id(
              make,
              model,
              year_start,
              year_end
            )
          )
        `)
        .in('id', productIds);

      if (productsError) {
        console.error('Error fetching product data:', productsError);
        throw productsError;
      }

      if (!productsData) {
        setWishlistItems([]);
      } else {
        // Format the products data to match our Product interface
        const formattedProducts = productsData.map(product => ({
          id: product.id,
          shopId: product.shop_id,
          name: product.name,
          description: product.description || '',
          price: product.price,
          image: product.image || 'https://via.placeholder.com/500',
          category: product.category?.name || 'Uncategorized',
          compatibility: product.product_car_models?.map((pcm: any) => {
            const car = pcm.car_model;
            return `${car.make} ${car.model} (${car.year_start}${car.year_end ? `-${car.year_end}` : '+'})`
          }) || [],
          stock: product.stock,
        }));

        setWishlistItems(formattedProducts);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch wishlist';
      setError(e instanceof Error ? e : new Error(errorMessage));
      console.error('Error fetching wishlist:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [user, fetchWishlist]);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please log in to add items to your wishlist');
      return false;
    }

    try {
      const { error } = await supabase
        .from('wishlists')
        .insert([{ user_id: user.id, product_id: productId }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.info('This item is already in your wishlist');
          return true;
        }
        throw error;
      }

      toast.success('Added to wishlist');
      fetchWishlist();
      return true;
    } catch (e) {
      console.error('Error adding to wishlist:', e);
      toast.error('Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setWishlistItems(wishlistItems.filter(item => item.id !== productId));
      toast.success('Removed from wishlist');
      return true;
    } catch (e) {
      console.error('Error removing from wishlist:', e);
      toast.error('Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle(); // Using maybeSingle instead of single to prevent errors

      if (error) throw error;

      return !!data;
    } catch (e) {
      console.error('Error checking wishlist:', e);
      return false;
    }
  };

  return {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };
}
