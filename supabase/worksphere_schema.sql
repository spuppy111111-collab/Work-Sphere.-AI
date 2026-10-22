-- =========================================================================
-- WorkSphere AI — Complete Normalized PostgreSQL Schema & RLS Policies
-- Pilot Launch: Guntur, Andhra Pradesh, India
-- Tagline: “Every Skill. Every Job. One Trusted Network.”
-- =========================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Clean drop if rebuilding (comment out in production)
-- drop schema if exists public cascade; create schema public;

-- 1. PROFILES (Base user account tied to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  phone text check (phone ~ '^\+?[0-9]{10,15}$'),
  full_name text not null default '',
  role text not null check (role in ('admin', 'customer', 'worker', 'business')),
  avatar_url text,
  locality text default 'Guntur',
  preferred_language text default 'en' check (preferred_language in ('en', 'te')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. SERVICE CATEGORIES
create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_te text not null,
  description text default '',
  icon_name text default 'Wrench',
  base_visit_charge numeric(10,2) default 199.00,
  active boolean default true,
  created_at timestamptz default now()
);

-- 3. SERVICE AREAS (Guntur Localities)
create table if not exists public.service_areas (
  id uuid primary key default gen_random_uuid(),
  locality_name text unique not null,
  pincode text check (pincode ~ '^[0-9]{6}$'),
  city text not null default 'Guntur',
  state text not null default 'Andhra Pradesh',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. WORKER PROFILES
create table if not exists public.worker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.profiles(id) on delete cascade,
  experience_years integer default 1 check (experience_years >= 0),
  bio text default '',
  service_area_id uuid references public.service_areas(id),
  hourly_rate numeric(10,2) default 250.00,
  visit_charge numeric(10,2) default 150.00,
  is_available boolean default true,
  phone_verified boolean default false,
  id_verified boolean default false,
  verification_status text default 'pending' check (verification_status in ('pending', 'under_review', 'verified', 'rejected')),
  rating numeric(3,2) default 5.00 check (rating between 1.00 and 5.00),
  total_reviews integer default 0,
  completed_jobs integer default 0,
  response_time_minutes integer default 15,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. WORKER SKILLS (Many-to-many relationship)
create table if not exists public.worker_skills (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.worker_profiles(id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete cascade,
  skill_title text not null,
  years_experience integer default 2,
  is_primary boolean default false,
  unique(worker_id, category_id, skill_title)
);

-- 6. WORKER VERIFICATION RECORDS
create table if not exists public.worker_verification_records (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references public.worker_profiles(id) on delete cascade,
  doc_type text not null check (doc_type in ('aadhaar', 'pan', 'driving_license', 'trade_certificate')),
  doc_number_masked text,
  storage_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  review_notes text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz
);

-- 7. BUSINESS ACCOUNTS
create table if not exists public.business_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  gstin text,
  address text not null,
  locality text not null default 'Guntur',
  phone text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- 8. BUSINESS MEMBERS
create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_accounts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text default 'manager' check (member_role in ('owner', 'manager', 'accountant')),
  created_at timestamptz default now(),
  unique(business_id, user_id)
);

-- 9. JOB REQUESTS
create table if not exists public.job_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.business_accounts(id) on delete set null,
  category_id uuid references public.service_categories(id),
  locality text not null,
  pincode text,
  address text not null,
  problem_description text not null,
  problem_description_te text,
  ai_suggested_category_id uuid references public.service_categories(id),
  ai_confidence_score numeric(4,3) default 0.950,
  urgency text not null default 'normal' check (urgency in ('low', 'normal', 'urgent', 'emergency')),
  preferred_date date,
  preferred_time_slot text default 'morning' check (preferred_time_slot in ('morning', 'afternoon', 'evening', 'anytime')),
  budget_estimate numeric(10,2),
  status text not null default 'Requested' 
    check (status in ('Requested', 'Quoted', 'Accepted', 'Scheduled', 'In Progress', 'Completed', 'Confirmed', 'Cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. JOB PHOTOS
create table if not exists public.job_photos (
  id uuid primary key default gen_random_uuid(),
  job_request_id uuid not null references public.job_requests(id) on delete cascade,
  photo_url text not null,
  is_completion_proof boolean default false,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- 11. QUOTES
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  job_request_id uuid not null references public.job_requests(id) on delete cascade,
  worker_id uuid not null references public.worker_profiles(id) on delete cascade,
  labour_charge numeric(10,2) not null check (labour_charge >= 0),
  material_estimate numeric(10,2) default 0.00 check (material_estimate >= 0),
  total_quote numeric(10,2) not null check (total_quote >= 0),
  estimated_hours numeric(4,1) default 2.0,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired')),
  created_at timestamptz default now(),
  valid_until timestamptz default (now() + interval '48 hours')
);

-- 12. BOOKINGS
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text unique not null default ('WS-' || substring(gen_random_uuid()::text from 1 for 8)),
  job_request_id uuid not null references public.job_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  worker_id uuid not null references public.worker_profiles(id),
  business_id uuid references public.business_accounts(id) on delete set null,
  quote_id uuid references public.quotes(id),
  status text not null default 'Scheduled'
    check (status in ('Requested', 'Quoted', 'Accepted', 'Scheduled', 'In Progress', 'Completed', 'Confirmed', 'Cancelled', 'Disputed')),
  scheduled_start timestamptz,
  work_started_at timestamptz,
  work_completed_at timestamptz,
  final_amount numeric(10,2),
  payment_method text default 'cash_or_upi' check (payment_method in ('cash_or_upi', 'online', 'business_invoice')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 13. BOOKING STATUS HISTORY (Audit Trail)
create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id),
  reason text,
  created_at timestamptz default now()
);

-- 14. REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique not null references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  worker_id uuid not null references public.worker_profiles(id),
  rating integer not null check (rating between 1 and 5),
  review_text text,
  work_quality_rating integer check (work_quality_rating between 1 and 5),
  punctuality_rating integer check (punctuality_rating between 1 and 5),
  politeness_rating integer check (politeness_rating between 1 and 5),
  is_moderated boolean default false,
  is_flagged boolean default false,
  created_at timestamptz default now()
);

-- 15. COMPLAINTS & DISPUTES
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null default ('TKT-' || substring(gen_random_uuid()::text from 1 for 6)),
  booking_id uuid references public.bookings(id) on delete cascade,
  complainant_id uuid not null references public.profiles(id),
  respondent_id uuid references public.profiles(id),
  category text not null check (category in ('quality_of_work', 'pricing_dispute', 'delay_no_show', 'unprofessional_behavior', 'damage', 'other')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  description text not null,
  status text not null default 'open' check (status in ('open', 'under_investigation', 'resolved', 'closed')),
  assigned_admin_id uuid references public.profiles(id),
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz default now()
);

-- 16. RECURRING MAINTENANCE SCHEDULES (For Business Accounts)
create table if not exists public.maintenance_schedules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_accounts(id) on delete cascade,
  title text not null,
  category_id uuid references public.service_categories(id),
  frequency text not null default 'monthly' check (frequency in ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  assigned_worker_id uuid references public.worker_profiles(id),
  next_due_date date not null,
  budget_per_cycle numeric(10,2) default 0.00,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 17. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  action_url text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- =========================================================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_worker_profiles_available on public.worker_profiles(is_available, verification_status);
create index if not exists idx_job_requests_customer on public.job_requests(customer_id, status);
create index if not exists idx_job_requests_locality on public.job_requests(locality);
create index if not exists idx_bookings_worker on public.bookings(worker_id, status);
create index if not exists idx_bookings_customer on public.bookings(customer_id, status);
create index if not exists idx_reviews_worker on public.reviews(worker_id);
create index if not exists idx_complaints_status on public.complaints(status, priority);

-- =========================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- =========================================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.update_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.update_timestamp();

create trigger trg_job_requests_updated before update on public.job_requests
  for each row execute function public.update_timestamp();

create trigger trg_bookings_updated before update on public.bookings
  for each row execute function public.update_timestamp();

-- Automatic profile sync from Supabase Auth signups
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, phone, full_name, role, locality)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', null),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(new.raw_user_meta_data->>'locality', 'Guntur')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = coalesce(excluded.role, public.profiles.role);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.service_categories enable row level security;
alter table public.service_areas enable row level security;
alter table public.worker_profiles enable row level security;
alter table public.worker_skills enable row level security;
alter table public.worker_verification_records enable row level security;
alter table public.business_accounts enable row level security;
alter table public.job_requests enable row level security;
alter table public.job_photos enable row level security;
alter table public.quotes enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.complaints enable row level security;
alter table public.maintenance_schedules enable row level security;
alter table public.notifications enable row level security;

-- Profiles: self read/insert/update or admin
create policy "profiles_self_read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_self_insert" on public.profiles for insert with check (id = auth.uid() or public.is_admin());
create policy "profiles_self_update" on public.profiles for update using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_all" on public.profiles for all using (public.is_admin());


-- Categories & Areas: public read, admin manage
create policy "categories_public_read" on public.service_categories for select using (true);
create policy "categories_admin_manage" on public.service_categories for all using (public.is_admin());
create policy "areas_public_read" on public.service_areas for select using (true);
create policy "areas_admin_manage" on public.service_areas for all using (public.is_admin());

-- Worker Profiles: public read active, self edit, admin manage
create policy "workers_public_read" on public.worker_profiles for select using (true);
create policy "workers_self_update" on public.worker_profiles for update using (user_id = auth.uid() or public.is_admin());

-- Job Requests: customers see own, workers see relevant requested, admin sees all
create policy "jobs_customer_crud" on public.job_requests for all using (customer_id = auth.uid() or public.is_admin());
create policy "jobs_worker_read" on public.job_requests for select using (status = 'Requested' or public.is_admin());

-- Bookings: participants only
create policy "bookings_participants_read" on public.bookings for select using (
  customer_id = auth.uid() 
  or worker_id in (select id from public.worker_profiles where user_id = auth.uid()) 
  or public.is_admin()
);
create policy "bookings_admin_all" on public.bookings for all using (public.is_admin());

-- Complaints: complainant, respondent or admin
create policy "complaints_parties_read" on public.complaints for select using (
  complainant_id = auth.uid() or respondent_id = auth.uid() or public.is_admin()
);
create policy "complaints_admin_all" on public.complaints for all using (public.is_admin());

-- Reviews: public read, customer create
create policy "reviews_public_read" on public.reviews for select using (true);
create policy "reviews_customer_insert" on public.reviews for insert with check (customer_id = auth.uid());

-- =========================================================================
-- SEED DATA: GUNTUR PILOT LAUNCH
-- =========================================================================

-- Seed Localities
insert into public.service_areas (locality_name, pincode, city, state) values
  ('Brodipet', '522002', 'Guntur', 'Andhra Pradesh'),
  ('Arundelpet', '522002', 'Guntur', 'Andhra Pradesh'),
  ('Lakshmipuram', '522007', 'Guntur', 'Andhra Pradesh'),
  ('Pattabhipuram', '522006', 'Guntur', 'Andhra Pradesh'),
  ('Koretipadu', '522007', 'Guntur', 'Andhra Pradesh'),
  ('Vidyanagar', '522007', 'Guntur', 'Andhra Pradesh'),
  ('Syamala Nagar', '522006', 'Guntur', 'Andhra Pradesh'),
  ('Gujanagundla', '522006', 'Guntur', 'Andhra Pradesh'),
  ('Amaravathi Road', '522034', 'Guntur', 'Andhra Pradesh'),
  ('Old Guntur', '522001', 'Guntur', 'Andhra Pradesh')
on conflict (locality_name) do nothing;

-- Seed Service Categories
insert into public.service_categories (slug, name_en, name_te, description, icon_name, base_visit_charge) values
  ('wood-polishing', 'Wood Polish & Carpentry', 'వుడ్ పాలిషింగ్ & వడ్రంగం', 'Teakwood, rosewood polishing, doors, wardrobes & luxury finishes', 'Hammer', 299.00),
  ('plumbing', 'Plumbing & Pipe Repair', 'ప్లంబింగ్ & పైప్ రిపేర్', 'Pipe leaks, taps, bathroom fittings, motor installation', 'Droplet', 199.00),
  ('electrical', 'Electrical & Wiring', 'ఎలక్ట్రికల్ & వైరింగ్', 'Short circuits, fans, lights, MCB boards, switchboard repair', 'Zap', 199.00),
  ('ac-repair', 'AC & Appliance Repair', 'ఏసీ & ఉపకరణాల రిపేర్', 'AC servicing, gas filling, refrigerator, washing machine repair', 'Airplay', 349.00),
  ('masonry-painting', 'Painting & Wall Care', 'పెయింటింగ్ & వాల్ కేర్', 'Interior/exterior emulsions, primer, putty, waterproofing', 'Paintbrush', 399.00),
  ('cleaning', 'Deep Cleaning & Sanitization', 'డీప్ క్లీనింగ్ & శానిటైజేషన్', 'Kitchen, bathroom, sofa & full house deep cleaning', 'Sparkles', 499.00)
on conflict (slug) do nothing;
