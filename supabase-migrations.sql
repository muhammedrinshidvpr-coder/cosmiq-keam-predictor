-- ============================================================
-- CosmIQ KEAM Predictor — Supabase Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the cutoffs table
CREATE TABLE IF NOT EXISTS public.cutoffs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  college_code TEXT NOT NULL,
  college_name TEXT NOT NULL,
  department   TEXT NOT NULL,
  college_type TEXT,           -- G=Government, N=Govt-Aided, S=Self-Finance
  phase        TEXT NOT NULL,
  "SM"         INTEGER,
  "EZ"         INTEGER,
  "MU"         INTEGER,
  "LA"         INTEGER,
  "DV"         INTEGER,
  "VK"         INTEGER,
  "BH"         INTEGER,
  "BX"         INTEGER,
  "KN"         INTEGER,
  "KU"         INTEGER,
  "SC"         INTEGER,
  "ST"         INTEGER,
  "EW"         INTEGER,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE public.cutoffs ENABLE ROW LEVEL SECURITY;

-- 3. Public SELECT policy (anonymous read)
CREATE POLICY "Allow public read"
  ON public.cutoffs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 4. Authenticated INSERT/UPDATE/DELETE policy (admin only)
CREATE POLICY "Allow authenticated write"
  ON public.cutoffs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_cutoffs_college_code ON public.cutoffs (college_code);
CREATE INDEX IF NOT EXISTS idx_cutoffs_department    ON public.cutoffs (department);
CREATE INDEX IF NOT EXISTS idx_cutoffs_phase         ON public.cutoffs (phase);

-- ============================================================
-- Optional: unique constraint to avoid duplicate uploads
-- ============================================================
ALTER TABLE public.cutoffs
  ADD CONSTRAINT cutoffs_unique_entry
  UNIQUE (college_code, department, phase);
