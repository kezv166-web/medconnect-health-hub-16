-- Add scheduled_time column to medicine_schedules table
ALTER TABLE medicine_schedules 
ADD COLUMN scheduled_time TIME;

-- Set default times based on existing time_slot for backward compatibility
UPDATE medicine_schedules
SET scheduled_time = CASE 
  WHEN time_slot = 'morning' THEN '08:00:00'::time
  WHEN time_slot = 'afternoon' THEN '14:00:00'::time
  WHEN time_slot = 'evening' THEN '18:00:00'::time
  WHEN time_slot = 'night' THEN '21:00:00'::time
END
WHERE scheduled_time IS NULL;

-- Create notification logs table for tracking
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  medicine_schedule_id UUID REFERENCES medicine_schedules(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on notification_logs
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification logs
CREATE POLICY "Users can view their own notification logs"
ON notification_logs
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notification logs
CREATE POLICY "System can insert notification logs"
ON notification_logs
FOR INSERT
WITH CHECK (true);