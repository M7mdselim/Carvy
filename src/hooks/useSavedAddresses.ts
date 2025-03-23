
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SavedAddress {
  id: string;
  user_id: string;
  name: string;
  street_address: string;
  apartment?: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  phone_number?: string;
  is_default: boolean;
  created_at: string;
}

export function useSavedAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform address data to match SavedAddress interface
      const transformedAddresses = (data || []).map(addr => ({
        id: addr.id,
        user_id: addr.user_id,
        name: addr.recipient_name,
        street_address: addr.street,
        apartment: addr.apartment,
        city: addr.city,
        state: addr.district,
        zip_code: addr.postal_code,
        country: 'Egypt', // Default to Egypt as country
        phone_number: addr.phone,
        is_default: addr.is_default,
        created_at: addr.created_at
      }));

      setAddresses(transformedAddresses);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch addresses'));
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: Omit<SavedAddress, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      // Convert SavedAddress to the format expected by the addresses table
      const newAddress = {
        user_id: user.id,
        recipient_name: address.name,
        street: address.street_address,
        apartment: address.apartment,
        city: address.city,
        district: address.state,
        postal_code: address.zip_code,
        phone: address.phone_number,
        is_default: address.is_default || addresses.length === 0,
        // Add the required 'building' field with a default value if not provided
        building: 'Main',  // Using a default value for the required field
        floor: null        // Optional field
      };

      // If this is the first address or marked as default, ensure it's the only default
      if (newAddress.is_default) {
        // First, remove default status from all other addresses
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert([newAddress])
        .select()
        .single();

      if (error) throw error;

      await fetchAddresses();
      return data;
    } catch (err) {
      console.error('Error adding address:', err);
      toast.error('Failed to add address');
      return null;
    }
  };

  const updateAddress = async (
    id: string,
    address: Partial<Omit<SavedAddress, 'id' | 'user_id' | 'created_at'>>
  ) => {
    if (!user) return false;

    try {
      // Convert the partial SavedAddress to the format expected by the addresses table
      const updatedFields: Record<string, any> = {};
      
      if (address.name !== undefined) updatedFields.recipient_name = address.name;
      if (address.street_address !== undefined) updatedFields.street = address.street_address;
      if (address.apartment !== undefined) updatedFields.apartment = address.apartment;
      if (address.city !== undefined) updatedFields.city = address.city;
      if (address.state !== undefined) updatedFields.district = address.state;
      if (address.zip_code !== undefined) updatedFields.postal_code = address.zip_code;
      if (address.phone_number !== undefined) updatedFields.phone = address.phone_number;
      if (address.is_default !== undefined) updatedFields.is_default = address.is_default;

      // If setting as default, first remove default status from all other addresses
      if (address.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('addresses')
        .update(updatedFields)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAddresses();
      return true;
    } catch (err) {
      console.error('Error updating address:', err);
      toast.error('Failed to update address');
      return false;
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return false;

    try {
      // Check if this is the default address
      const addressToDelete = addresses.find(addr => addr.id === id);
      
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // If we deleted the default address and have other addresses, make the first one default
      if (addressToDelete?.is_default && addresses.length > 1) {
        const nextAddress = addresses.find(addr => addr.id !== id);
        if (nextAddress) {
          await supabase
            .from('addresses')
            .update({ is_default: true })
            .eq('id', nextAddress.id);
        }
      }

      await fetchAddresses();
      return true;
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('Failed to delete address');
      return false;
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return false;

    try {
      // First, set all addresses to non-default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAddresses();
      return true;
    } catch (err) {
      console.error('Error setting default address:', err);
      toast.error('Failed to set default address');
      return false;
    }
  };

  // Get default address or first address if no default
  const getDefaultAddress = (): SavedAddress | null => {
    if (addresses.length === 0) return null;
    return addresses.find(addr => addr.is_default) || addresses[0];
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
  };
}
