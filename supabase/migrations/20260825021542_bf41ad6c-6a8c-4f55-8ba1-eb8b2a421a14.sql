CREATE OR REPLACE FUNCTION public.admin_kpis_range(p_start date, p_end date)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r jsonb;
  span int;
  prev_start date;
  prev_end date;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  span := GREATEST((p_end - p_start) + 1, 1);
  prev_start := p_start - span;
  prev_end := p_start - 1;

  WITH u AS (SELECT id, (created_at AT TIME ZONE 'UTC')::date AS d FROM auth.users),
  a AS (
    SELECT DISTINCT user_id, (ts AT TIME ZONE 'UTC')::date AS d
    FROM public.admin_activity(now() - interval '400 days', now())
  ),
  prev_active AS (SELECT DISTINCT user_id FROM a WHERE d BETWEEN prev_start AND prev_end),
  cur_active AS (SELECT DISTINCT user_id FROM a WHERE d BETWEEN p_start AND p_end),
  ret_cohort AS (SELECT id, d FROM u WHERE d BETWEEN p_start AND p_end),
  retained AS (
    SELECT DISTINCT c.id FROM ret_cohort c
    JOIN a ON a.user_id = c.id AND a.d > c.d
  )
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM u WHERE d <= p_end),
    'dau', (SELECT count(*) FROM (SELECT DISTINCT user_id FROM a WHERE d = p_end) x),
    'wau', (SELECT count(*) FROM (SELECT DISTINCT user_id FROM a WHERE d > p_end - 7 AND d <= p_end) x),
    'mau', (SELECT count(*) FROM (SELECT DISTINCT user_id FROM a WHERE d > p_end - 30 AND d <= p_end) x),
    'active_users', (SELECT count(*) FROM cur_active),
    'active_users_prev', (SELECT count(*) FROM prev_active),
    'signups', (SELECT count(*) FROM u WHERE d BETWEEN p_start AND p_end),
    'signups_prev', (SELECT count(*) FROM u WHERE d BETWEEN prev_start AND prev_end),
    'churn_rate', CASE WHEN (SELECT count(*) FROM prev_active) = 0 THEN 0
      ELSE round(100.0 * (SELECT count(*) FROM prev_active p WHERE NOT EXISTS (SELECT 1 FROM cur_active c WHERE c.user_id = p.user_id))
                 / (SELECT count(*) FROM prev_active), 1) END,
    'retention_rate', CASE WHEN (SELECT count(*) FROM ret_cohort) = 0 THEN 0
      ELSE round(100.0 * (SELECT count(*) FROM retained) / (SELECT count(*) FROM ret_cohort), 1) END,
    'span_days', span,
    'subscribed_users', (SELECT count(DISTINCT s.user_id) FROM public.subscriptions s WHERE s.status = 'active')
  ) INTO r;

  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_kpis_range(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_kpis_range(date, date) TO authenticated;