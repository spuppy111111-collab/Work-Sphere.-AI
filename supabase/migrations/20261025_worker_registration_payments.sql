-- =========================================================================
-- WorkSphere AI — Worker Registration Payment System (Security Hardened)
-- Migration: 20261025_worker_registration_payments.sql
-- One-time Fee: ₹25 (2500 paise)
-- UPI ID: 6281376739@fam (FamX)
-- =========================================================================

-- 1. HARDENED ADMIN CHECK FUNCTION
-- Enforces: Authenticated user MUST be 'ssunny143870@gmail.com'
-- AND hold the 'admin' role in public.user_roles or public.profiles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
        AND lower(trim(email)) = 'ssunny143870@gmail.com'
    )
    AND (
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
      )
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- 2. CREATE WORKER REGISTRATION PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.worker_registration_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_paise integer NOT NULL DEFAULT 2500 CHECK (amount_paise = 2500),
  currency text NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  payment_method text NOT NULL DEFAULT 'manual_upi_famx' CHECK (payment_method = 'manual_upi_famx'),
  upi_id text NOT NULL DEFAULT '6281376739@fam' CHECK (upi_id = '6281376739@fam'),
  transaction_reference text NOT NULL CHECK (length(trim(transaction_reference)) >= 6),
  receipt_url text,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
  rejection_reason text,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT worker_registration_payments_worker_id_key UNIQUE (worker_id),
  CONSTRAINT worker_registration_payments_transaction_ref_key UNIQUE (transaction_reference)
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_wrp_worker_id ON public.worker_registration_payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_wrp_status ON public.worker_registration_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_wrp_ref ON public.worker_registration_payments(transaction_reference);

-- 4. VALIDATION & SECURITY TRIGGER FOR UPDATES
-- Prevents workers from altering protected columns (worker_id, amount, currency, method, upi_id).
-- Enforces valid state transitions and metadata integrity for both workers and admins.
CREATE OR REPLACE FUNCTION public.validate_worker_payment_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- CASE A: Executed by Authorized Administrator
  IF public.is_admin() THEN
    -- Admin cannot reassign worker_id or change fee parameters
    IF NEW.worker_id IS DISTINCT FROM OLD.worker_id THEN
      RAISE EXCEPTION 'Cannot modify worker_id of payment record' USING errcode = '42501';
    END IF;
    IF NEW.amount_paise IS DISTINCT FROM OLD.amount_paise OR
       NEW.currency IS DISTINCT FROM OLD.currency OR
       NEW.payment_method IS DISTINCT FROM OLD.payment_method OR
       NEW.upi_id IS DISTINCT FROM OLD.upi_id OR
       NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Cannot modify fixed payment fee parameters or creation timestamp' USING errcode = '42501';
    END IF;

    -- Enforce valid admin payment-status transitions
    -- Verified payments cannot be reverted to pending status without an explicitly designed workflow
    IF OLD.payment_status = 'verified' AND NEW.payment_status = 'pending' THEN
      RAISE EXCEPTION 'Verified payments cannot be reverted to pending status' USING errcode = '22023';
    END IF;

    IF NEW.payment_status NOT IN ('verified', 'rejected') THEN
      RAISE EXCEPTION 'Admin may only transition payment to verified or rejected' USING errcode = '22023';
    END IF;

    -- When admin sets verified: ALWAYS overwrite verified_at with now() and verified_by with auth.uid()
    -- Do not preserve caller-supplied verification metadata
    IF NEW.payment_status = 'verified' THEN
      NEW.verified_at := now();
      NEW.verified_by := auth.uid();
      NEW.rejection_reason := NULL;
    -- When admin sets rejected: ALWAYS set verified_at := NULL, verified_by := auth.uid(), and preserve supplied rejection reason
    ELSIF NEW.payment_status = 'rejected' THEN
      NEW.verified_at := NULL;
      NEW.verified_by := auth.uid();
      NEW.rejection_reason := coalesce(nullif(trim(NEW.rejection_reason), ''), 'Transaction reference could not be verified in UPI account.');
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  -- CASE B: Executed by Authenticated Worker (Resubmission)
  -- 1. Can only update when current status is 'rejected'
  IF OLD.payment_status IS DISTINCT FROM 'rejected' THEN
    RAISE EXCEPTION 'Workers may only resubmit when payment status is rejected' USING errcode = '42501';
  END IF;

  -- 2. Worker can only update their own record
  IF OLD.worker_id IS DISTINCT FROM auth.uid() OR NEW.worker_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized payment record access' USING errcode = '42501';
  END IF;

  -- 3. Resubmission must set status back to 'pending'
  IF NEW.payment_status IS DISTINCT FROM 'pending' THEN
    RAISE EXCEPTION 'Worker resubmission must set status to pending' USING errcode = '42501';
  END IF;

  -- 4. Protected immutable fields MUST NOT be altered
  IF NEW.id IS DISTINCT FROM OLD.id OR
     NEW.amount_paise IS DISTINCT FROM OLD.amount_paise OR
     NEW.currency IS DISTINCT FROM OLD.currency OR
     NEW.payment_method IS DISTINCT FROM OLD.payment_method OR
     NEW.upi_id IS DISTINCT FROM OLD.upi_id OR
     NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Cannot alter protected payment parameters' USING errcode = '42501';
  END IF;

  -- 5. Anti-spoofing: Admin verification fields must be null upon worker resubmission
  IF NEW.verified_at IS NOT NULL OR NEW.verified_by IS NOT NULL OR NEW.rejection_reason IS NOT NULL THEN
    RAISE EXCEPTION 'Workers cannot set verification metadata or rejection reason' USING errcode = '42501';
  END IF;

  -- 6. Must provide a valid transaction reference
  IF NEW.transaction_reference IS NULL OR length(trim(NEW.transaction_reference)) < 6 THEN
    RAISE EXCEPTION 'Valid transaction reference (minimum 6 characters) is required' USING errcode = '23514';
  END IF;

  -- Reset metadata explicitly and update timestamp
  NEW.verified_at := NULL;
  NEW.verified_by := NULL;
  NEW.rejection_reason := NULL;
  NEW.updated_at := now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_worker_payment_update ON public.worker_registration_payments;
