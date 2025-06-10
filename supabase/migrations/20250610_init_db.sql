-- Create auth schema if it doesn't exist (usually created by Supabase)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create public schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Set up users table to store additional user profile information
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up requests table for subtitle requests
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  video_link TEXT NOT NULL,
  source_language TEXT NOT NULL,
  context_tones TEXT[] DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'submitted',
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  srt_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id)
);

-- Set up subscriptions table for tracking user plans and usage
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  credits_used INTEGER DEFAULT 0,
  credits_total INTEGER NOT NULL,
  payment_method TEXT,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up payments table for tracking payment history
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  order_id TEXT,
  transaction_id TEXT
);

-- Row level security policies

-- Enable row level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users policy - can read/write own data only
CREATE POLICY user_own_access ON public.users
  FOR ALL
  USING (auth.uid() = id);

-- Requests policy - can read/write own data only
CREATE POLICY requests_select_own ON public.requests
  FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM public.users WHERE id = auth.uid()));

CREATE POLICY requests_insert_own ON public.requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Subscriptions policy - can read own subscriptions only
CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Payments policy - can read own payments only
CREATE POLICY payments_select_own ON public.payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_modified
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_requests_modified
BEFORE UPDATE ON public.requests
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_subscriptions_modified
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_payments_modified
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Add index to improve query performance
CREATE INDEX IF NOT EXISTS idx_requests_email ON public.requests(email);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
