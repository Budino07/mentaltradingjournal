CREATE OR REPLACE FUNCTION public.admin_subscription_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  WITH base AS (
    SELECT
      s.id,
      s.user_id,
      s.status,
      s.created_at,
      CASE
        WHEN COALESCE(EXTRACT(EPOCH FROM (s.current_period_end - s.current_period_start)) / 86400, 30) > 200
          THEN 'yearly' ELSE 'monthly'
      END AS plan,
      CASE
        WHEN s.status = 'canceled'
          THEN COALESCE(s.cancel_at, s.current_period_end, s.canceled_at, now())
        ELSE now()
      END AS ended_at,
      (s.status = 'canceled') AS churned
    FROM public.subscriptions s
  ), t AS (
    SELECT
      b.*,
      GREATEST(EXTRACT(EPOCH FROM (b.ended_at - b.created_at)) / 2629800.0, 0) AS months
    FROM base b
  ), by_plan AS (
    SELECT
      plan,
      count(*)::int AS total,
      count(*) FILTER (WHERE churned)::int AS churned,
      count(*) FILTER (WHERE NOT churned)::int AS active,
      round(avg(months) FILTER (WHERE churned)::numeric, 2) AS avg_months_churned,
      round((percentile_cont(0.5) WITHIN GROUP (ORDER BY months) FILTER (WHERE churned))::numeric, 2) AS median_months_churned,
      round(avg(months) FILTER (WHERE NOT churned)::numeric, 2) AS avg_months_active,
      round(avg(months)::numeric, 2) AS avg_months_all,
      round(max(months) FILTER (WHERE churned)::numeric, 2) AS max_months_churned
    FROM t GROUP BY plan
  ), dist AS (
    SELECT
      plan,
      CASE
        WHEN months < 1 THEN '<1'
        WHEN months < 2 THEN '1'
        WHEN months < 3 THEN '2'
        WHEN months < 4 THEN '3'
        WHEN months < 7 THEN '4-6'
        WHEN months < 13 THEN '7-12'
        ELSE '12+'
      END AS bucket,
      count(*)::int AS subs
    FROM t WHERE churned GROUP BY 1, 2
  ), survival AS (
    SELECT
      g.m AS month,
      count(*) FILTER (WHERE t.plan = 'monthly')::int AS cohort,
      count(*) FILTER (WHERE t.plan = 'monthly' AND t.months >= g.m)::int AS surviving
    FROM generate_series(0, 12) AS g(m)
    CROSS JOIN t
    GROUP BY g.m
  ), renewals AS (
    SELECT
      width_bucket(floor(months)::int, 0, 13, 13) AS b,
      count(*)::int AS c
    FROM t WHERE plan = 'monthly' GROUP BY 1
  )
  SELECT jsonb_build_object(
    'by_plan', (SELECT COALESCE(jsonb_agg(to_jsonb(by_plan)), '[]'::jsonb) FROM by_plan),
    'distribution', (SELECT COALESCE(jsonb_agg(to_jsonb(dist)), '[]'::jsonb) FROM dist),
    'survival', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'month', month,
        'surviving', surviving,
        'cohort', cohort,
        'pct', CASE WHEN cohort > 0 THEN round(surviving * 100.0 / cohort, 1) ELSE 0 END
      ) ORDER BY month), '[]'::jsonb) FROM survival
    ),
    'totals', (
      SELECT jsonb_build_object(
        'subscriptions', count(*)::int,
        'subscribers', count(DISTINCT user_id)::int,
        'repeat_subscribers', (SELECT count(*)::int FROM (SELECT user_id FROM t GROUP BY user_id HAVING count(*) > 1) x),
        'avg_months_monthly_churned', (SELECT avg_months_churned FROM by_plan WHERE plan = 'monthly'),
        'median_months_monthly_churned', (SELECT median_months_churned FROM by_plan WHERE plan = 'monthly')
      ) FROM t
    )
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_subscription_stats() TO authenticated;