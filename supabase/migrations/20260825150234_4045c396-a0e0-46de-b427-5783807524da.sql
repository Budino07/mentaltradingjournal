CREATE OR REPLACE FUNCTION public.admin_activity_breakdown(p_start date, p_end date)
RETURNS TABLE(feature text, kind text, uses bigint, users bigint, total_seconds numeric, avg_seconds numeric, share numeric)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH ev AS (
    SELECT e.user_id,
           e.created_at,
           COALESCE(NULLIF(e.path, ''), e.event_name) AS raw,
           LEAST(
             EXTRACT(EPOCH FROM (
               lead(e.created_at) OVER (PARTITION BY e.session_id ORDER BY e.created_at) - e.created_at
             )), 1800
           ) AS dwell
    FROM public.analytics_events e
    WHERE e.user_id IS NOT NULL
      AND e.created_at >= p_start::timestamptz
      AND e.created_at < (p_end + 1)::timestamptz
  ),
  ev_named AS (
    SELECT user_id,
           CASE
             WHEN btrim(raw, '/') = '' THEN 'Dashboard'
             ELSE initcap(replace(split_part(btrim(raw, '/'), '/', 1), '-', ' '))
           END AS feature,
           'page'::text AS kind,
           COALESCE(dwell, 0)::numeric AS secs
    FROM ev
  ),
  other AS (
    SELECT a.user_id, a.label AS feature, a.kind, 0::numeric AS secs
    FROM public.admin_activity(p_start::timestamptz, (p_end + 1)::timestamptz) a
    WHERE a.kind <> 'event' AND a.label IS NOT NULL
  ),
  all_rows AS (
    SELECT * FROM ev_named
    UNION ALL
    SELECT * FROM other
  ),
  agg AS (
    SELECT r.feature,
           max(r.kind) AS kind,
           count(*)::bigint AS uses,
           count(DISTINCT r.user_id)::bigint AS users,
           round(sum(r.secs)::numeric, 0) AS total_seconds,
           round(avg(NULLIF(r.secs, 0))::numeric, 0) AS avg_seconds
    FROM all_rows r
    GROUP BY r.feature
  )
  SELECT agg.feature,
         agg.kind,
         agg.uses,
         agg.users,
         agg.total_seconds,
         COALESCE(agg.avg_seconds, 0),
         round(100.0 * agg.uses / NULLIF(sum(agg.uses) OVER (), 0), 1)
  FROM agg
  ORDER BY agg.uses DESC;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_activity_breakdown(date, date) TO authenticated;