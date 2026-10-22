-- =========================================================================
-- WorkSphere AI — 50 Service Categories & 250 Services Shared Catalogue
-- =========================================================================

-- 1. Create service_categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  group_name text NOT NULL,
  icon text,
  description text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 2. Alter services table to link to service_categories
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- 3. Alter worker_services table
ALTER TABLE public.worker_services ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id) ON DELETE CASCADE;
ALTER TABLE public.worker_services ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 4. Alter bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS category_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS service_name text;

-- 5. Create booking_status_history table
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- 7. Policies for service_categories (Readable by all, manageable by admins)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_categories' AND policyname = 'Anyone can view service categories') THEN
    CREATE POLICY "Anyone can view service categories" ON public.service_categories FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Anyone can view services') THEN
    CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'worker_services' AND policyname = 'Anyone can view worker services') THEN
    CREATE POLICY "Anyone can view worker services" ON public.worker_services FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'worker_services' AND policyname = 'Workers can manage their own services') THEN
    CREATE POLICY "Workers can manage their own services" ON public.worker_services
      FOR ALL TO authenticated
      USING (worker_id = auth.uid())
      WITH CHECK (worker_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_status_history' AND policyname = 'Participants can view booking status history') THEN
    CREATE POLICY "Participants can view booking status history" ON public.booking_status_history
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.bookings b
          WHERE b.id = booking_id
            AND (b.customer_id = auth.uid() OR b.worker_id = auth.uid() OR public.has_role('admin'))
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'booking_status_history' AND policyname = 'Authenticated users can record status changes') THEN
    CREATE POLICY "Authenticated users can record status changes" ON public.booking_status_history
      FOR INSERT TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
