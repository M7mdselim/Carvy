
-- Create a function to increment balance credits
CREATE OR REPLACE FUNCTION public.increment_balance(row_id UUID, amount NUMERIC)
RETURNS NUMERIC
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public.profiles
  SET balance_credits = balance_credits + amount
  WHERE id = row_id
  RETURNING balance_credits;
$$;
