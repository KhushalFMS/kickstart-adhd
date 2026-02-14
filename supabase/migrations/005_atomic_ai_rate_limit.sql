CREATE OR REPLACE FUNCTION public.consume_ai_rate_limit_slot(
  p_route TEXT,
  p_window_seconds INTEGER,
  p_max_requests INTEGER
)
RETURNS TABLE (
  allowed BOOLEAN,
  retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
  v_oldest TIMESTAMPTZ;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, GREATEST(p_window_seconds, 1);
    RETURN;
  END IF;

  IF COALESCE(p_route, '') = '' OR p_window_seconds <= 0 OR p_max_requests <= 0 THEN
    RAISE EXCEPTION 'Invalid AI rate limit parameters';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(v_user_id::TEXT || ':' || p_route, 0)
  );

  v_window_start := NOW() - make_interval(secs => p_window_seconds);

  SELECT COUNT(*), MIN(created_at)
  INTO v_count, v_oldest
  FROM public.ai_usage_logs
  WHERE user_id = v_user_id
    AND route = p_route
    AND created_at >= v_window_start;

  IF v_count < p_max_requests THEN
    INSERT INTO public.ai_usage_logs (user_id, route)
    VALUES (v_user_id, p_route);

    RETURN QUERY SELECT TRUE, 0;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    FALSE,
    GREATEST(
      1,
      CEIL(
        EXTRACT(
          EPOCH FROM (
            (v_oldest + make_interval(secs => p_window_seconds)) - NOW()
          )
        )
      )::INTEGER
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_ai_rate_limit_slot(TEXT, INTEGER, INTEGER) TO authenticated;
