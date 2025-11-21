-- Add blood_group column to patient_profiles table
ALTER TABLE patient_profiles 
ADD COLUMN IF NOT EXISTS blood_group text;

-- Add avatar_url column for profile image
ALTER TABLE patient_profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;