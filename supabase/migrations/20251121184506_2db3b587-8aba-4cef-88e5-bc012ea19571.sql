-- Create table for registered hospitals/clinics
CREATE TABLE public.hospital_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  operating_hours TEXT NOT NULL,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  oxygen_cylinders_available INTEGER DEFAULT 0,
  oxygen_cylinders_total INTEGER DEFAULT 0,
  icu_beds_available INTEGER DEFAULT 0,
  icu_beds_total INTEGER DEFAULT 0,
  blood_bank_types TEXT[] DEFAULT '{}',
  pharmacy_open BOOLEAN DEFAULT false,
  latitude NUMERIC(10, 8) DEFAULT 28.6139,
  longitude NUMERIC(11, 8) DEFAULT 77.2090,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for hospital profiles
CREATE POLICY "Hospitals can create their own profile"
ON public.hospital_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hospitals can update their own profile"
ON public.hospital_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Hospitals can view their own profile"
ON public.hospital_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all hospital profiles"
ON public.hospital_profiles
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_hospital_profiles_updated_at
BEFORE UPDATE ON public.hospital_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();