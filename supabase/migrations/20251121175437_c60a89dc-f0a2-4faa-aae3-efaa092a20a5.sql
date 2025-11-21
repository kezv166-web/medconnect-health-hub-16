-- Create enum for time slots
CREATE TYPE time_slot_enum AS ENUM ('morning', 'afternoon', 'evening', 'night');

-- Create enum for food instruction
CREATE TYPE food_instruction_enum AS ENUM ('before_food', 'after_food');

-- Create enum for intake status
CREATE TYPE intake_status_enum AS ENUM ('taken', 'missed');

-- Create medicine_schedules table
CREATE TABLE public.medicine_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  time_slot time_slot_enum NOT NULL,
  instruction food_instruction_enum NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medicine_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for medicine_schedules
CREATE POLICY "Users can view their own schedules"
ON public.medicine_schedules
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM patient_profiles
  WHERE patient_profiles.id = medicine_schedules.patient_id
  AND patient_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create their own schedules"
ON public.medicine_schedules
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM patient_profiles
  WHERE patient_profiles.id = medicine_schedules.patient_id
  AND patient_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own schedules"
ON public.medicine_schedules
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM patient_profiles
  WHERE patient_profiles.id = medicine_schedules.patient_id
  AND patient_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own schedules"
ON public.medicine_schedules
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM patient_profiles
  WHERE patient_profiles.id = medicine_schedules.patient_id
  AND patient_profiles.user_id = auth.uid()
));

-- Create intake_logs table
CREATE TABLE public.intake_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.medicine_schedules(id) ON DELETE CASCADE,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status intake_status_enum NOT NULL DEFAULT 'taken',
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.intake_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for intake_logs
CREATE POLICY "Users can view their own intake logs"
ON public.intake_logs
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM medicine_schedules
  JOIN patient_profiles ON patient_profiles.id = medicine_schedules.patient_id
  WHERE medicine_schedules.id = intake_logs.schedule_id
  AND patient_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create their own intake logs"
ON public.intake_logs
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM medicine_schedules
  JOIN patient_profiles ON patient_profiles.id = medicine_schedules.patient_id
  WHERE medicine_schedules.id = intake_logs.schedule_id
  AND patient_profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own intake logs"
ON public.intake_logs
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM medicine_schedules
  JOIN patient_profiles ON patient_profiles.id = medicine_schedules.patient_id
  WHERE medicine_schedules.id = intake_logs.schedule_id
  AND patient_profiles.user_id = auth.uid()
));

-- Create trigger for medicine_schedules updated_at
CREATE TRIGGER update_medicine_schedules_updated_at
BEFORE UPDATE ON public.medicine_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_medicine_schedules_patient_id ON public.medicine_schedules(patient_id);
CREATE INDEX idx_intake_logs_schedule_id ON public.intake_logs(schedule_id);
CREATE INDEX idx_intake_logs_log_date ON public.intake_logs(log_date);