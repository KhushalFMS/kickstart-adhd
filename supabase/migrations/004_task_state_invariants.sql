CREATE UNIQUE INDEX IF NOT EXISTS idx_tasks_one_active_per_user
  ON public.tasks (user_id)
  WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.validate_task_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'queued' AND NEW.status IN ('active', 'blocked', 'completed') THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'active' AND NEW.status IN ('queued', 'blocked', 'completed') THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'blocked' AND NEW.status IN ('queued', 'active', 'completed') THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid task status transition: % -> %', OLD.status, NEW.status
    USING ERRCODE = '23514';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS task_status_transition_guard ON public.tasks;
CREATE TRIGGER task_status_transition_guard
  BEFORE UPDATE OF status ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_task_status_transition();
