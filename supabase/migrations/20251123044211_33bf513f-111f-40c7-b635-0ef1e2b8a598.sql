-- Add notification preferences to patient_profiles table
ALTER TABLE public.patient_profiles 
ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_email_sent_date date;