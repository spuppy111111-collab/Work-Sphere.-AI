-- =========================================================================
-- WorkSphere AI — Complete Fix for Bookings Table RLS & Columns
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Ensure all columns exist on public.bookings
ALTER TABLE public.bookings ALTER COLUMN worker_id DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN service_id DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN total_price DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN total_price SET DEFAULT 0;

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_category text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS category_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS category_id uuid;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS locality text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS preferred_time text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS assigned_worker_id uuid REFERENCES public.worker_profiles(user_id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_confirmed_at timestamptz;

-- 2. Drop obsolete constraints on status that might restrict 'Pending' or 'pending'
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

-- 3. Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 4. Clean up existing conflicting policies
DROP POLICY IF EXISTS "customer_create_booking" ON public.bookings;
DROP POLICY IF EXISTS "bookings_participants_read" ON public.bookings;
DROP POLICY IF EXISTS "booking_read_own_or_admin" ON public.bookings;
DROP POLICY IF EXISTS "bookings_admin_all" ON public.bookings;
DROP POLICY IF EXISTS "customer_cancel_booking" ON public.bookings;
DROP POLICY IF EXISTS "booking_update_participant" ON public.bookings;
DROP POLICY IF EXISTS "allow_all_bookings_authenticated" ON public.bookings;

-- 5. Create Permissive & Secure RLS Policies
-- Allow authenticated users to create their own bookings
CREATE POLICY "customer_create_booking" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- Also allow anon / guest users to create bookings
CREATE POLICY "anon_create_booking" ON public.bookings
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow customers and workers to read relevant bookings, and admin to read all
CREATE POLICY "booking_read_own_or_admin" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR worker_id = auth.uid()
    OR assigned_worker_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    OR (lower(status) = 'pending' AND (worker_id IS NULL OR assigned_worker_id IS NULL))
  );

-- Allow reading of bookings by anon if needed for confirmation
CREATE POLICY "anon_read_bookings" ON public.bookings
  FOR SELECT TO anon
  USING (true);

-- Allow participants to update bookings (status transitions, payment confirmation, cancellation)
CREATE POLICY "booking_update_participant" ON public.bookings
  FOR UPDATE TO authenticated
  USING (
    customer_id = auth.uid()
    OR worker_id = auth.uid()
    OR assigned_worker_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    customer_id = auth.uid()
    OR worker_id = auth.uid()
    OR assigned_worker_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 6. Grant access to public roles
GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO anon;
GRANT ALL ON public.bookings TO service_role;

-- 7. Enable Supabase Realtime for bookings table (safe check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
  END IF;
END $$;


