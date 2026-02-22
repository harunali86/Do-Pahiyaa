-- Create transactions table to track credit purchases and payments
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID NOT NULL REFERENCES dealers(profile_id),
    amount NUMERIC NOT NULL, -- Total amount paid (including GST)
    credits_purchased INTEGER NOT NULL, -- Number of leads/credits added
    gst_amount NUMERIC DEFAULT 0,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    status TEXT DEFAULT 'pending', -- pending, success, failed
    type TEXT DEFAULT 'credit_purchase', -- credit_purchase, subscription
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_transactions_dealer_id ON transactions(dealer_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Dealers can view their own transactions
CREATE POLICY "Dealers can view own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = dealer_id);

-- Policy: Only service role can insert/update (performed via server actions)
-- No INSERT/UPDATE policy for public/authenticated users to prevent fraud.
