-- Add time and period columns to medicines table
ALTER TABLE public.medicines 
ADD COLUMN time text,
ADD COLUMN period text CHECK (period IN ('AM', 'PM'));