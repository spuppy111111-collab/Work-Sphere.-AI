-- =========================================================================
-- WorkSphere AI — Customer Booking & Worker Acceptance Migration
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query
-- =========================================================================

-- 1. Remove obsolete fixed-price trigger from bookings
DROP TRIGGER IF EXISTS booking_price_before_insert ON public.bookings;

-- 2. Update bookings table columns to support unassigned requests & no fixed prices
ALTER TABLE public.bookings ALTER COLUMN worker_id DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN service_id DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN total_price DROP NOT NULL;
ALTER TABLE public.bookings ALTER COLUMN total_price SET DEFAULT NULL;

-- 3. Add necessary booking metadata columns
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS assigned_worker_id uuid REFERENCES public.worker_profiles(user_id);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_category text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS locality text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS preferred_time text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS photo_url text;

-- 4. Add worker skills, service areas, and availability to worker_profiles
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS service_areas text[] DEFAULT '{}';
ALTER TABLE public.worker_profiles ADD COLUMN IF NOT EXISTS availability text DEFAULT 'Available';

-- 5. Create worker_declined_bookings table (for worker-specific declines)
CREATE TABLE IF NOT EXISTS public.worker_declined_bookings (
  worker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  declined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (worker_id, booking_id)
);

ALTER TABLE public.worker_declined_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers manage own declined bookings" ON public.worker_declined_bookings;
CREATE POLICY "Workers manage own declined bookings" ON public.worker_declined_bookings
  FOR ALL TO authenticated
  USING (worker_id = auth.uid())
  WITH CHECK (worker_id = auth.uid());

-- 6. Atomic Worker Accept Request Function (Prevents double booking)
CREATE OR REPLACE FUNCTION public.accept_booking(p_booking_id uuid)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_worker_id uuid := auth.uid();
  v_role text;
  v_booking public.bookings;
BEGIN
  -- Require authenticated user
  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING errcode = '28000';
  END IF;

  -- Verify worker role in user_roles
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = v_worker_id;

  IF v_role IS DISTINCT FROM 'worker' AND NOT public.has_role('worker') THEN
    RAISE EXCEPTION 'Only registered workers can accept bookings'
      USING errcode = '42501';
  END IF;

  -- Atomic compare-and-set: only one worker can claim a pending unassigned booking
  UPDATE public.bookings b
  SET worker_id = v_worker_id,
      assigned_worker_id = v_worker_id,
      status = 'Accepted',
      updated_at = now()
  WHERE b.id = p_booking_id
    AND lower(b.status) = 'pending'
    AND (b.worker_id IS NULL OR b.assigned_worker_id IS NULL)
  RETURNING b.* INTO v_booking;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'This booking has already been accepted or is no longer available.'
      USING errcode = 'P0001';
  END IF;

  -- Send notification to customer
  INSERT INTO public.notifications (user_id, title, body, booking_id)
  VALUES (
    v_booking.customer_id,
    'Booking Accepted',
    'A verified artisan has accepted your service request. They will contact you to coordinate visit details.',
    v_booking.id
  );

  RETURN v_booking;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_booking(uuid) FROM public;
REVOKE ALL ON FUNCTION public.accept_booking(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.accept_booking(uuid) TO authenticated;

-- 7. Decline Request Function (Does not cancel global booking)
CREATE OR REPLACE FUNCTION public.decline_booking(p_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_worker_id uuid := auth.uid();
BEGIN
  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING errcode = '28000';
  END IF;

  INSERT INTO public.worker_declined_bookings (worker_id, booking_id)
  VALUES (v_worker_id, p_booking_id)
  ON CONFLICT (worker_id, booking_id) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.decline_booking(uuid) FROM public;
REVOKE ALL ON FUNCTION public.decline_booking(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.decline_booking(uuid) TO authenticated;

-- 8. Enhanced status transition function
CREATE OR REPLACE FUNCTION public.change_booking_status(p_booking_id uuid, p_status text)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  b public.bookings%ROWTYPE;
  norm_status text := lower(replace(p_status, ' ', '_'));
  final_status text;
BEGIN
  IF norm_status = 'pending' THEN final_status := 'Pending';
  ELSIF norm_status = 'accepted' THEN final_status := 'Accepted';
  ELSIF norm_status = 'in_progress' THEN final_status := 'In Progress';
  ELSIF norm_status = 'completed' THEN final_status := 'Completed';
  ELSIF norm_status = 'cancelled' THEN final_status := 'Cancelled';
  ELSE
    RAISE EXCEPTION 'Invalid booking status: %', p_status;
  END IF;

  SELECT * INTO b
  FROM public.bookings
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF public.has_role('admin') THEN
    NULL;
  ELSIF (auth.uid() = b.worker_id OR auth.uid() = b.assigned_worker_id)
        AND public.has_role('worker') THEN
    IF NOT (
      (lower(replace(b.status, ' ', '_')) = 'accepted' AND norm_status = 'in_progress')
      OR (lower(replace(b.status, ' ', '_')) = 'in_progress' AND norm_status = 'completed')
    ) THEN
      RAISE EXCEPTION 'Invalid worker status transition';
    END IF;
  ELSIF auth.uid() = b.customer_id THEN
    IF NOT (lower(b.status) = 'pending' AND norm_status = 'cancelled') THEN
      RAISE EXCEPTION 'Customer can only cancel pending bookings';
    END IF;
  ELSE
    RAISE EXCEPTION 'Not authorized to update this booking';
  END IF;

  UPDATE public.bookings
  SET status = final_status,
      updated_at = now()
  WHERE id = p_booking_id
  RETURNING * INTO b;

  INSERT INTO public.notifications (user_id, title, body, booking_id)
  VALUES
    (b.customer_id, 'Booking updated', 'Your booking status is now ' || final_status || '.', b.id);

  IF b.assigned_worker_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, booking_id)
    VALUES (b.assigned_worker_id, 'Booking updated', 'A booking status is now ' || final_status || '.', b.id);
  END IF;

  RETURN b;
END;
$$;

-- 9. Row Level Security policies on bookings
DROP POLICY IF EXISTS "customer_create_booking" ON public.bookings;
DROP POLICY IF EXISTS "booking_read_own_or_admin" ON public.bookings;

CREATE POLICY "customer_create_booking" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() AND lower(status) = 'pending');

CREATE POLICY "booking_read_own_or_admin" ON public.bookings
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR worker_id = auth.uid()
    OR assigned_worker_id = auth.uid()
    OR has_role('admin')
    OR (has_role('worker') AND lower(status) = 'pending' AND worker_id IS NULL AND assigned_worker_id IS NULL)
  );
