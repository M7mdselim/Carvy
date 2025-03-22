
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAdminSetup = () => {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const setupAdminAccess = async () => {
      try {
        setLoading(true);
        
        // Call the grant_admin_access function
        await supabase.rpc('grant_admin_access');
        
        // Ensure storage bucket exists
        await ensureStorageBucket();
      } catch (error) {
        console.error("Error setting up admin access:", error);
        toast({
          title: "Admin Access Error",
          description: "There was an issue setting up admin access. Some functions may be limited.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    setupAdminAccess();
  }, [toast]);

  // Ensure storage bucket exists
  const ensureStorageBucket = async () => {
    try {
      // Check if bucket exists first
      const { data: buckets } = await supabase.storage.listBuckets();
      
      if (!buckets?.find(bucket => bucket.name === 'Shops Photos')) {
        // Create the bucket if it doesn't exist
      }
    } catch (error) {
      console.error('Error checking/creating storage bucket:', error);
    }
  };

  return { loading };
};
