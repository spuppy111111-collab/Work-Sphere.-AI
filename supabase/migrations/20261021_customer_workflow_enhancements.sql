-- =========================================================================
-- WorkSphere AI — Customer Workflow Enhancements
-- Adds payment confirmation, complaints table, and customer worker discovery
-- =========================================================================

-- 1. Add payment tracking columns to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Pending';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_confirmed_at timestamptz;

-- 2. Complaints and Disputes table for customer post-service dispute reporting
CREATE TABLE IF NOT EXISTS public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'Service Quality',
  description text NOT NULL,
  status text NOT NULL DEFAULT 'Open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can create and view own complaints" ON public.complaints;
CREATE POLICY "Customers can create and view own complaints" ON public.complaints
  FOR ALL TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view and manage all complaints" ON public.complaints;
CREATE POLICY "Admins can view and manage all complaints" ON public.complaints
  FOR ALL TO authenticated
  USING (public.has_role('admin'))
  WITH CHECK (public.has_role('admin'));

-- 3. Customer Job Completion & Payment Confirmation Function
CREATE OR REPLACE FUNCTION public.customer_confirm_completion_and_payment(
  p_booking_id uuid,
  p_payment_method text DEFAULT 'Cash on Completion',
  p_payment_reference text DEFAULT NULL
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_booking public.bookings;
  v_customer_id uuid := auth.uid();
BEGIN
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING errcode = '28000';
  END IF;

  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found' USING errcode = 'P0002';
  END IF;

  IF v_booking.customer_id <> v_customer_id AND NOT public.has_role('admin') THEN
    RAISE EXCEPTION 'Only the booking customer can confirm completion and payment' USING errcode = '42501';
  END IF;

  UPDATE public.bookings
  SET status = 'Completed',
      payment_status = 'Paid',
      payment_method = p_payment_method,
      payment_reference = COALESCE(p_payment_reference, 'WS-PAY-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
      customer_confirmed_at = now(),
      updated_at = now()
  WHERE id = p_booking_id
  RETURNING * INTO v_booking;

  -- Notify the assigned worker
  IF v_booking.worker_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, booking_id)
    VALUES (
      v_booking.worker_id,
      'Payment Confirmed',
      'The customer has verified job completion and confirmed payment via ' || p_payment_method || '.',
      v_booking.id
    );
  END IF;

  RETURN v_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.customer_confirm_completion_and_payment(uuid, text, text) FROM public;
REVOKE ALL ON FUNCTION public.customer_confirm_completion_and_payment(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.customer_confirm_completion_and_payment(uuid, text, text) TO authenticated;

-- 4. Customer read access to approved workers
DROP POLICY IF EXISTS "Anyone can view approved worker profiles" ON public.worker_profiles;
CREATE POLICY "Anyone can view approved worker profiles" ON public.worker_profiles
  FOR SELECT TO authenticated
  USING (approval_status = 'approved');

-- 5. Reviews policies: only customer of completed booking can submit review
DROP POLICY IF EXISTS "Customers create reviews for own completed bookings" ON public.reviews;
CREATE POLICY "Customers create reviews for own completed bookings" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.customer_id = auth.uid()
        AND lower(b.status) = 'completed'
    )
  );

DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (true);
