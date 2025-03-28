
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get request body
    const { userId, amount, orderId, couponId } = await req.json()

    // Validate primary inputs
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid inputs: userId must be provided and amount must be a positive number',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log(`Processing credit for user: ${userId}, amount: ${amount}, orderId: ${orderId}, couponId: ${couponId}`)

    // Get coupon details if couponId is provided
    let calculatedAmount = amount;
    let benefitType = null;
    let orderTotal = 0;
    
    if (couponId && orderId) {
      // First, get the coupon details to determine the benefit type
      const { data: couponData, error: couponError } = await supabase
        .from('coupons')
        .select('owner_benefit_type, owner_benefit_value')
        .eq('id', couponId)
        .single();
        
      if (couponError) {
        console.error('Error fetching coupon details:', couponError);
      } else if (couponData) {
        benefitType = couponData.owner_benefit_type;
        
        // If benefit type is percentage, we need to get the order total
        if (benefitType === 'percentage') {
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('id', orderId)
            .single();
            
          if (orderError) {
            console.error('Error fetching order details:', orderError);
          } else if (orderData) {
            orderTotal = orderData.total_amount;
            // Calculate the percentage amount
            calculatedAmount = (orderTotal * couponData.owner_benefit_value) / 100;
            console.log(`Calculated percentage benefit: ${calculatedAmount} (${couponData.owner_benefit_value}% of ${orderTotal})`);
          }
        }
      }
    }

    // Use RPC function to update balance with the fixed order (row_id, amount)
    console.log(`Incrementing balance for user ${userId} by ${calculatedAmount}`)
    const { data: incrementResult, error: incrementError } = await supabase.rpc('increment_balance', {
      row_id: userId,
      amount: calculatedAmount,
    })
    
    if (incrementError) {
      console.error('Error incrementing balance:', incrementError)
      return new Response(
        JSON.stringify({ error: incrementError.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
    
    const newBalance = incrementResult

    // If orderId and couponId are provided, insert into coupon_usage and increment times_used
    if (orderId && couponId) {
      console.log(`Tracking coupon usage for orderId: ${orderId}, couponId: ${couponId}`)
      
      try {
        // Insert the coupon usage record
        const { error: couponUsageError } = await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: couponId,
            user_id: userId,
            order_id: orderId,
            used_at: new Date().toISOString()
          })
        
        if (couponUsageError && !couponUsageError.message.includes('duplicate')) {
          console.error('Error recording coupon usage:', couponUsageError)
        }
        
        // Increment the times_used counter on the coupon
        const { error: couponUpdateError } = await supabase
          .from('coupons')
          .update({ times_used: supabase.sql`times_used + 1` })
          .eq('id', couponId)
        
        if (couponUpdateError) {
          console.error('Error incrementing coupon usage count:', couponUpdateError)
        }
      } catch (error) {
        console.error('Error handling coupon usage:', error)
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        newBalance: newBalance,
        couponTracked: !!(orderId && couponId),
        calculatedAmount: calculatedAmount,
        benefitType: benefitType,
        orderTotal: orderTotal
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
