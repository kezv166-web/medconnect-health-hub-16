-- Add foreign key constraint from medicine_schedules to patient_profiles
ALTER TABLE medicine_schedules
ADD CONSTRAINT medicine_schedules_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES patient_profiles(id) 
ON DELETE CASCADE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_medicine_schedules_patient_id 
ON medicine_schedules(patient_id);