CREATE TRIGGER trg_validate_worker_payment_update
  BEFORE UPDATE ON public.worker_registration_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_worker_payment_update();

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.worker_registration_payments ENABLE ROW LEVEL SECURITY;

-- Clean up any conflicting earlier policy names
DROP POLICY IF EXISTS "worker_payments_select_policy" ON public.worker_registration_payments;
DROP POLICY IF EXISTS "worker_payments_insert_policy" ON public.worker_registration_payments;
DROP POLICY IF EXISTS "worker_payments_update_worker_policy" ON public.worker_registration_payments;
DROP POLICY IF EXISTS "worker_payments_admin_update_policy" ON public.worker_registration_payments;
DROP POLICY IF EXISTS "wrp_select_policy" ON public.worker_registration_payments;
DROP POLICY IF EXISTS "wrp_worker_insert_policy" ON public.worker_registration_payments;
DROP POLICY IF EXISTS "wrp_worker_resubmit_policy" ON public.worker_registration_payments;
DROP POLICY IF EXISTS "wrp_admin_update_policy" ON public.worker_registration_payments;

-- Policy A: SELECT — Worker views own record; Admin views all records
CREATE POLICY "wrp_select_policy" ON public.worker_registration_payments
  FOR SELECT
  TO authenticated
  USING (
    worker_id = auth.uid() OR public.is_admin()
  );

-- Policy B: INSERT — Workers can only submit initial pending fee payment
-- Enforces: worker_id must match auth.uid(), status must be 'pending',
-- fee must be ₹25 (2500 paise), and verification fields MUST be null.
CREATE POLICY "wrp_worker_insert_policy" ON public.worker_registration_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id = auth.uid()
    AND payment_status = 'pending'
    AND amount_paise = 2500
    AND currency = 'INR'
    AND payment_method = 'manual_upi_famx'
    AND upi_id = '6281376739@fam'
    AND verified_at IS NULL
    AND verified_by IS NULL
    AND rejection_reason IS NULL
  );

-- Policy C: UPDATE — Workers can resubmit ONLY if status is 'rejected'
-- Row visibility is restricted to the worker's own rejected row.
CREATE POLICY "wrp_worker_resubmit_policy" ON public.worker_registration_payments
  FOR UPDATE
  TO authenticated
  USING (
    worker_id = auth.uid() AND payment_status = 'rejected'
  )
  WITH CHECK (
    worker_id = auth.uid()
    AND payment_status = 'pending'
    AND amount_paise = 2500
    AND currency = 'INR'
    AND payment_method = 'manual_upi_famx'
    AND upi_id = '6281376739@fam'
    AND verified_at IS NULL
    AND verified_by IS NULL
    AND rejection_reason IS NULL
  );

-- Policy D: UPDATE — Only authorized Admin can verify or reject payments
CREATE POLICY "wrp_admin_update_policy" ON public.worker_registration_payments
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. PERMISSIONS (Strict: authenticated only, zero anon access, no DELETE)
REVOKE ALL ON public.worker_registration_payments FROM anon;
REVOKE DELETE ON public.worker_registration_payments FROM authenticated;
GRANT SELECT, INSERT, UPDATE ON public.worker_registration_payments TO authenticated;
