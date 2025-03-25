
-- Create new RPC function for incrementing profile balance
CREATE OR REPLACE FUNCTION increment_balance(row_id uuid, amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
   new_balance numeric;
BEGIN
   UPDATE profiles
   SET balance_credits = COALESCE(balance_credits, 0) + amount
   WHERE id = row_id
   RETURNING balance_credits INTO new_balance;
   
   RETURN new_balance;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_balance TO authenticated;
