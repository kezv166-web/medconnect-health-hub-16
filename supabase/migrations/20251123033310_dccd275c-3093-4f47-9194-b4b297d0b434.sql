-- Add food_instruction column to medicines table
ALTER TABLE public.medicines 
ADD COLUMN food_instruction food_instruction_enum DEFAULT 'after_food'::food_instruction_enum;