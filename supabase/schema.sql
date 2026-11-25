-- ============================================================================
-- CampusFix AI – Smart Campus Maintenance Assistant (Rathinam Technical Campus)
-- Complete Supabase PostgreSQL Schema, RLS Policies, Public RPCs & Storage
-- Run this script once in Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Enable UUID extension
create extension if not exists "pgcrypto";

-- 2. Users profile table (linked to Supabase auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- 3. Complaints table
create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  complaint_id text not null unique,
  user_id uuid references public.users(id) on delete set null,
  reporter_name text,
  reporter_contact text,
  location text not null,
  building text not null,
  floor_room text not null,
  description text not null,
  image_url text,
  category text not null check (
    category in ('Electrical', 'Plumbing', 'Furniture', 'Cleaning', 'Infrastructure', 'Other')
  ),
  ai_summary text,
  ai_reasoning text,
  ai_detected_issue text,
  ai_analyzed boolean not null default false,
  suggested_priority text not null default 'Medium' check (
    suggested_priority in ('Low', 'Medium', 'High', 'Urgent')
  ),
  assigned_department text not null,
  current_status text not null default 'Submitted' check (
    current_status in ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved')
  ),
  resolution_notes text default '',
  reported_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Complaint status history (for 5-stage tracking timeline)
create table if not exists public.complaint_status_history (
  id uuid primary key default gen_random_uuid(),
  complaint_record_id uuid not null references public.complaints(id) on delete cascade,
  status text not null check (
    status in ('Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved')
  ),
  note text,
  updated_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_complaints_user_id on public.complaints(user_id);
create index if not exists idx_complaints_complaint_id on public.complaints(complaint_id);
create index if not exists idx_complaints_status on public.complaints(current_status);
create index if not exists idx_complaints_category on public.complaints(category);
create index if not exists idx_history_complaint_id on public.complaint_status_history(complaint_record_id);

-- 5. Auto-create user profile when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Helper function to check whether current authenticated user is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

-- 7. Enable Row-Level Security (RLS)
alter table public.users enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_status_history enable row level security;

-- Users table policies
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own name" on public.users;
create policy "Users can update own name"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));

-- Complaints table policies
-- Students can ONLY read their own complaints; Admins can read ALL complaints
drop policy if exists "Students read own complaints, admins read all" on public.complaints;
create policy "Students read own complaints, admins read all"
  on public.complaints for select
  using (auth.uid() = user_id or public.is_admin());

-- Anyone (authenticated student/admin or anonymous reporter) can submit a complaint,
-- while authenticated users must tag their own user_id
drop policy if exists "Submit campus complaints" on public.complaints;
create policy "Submit campus complaints"
  on public.complaints for insert
  with check (user_id is null or user_id = auth.uid());

-- Only Admins can update complaints (assign department, status, resolution notes)
drop policy if exists "Admins manage complaints" on public.complaints;
create policy "Admins manage complaints"
  on public.complaints for update
  using (public.is_admin())
  with check (public.is_admin());

-- Complaint status history policies
drop policy if exists "Read history for accessible complaints" on public.complaint_status_history;
create policy "Read history for accessible complaints"
  on public.complaint_status_history for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.complaints c
      where c.id = complaint_record_id and c.user_id = auth.uid()
    )
  );

drop policy if exists "Insert initial or admin status history" on public.complaint_status_history;
create policy "Insert initial or admin status history"
  on public.complaint_status_history for insert
  with check (
    public.is_admin()
    or status = 'Submitted'
  );

-- 8. Public Privacy-Preserving RPCs
-- Public aggregate stats for Landing Page (never leaks PII)
create or replace function public.get_public_campus_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total', count(*),
    'pending', count(*) filter (where current_status in ('Submitted', 'Under Review', 'Assigned')),
    'in_progress', count(*) filter (where current_status = 'In Progress'),
    'resolved', count(*) filter (where current_status = 'Resolved'),
    'high_priority', count(*) filter (where suggested_priority in ('High', 'Urgent'))
  )
  from public.complaints;
$$;

grant execute on function public.get_public_campus_stats() to anon, authenticated;

-- Public Complaint Tracking RPC by unique Complaint ID (strips reporter name/contact/user_id)
create or replace function public.track_complaint_public(p_complaint_id text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', c.id,
    'complaint_id', c.complaint_id,
    'location', c.location,
    'building', c.building,
    'floor_room', c.floor_room,
    'description', c.description,
    'image_url', c.image_url,
    'category', c.category,
    'ai_summary', c.ai_summary,
    'ai_reasoning', c.ai_reasoning,
    'ai_detected_issue', c.ai_detected_issue,
    'ai_analyzed', c.ai_analyzed,
    'suggested_priority', c.suggested_priority,
    'assigned_department', c.assigned_department,
    'current_status', c.current_status,
    'resolution_notes', c.resolution_notes,
    'reported_at', c.reported_at,
    'created_at', c.created_at,
    'updated_at', c.updated_at,
    'status_history', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'status', h.status,
            'note', h.note,
            'timestamp', h.created_at
          ) order by h.created_at asc
        )
        from public.complaint_status_history h
        where h.complaint_record_id = c.id
      ),
      '[]'::jsonb
    )
  )
  from public.complaints c
  where upper(c.complaint_id) = upper(trim(p_complaint_id))
  limit 1;
$$;

grant execute on function public.track_complaint_public(text) to anon, authenticated;

-- 9. Supabase Storage bucket for complaint photographs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-images',
  'complaint-images',
  true,
  5242880,
  array['image/jpeg', 'image/png']
)
on conflict (id) do nothing;

drop policy if exists "Public read complaint images" on storage.objects;
create policy "Public read complaint images"
  on storage.objects for select
  using (bucket_id = 'complaint-images');

drop policy if exists "Upload complaint images" on storage.objects;
create policy "Upload complaint images"
  on storage.objects for insert
  with check (bucket_id = 'complaint-images');

-- ============================================================================
-- To promote a registered user to Administrator, run:
--   update public.users set role = 'admin' where email = 'admin@rathinam.in';
-- ============================================================================
