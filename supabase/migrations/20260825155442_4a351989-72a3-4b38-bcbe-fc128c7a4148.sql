ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS cancellation_reason text,
  ADD COLUMN IF NOT EXISTS cancellation_comment text,
  ADD COLUMN IF NOT EXISTS cancellation_source text;

CREATE INDEX IF NOT EXISTS subscriptions_cancellation_reason_idx
  ON public.subscriptions (cancellation_reason);

CREATE OR REPLACE FUNCTION public.admin_cancellation_reasons(p_start date, p_end date)
RETURNS TABLE(reason text, cancels bigint, users bigint, share numeric, avg_months numeric)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH c AS (
    SELECT s.user_id,
           COALESCE(NULLIF(btrim(s.cancellation_reason), ''), 'unknown') AS reason,
           GREATEST(
             EXTRACT(EPOCH FROM (
               COALESCE(s.canceled_at, s.cancel_at, s.current_period_end, now()) - s.created_at
             )) / 2629800.0, 0
           ) AS months
    FROM public.subscriptions s
    WHERE s.status = 'canceled'
      AND COALESCE(s.canceled_at, s.cancel_at, s.current_period_end, s.updated_at)
          >= p_start::timestamptz
      AND COALESCE(s.canceled_at, s.cancel_at, s.current_period_end, s.updated_at)
          < (p_end + 1)::timestamptz
  ),
  agg AS (
    SELECT c.reason,
           count(*)::bigint AS cancels,
           count(DISTINCT c.user_id)::bigint AS users,
           round(avg(c.months)::numeric, 2) AS avg_months
    FROM c GROUP BY c.reason
  )
  SELECT agg.reason,
         agg.cancels,
         agg.users,
         round(100.0 * agg.cancels / NULLIF(sum(agg.cancels) OVER (), 0), 1),
         COALESCE(agg.avg_months, 0)
  FROM agg
  ORDER BY agg.cancels DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_cancellation_comments(p_start date, p_end date, p_limit integer DEFAULT 50)
RETURNS TABLE(canceled_at timestamp with time zone, reason text, comment text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT COALESCE(s.canceled_at, s.cancel_at, s.updated_at),
         COALESCE(NULLIF(btrim(s.cancellation_reason), ''), 'unknown'),
         s.cancellation_comment
  FROM public.subscriptions s
  WHERE s.status = 'canceled'
    AND NULLIF(btrim(s.cancellation_comment), '') IS NOT NULL
    AND COALESCE(s.canceled_at, s.cancel_at, s.current_period_end, s.updated_at) >= p_start::timestamptz
    AND COALESCE(s.canceled_at, s.cancel_at, s.current_period_end, s.updated_at) < (p_end + 1)::timestamptz
  ORDER BY 1 DESC
  LIMIT GREATEST(p_limit, 1);
END;
$function$;