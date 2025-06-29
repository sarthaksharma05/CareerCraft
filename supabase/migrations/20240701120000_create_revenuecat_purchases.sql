-- Create table for RevenueCat purchases
CREATE TABLE IF NOT EXISTS revenuecat_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  billing_cycle text NOT NULL,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'paid',
  purchased_at timestamptz NOT NULL DEFAULT now()
);

-- Index for quick lookup by user
CREATE INDEX IF NOT EXISTS idx_revenuecat_purchases_user_id ON revenuecat_purchases(user_id); 