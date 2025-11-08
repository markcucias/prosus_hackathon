-- Add fields to track materials upload and email notification status
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS materials_uploaded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS materials_uploaded_at TIMESTAMPTZ;

-- Create index for querying assignments needing notification
CREATE INDEX IF NOT EXISTS idx_assignments_notification_pending
ON public.assignments(notification_sent, created_at)
WHERE notification_sent = FALSE;

-- Add comment for documentation
COMMENT ON COLUMN public.assignments.materials_uploaded IS 'Tracks whether user has uploaded study materials for this assignment';
COMMENT ON COLUMN public.assignments.notification_sent IS 'Tracks whether email notification was sent to user about this assignment';
