
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function useProductRatings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  const fetchUserRating = async (productId: string) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      // Using a raw query to avoid type issues with the table that was just created
      const { data, error } = await supabase
        .from('product_ratings')
        .select('rating')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user rating:', error);
        return null;
      }
      
      setUserRating(data?.rating || null);
      return data?.rating || null;
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const rateProduct = async (productId: string, rating: number) => {
    if (!user) {
      toast.error(t('pleaseLoginToRate'));
      return false;
    }
    
    try {
      setLoading(true);
      
      // Check if user has already rated this product using raw query
      const { data: existingRating } = await supabase
        .from('product_ratings')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      let result;
      
      if (existingRating) {
        // Update existing rating with raw query
        result = await supabase
          .from('product_ratings')
          .update({ rating })
          .eq('product_id', productId)
          .eq('user_id', user.id);
      } else {
        // Insert new rating with raw query
        result = await supabase
          .from('product_ratings')
          .insert({
            product_id: productId,
            user_id: user.id,
            rating
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      setUserRating(rating);
      toast.success(t('thankYouForRating'));
      return true;
    } catch (error: any) {
      console.error('Error rating product:', error);
      toast.error(error.message || t('errorRatingProduct'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    userRating,
    loading,
    fetchUserRating,
    rateProduct
  };
}

export function useShopRatings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);

  const fetchUserRating = async (shopId: string) => {
    if (!user) return null;
    
    try {
      setLoading(true);
      // Using a raw query to avoid type issues with the table that was just created
      const { data, error } = await supabase
        .from('shop_ratings')
        .select('rating')
        .eq('shop_id', shopId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user shop rating:', error);
        return null;
      }
      
      setUserRating(data?.rating || null);
      return data?.rating || null;
    } catch (error) {
      console.error('Error fetching user shop rating:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const rateShop = async (shopId: string, rating: number) => {
    if (!user) {
      toast.error(t('pleaseLoginToRate'));
      return false;
    }
    
    try {
      setLoading(true);
      
      // Check if user has already rated this shop using raw query
      const { data: existingRating } = await supabase
        .from('shop_ratings')
        .select('id')
        .eq('shop_id', shopId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      let result;
      
      if (existingRating) {
        // Update existing rating with raw query
        result = await supabase
          .from('shop_ratings')
          .update({ rating })
          .eq('shop_id', shopId)
          .eq('user_id', user.id);
      } else {
        // Insert new rating with raw query
        result = await supabase
          .from('shop_ratings')
          .insert({
            shop_id: shopId,
            user_id: user.id,
            rating
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      setUserRating(rating);
      toast.success(t('thankYouForRatingShop'));
      return true;
    } catch (error: any) {
      console.error('Error rating shop:', error);
      toast.error(error.message || t('errorRatingShop'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    userRating,
    loading,
    fetchUserRating,
    rateShop
  };
}
