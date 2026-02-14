ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS skipped_qc BOOLEAN;

UPDATE public.tasks
SET skipped_qc = FALSE
WHERE skipped_qc IS NULL;

ALTER TABLE public.tasks
ALTER COLUMN skipped_qc SET DEFAULT FALSE;

ALTER TABLE public.tasks
ALTER COLUMN skipped_qc SET NOT NULL;
