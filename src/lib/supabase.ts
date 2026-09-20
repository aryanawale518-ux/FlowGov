import { createClient } from '@supabase/supabase-js';

// Supabase project credentials provided by user
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://qptakshpxktkyfsihxcy.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_euneVJEU1VF50nT_uScLqg_sIMNpdN1';

export const SUPABASE_PROJECT_ID = 'qptakshpxktkyfsihxcy';

// Client instance for client-side Auth and queries
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// SQL schema for Supabase Postgres tables
export const SUPABASE_SCHEMA_SQL = `-- FlowGov Postgres Schema for Supabase
-- Run this in your Supabase SQL Editor (Project: qptakshpxktkyfsihxcy)

-- 1. Files table
CREATE TABLE IF NOT EXISTS public.government_files (
  id TEXT PRIMARY KEY,
  file_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  department_id TEXT,
  department_name TEXT,
  workflow_template_id TEXT,
  workflow_template_name TEXT,
  status TEXT,
  priority TEXT,
  sla_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id TEXT,
  created_by_user_name TEXT,
  current_stage_id TEXT,
  current_stage_name TEXT,
  loops_count INTEGER DEFAULT 0,
  total_duration_hours NUMERIC DEFAULT 0,
  expected_total_duration_hours NUMERIC DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb
);

-- 2. Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  file_id TEXT,
  file_number TEXT,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.government_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Policies with idempotency guards
DROP POLICY IF EXISTS "Allow public read on government_files" ON public.government_files;
DROP POLICY IF EXISTS "Allow public insert on government_files" ON public.government_files;
DROP POLICY IF EXISTS "Allow public update on government_files" ON public.government_files;

CREATE POLICY "Allow public read on government_files" ON public.government_files FOR SELECT USING (true);
CREATE POLICY "Allow public insert on government_files" ON public.government_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on government_files" ON public.government_files FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public insert on audit_logs" ON public.audit_logs;

CREATE POLICY "Allow public read on audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
`;

