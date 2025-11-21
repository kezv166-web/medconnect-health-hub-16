-- Create patient_profiles table for storing patient personal and doctor details
CREATE TABLE public.patient_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER NOT NULL,
  primary_health_condition TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  hospital_clinic_name TEXT NOT NULL,
  clinic_address TEXT NOT NULL,
  clinic_contact_number TEXT NOT NULL,
  last_consultation_date DATE NOT NULL,
  next_follow_up_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create medicines table for storing patient medications
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  timings TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  quantity_remaining INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Create policies for patient_profiles
CREATE POLICY "Users can view their own profile" 
ON public.patient_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.patient_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.patient_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for medicines
CREATE POLICY "Users can view their own medicines" 
ON public.medicines 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_profiles 
    WHERE patient_profiles.id = medicines.patient_id 
    AND patient_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own medicines" 
ON public.medicines 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.patient_profiles 
    WHERE patient_profiles.id = medicines.patient_id 
    AND patient_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own medicines" 
ON public.medicines 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_profiles 
    WHERE patient_profiles.id = medicines.patient_id 
    AND patient_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own medicines" 
ON public.medicines 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_profiles 
    WHERE patient_profiles.id = medicines.patient_id 
    AND patient_profiles.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_patient_profiles_updated_at
BEFORE UPDATE ON public.patient_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medicines_updated_at
BEFORE UPDATE ON public.medicines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();