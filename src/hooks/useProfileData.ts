
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { ProfileData, Coupon, CouponOwnerBenefitType } from '../types';

export const useProfileData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching profile for user:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        console.log('Profile fetched successfully:', data);
        setProfile({
          id: data.id,
          username: data.username,
          balanceCredits: data.balance_credits || 0,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          phoneNumber: user.user_metadata?.phone_number || '',
          isAdmin: data.is_admin || false,
          ownerId: data.owner_id
        });
        console.log('Balance credits:', data.balance_credits);
      } else {
        // Profile not found, create a new one
        console.log('Profile not found, creating new one for user:', user.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id,
              username: user.email?.split('@')[0],
              balance_credits: 0,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();
        
        if (createError) throw createError;
        
        if (newProfile) {
          setProfile({
            id: newProfile.id,
            username: newProfile.username,
            balanceCredits: newProfile.balance_credits || 0,
            firstName: user.user_metadata?.first_name || '',
            lastName: user.user_metadata?.last_name || '',
            phoneNumber: user.user_metadata?.phone_number || '',
            isAdmin: newProfile.is_admin || false,
            ownerId: newProfile.owner_id
          });
          console.log('Created new profile for user:', newProfile.id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchUserCoupons = async () => {
    if (!user) return;
    
    try {
      setCouponsLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('owner_id', user.id);

      if (error) throw error;

      // Transform the database data to match our Coupon type
      const typedCoupons: Coupon[] = data?.map(coupon => ({
        ...coupon,
        // Convert string to our union type
        owner_benefit_type: convertToOwnerBenefitType(coupon.owner_benefit_type)
      })) || [];

      setCoupons(typedCoupons);
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      toast.error('Failed to load coupons');
    } finally {
      setCouponsLoading(false);
    }
  };

  // Helper function to convert string to our union type
  const convertToOwnerBenefitType = (type: string | null): CouponOwnerBenefitType => {
    if (type === 'percentage') return 'percentage';
    if (type === 'amount') return 'amount';
    return null;
  };

  const refreshProfile = async (): Promise<void> => {
    console.log('Refreshing profile data...');
    await fetchProfile();
  };

  return { 
    profile, 
    loading, 
    error,
    coupons,
    couponsLoading,
    fetchUserCoupons,
    refreshProfile
  };
};
