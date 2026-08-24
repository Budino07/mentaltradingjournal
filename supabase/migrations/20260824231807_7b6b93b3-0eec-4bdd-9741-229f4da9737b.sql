-- ============ ROLES ============
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ANALYTICS EVENTS ============
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  event_type text NOT NULL DEFAULT 'page_view',
  event_name text NOT NULL,
  path text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.analytics_events TO anon;
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can record their own events"
  ON public.analytics_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Visitors can record anonymous events"
  ON public.analytics_events FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can read all events"
  ON public.analytics_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX idx_analytics_events_user_created ON public.analytics_events (user_id, created_at DESC);
CREATE INDEX idx_analytics_events_session ON public.analytics_events (session_id);

-- ============ UNIFIED ACTIVITY SOURCE (internal) ============
CREATE OR REPLACE FUNCTION public.admin_activity(p_start timestamptz DEFAULT '-infinity', p_end timestamptz DEFAULT 'infinity')
RETURNS TABLE (user_id uuid, ts timestamptz, kind text, label text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.user_id, e.created_at, 'event',
         COALESCE(NULLIF(e.path, ''), e.event_name)
  FROM public.analytics_events e
  WHERE e.user_id IS NOT NULL AND e.created_at BETWEEN p_start AND p_end
  UNION ALL
  SELECT j.user_id, j.created_at, 'journal', 'Journal entry'
  FROM public.journal_entries j WHERE j.created_at BETWEEN p_start AND p_end
  UNION ALL
  SELECT b.user_id, b.created_at, 'backtest', 'Backtesting session'
  FROM public.backtesting_sessions b WHERE b.created_at BETWEEN p_start AND p_end
  UNION ALL
  SELECT n.user_id, GREATEST(n.created_at, n.updated_at), 'note', 'Notebook note'
  FROM public.notebook_notes n WHERE GREATEST(n.created_at, n.updated_at) BETWEEN p_start AND p_end
  UNION ALL
  SELECT w.user_id, w.created_at, 'review', 'Weekly review'
  FROM public.weekly_reviews w WHERE w.created_at IS NOT NULL AND w.created_at BETWEEN p_start AND p_end
$$;

REVOKE ALL ON FUNCTION public.admin_activity(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;

-- ============ KPIs ============
CREATE OR REPLACE FUNCTION public.admin_kpis()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  WITH u AS (SELECT id, created_at FROM auth.users),
  a AS (
    SELECT DISTINCT user_id, (ts AT TIME ZONE 'UTC')::date AS d
    FROM public.admin_activity(now() - interval '400 days', now())
  ),
  prev_active AS (
    SELECT DISTINCT user_id FROM a WHERE d >= current_date - 59 AND d < current_date - 29
  ),
  cur_active AS (
    SELECT DISTINCT user_id FROM a WHERE d >= current_date - 29
  ),
  ret_cohort AS (
    SELECT id, created_at FROM u WHERE created_at < now() - interval '30 days'
  ),
  retained AS (
    SELECT DISTINCT c.id FROM ret_cohort c
    JOIN a ON a.user_id = c.id AND a.d >= (c.created_at + interval '30 days')::date
  )
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM u),
    'dau', (SELECT count(*) FROM (SELECT DISTINCT user_id FROM a WHERE d = current_date) x),
    'wau', (SELECT count(*) FROM (SELECT DISTINCT user_id FROM a WHERE d >= current_date - 6) x),
    'mau', (SELECT count(*) FROM (SELECT DISTINCT user_id FROM a WHERE d >= current_date - 29) x),
    'signups_today', (SELECT count(*) FROM u WHERE created_at >= current_date),
    'signups_yesterday', (SELECT count(*) FROM u WHERE created_at >= current_date - 1 AND created_at < current_date),
    'signups_week', (SELECT count(*) FROM u WHERE created_at >= current_date - 6),
    'signups_prev_week', (SELECT count(*) FROM u WHERE created_at >= current_date - 13 AND created_at < current_date - 6),
    'signups_month', (SELECT count(*) FROM u WHERE created_at >= current_date - 29),
    'signups_prev_month', (SELECT count(*) FROM u WHERE created_at >= current_date - 59 AND created_at < current_date - 29),
    'churn_rate', CASE WHEN (SELECT count(*) FROM prev_active) = 0 THEN 0
      ELSE round(100.0 * (SELECT count(*) FROM prev_active p WHERE NOT EXISTS (SELECT 1 FROM cur_active c WHERE c.user_id = p.user_id))
                 / (SELECT count(*) FROM prev_active), 1) END,
    'retention_rate', CASE WHEN (SELECT count(*) FROM ret_cohort) = 0 THEN 0
      ELSE round(100.0 * (SELECT count(*) FROM retained) / (SELECT count(*) FROM ret_cohort), 1) END,
    'retention_days', 30,
    'subscribed_users', (SELECT count(DISTINCT s.user_id) FROM public.subscriptions s WHERE s.status = 'active')
  ) INTO r;

  RETURN r;
END;
$$;

-- ============ GROWTH ============
CREATE OR REPLACE FUNCTION public.admin_growth_series(p_start date, p_end date, p_bucket text DEFAULT 'day')
RETURNS TABLE (bucket date, signups bigint, cumulative bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_bucket NOT IN ('day', 'week', 'month') THEN
    RAISE EXCEPTION 'Invalid bucket';
  END IF;

  RETURN QUERY
  WITH b AS (
    SELECT generate_series(
      date_trunc(p_bucket, p_start::timestamp),
      date_trunc(p_bucket, p_end::timestamp),
      ('1 ' || p_bucket)::interval
    ) AS g
  ),
  s AS (
    SELECT date_trunc(p_bucket, created_at AT TIME ZONE 'UTC') AS d, count(*) AS c
    FROM auth.users GROUP BY 1
  )
  SELECT b.g::date,
         COALESCE(s.c, 0)::bigint,
         (SELECT count(*) FROM auth.users u
           WHERE (u.created_at AT TIME ZONE 'UTC') < b.g + ('1 ' || p_bucket)::interval)::bigint
  FROM b LEFT JOIN s ON s.d = b.g
  ORDER BY 1;
END;
$$;

-- ============ ACTIVE USERS ============
CREATE OR REPLACE FUNCTION public.admin_active_users(p_start date, p_end date)
RETURNS TABLE (day date, dau bigint, wau bigint, mau bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH a AS (
    SELECT DISTINCT user_id, (ts AT TIME ZONE 'UTC')::date AS d
    FROM public.admin_activity((p_start - 30)::timestamptz, (p_end + 1)::timestamptz)
  ),
  days AS (
    SELECT generate_series(p_start, p_end, interval '1 day')::date AS d
  )
  SELECT days.d,
    (SELECT count(DISTINCT a.user_id) FROM a WHERE a.d = days.d)::bigint,
    (SELECT count(DISTINCT a.user_id) FROM a WHERE a.d > days.d - 7 AND a.d <= days.d)::bigint,
    (SELECT count(DISTINCT a.user_id) FROM a WHERE a.d > days.d - 30 AND a.d <= days.d)::bigint
  FROM days ORDER BY 1;
END;
$$;

-- ============ SESSIONS ============
CREATE OR REPLACE FUNCTION public.admin_sessions_series(p_start date, p_end date)
RETURNS TABLE (day date, sessions bigint, avg_duration_sec numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH s AS (
    SELECT session_id,
           min(created_at) AS started,
           EXTRACT(EPOCH FROM (max(created_at) - min(created_at))) AS dur
    FROM public.analytics_events
    WHERE session_id IS NOT NULL
      AND created_at >= p_start::timestamptz
      AND created_at < (p_end + 1)::timestamptz
    GROUP BY session_id
  ),
  days AS (SELECT generate_series(p_start, p_end, interval '1 day')::date AS d)
  SELECT days.d,
         COALESCE(count(s.session_id), 0)::bigint,
         COALESCE(round(avg(s.dur)::numeric, 0), 0)
  FROM days
  LEFT JOIN s ON (s.started AT TIME ZONE 'UTC')::date = days.d
  GROUP BY days.d ORDER BY 1;
END;
$$;

-- ============ FEATURE USAGE ============
CREATE OR REPLACE FUNCTION public.admin_feature_usage(p_start date, p_end date)
RETURNS TABLE (feature text, users bigint, uses bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT a.label,
         count(DISTINCT a.user_id)::bigint,
         count(*)::bigint
  FROM public.admin_activity(p_start::timestamptz, (p_end + 1)::timestamptz) a
  WHERE a.label IS NOT NULL
  GROUP BY a.label
  ORDER BY 3 DESC;
END;
$$;

-- ============ COHORT RETENTION ============
CREATE OR REPLACE FUNCTION public.admin_cohort_retention(p_cohorts int DEFAULT 8, p_periods int DEFAULT 8)
RETURNS TABLE (cohort date, cohort_size bigint, period int, retained bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH c AS (
    SELECT u.id, date_trunc('week', u.created_at AT TIME ZONE 'UTC')::date AS w
    FROM auth.users u
    WHERE u.created_at >= (date_trunc('week', now()) - (p_cohorts || ' weeks')::interval)
  ),
  sizes AS (SELECT w, count(*)::bigint AS n FROM c GROUP BY w),
  a AS (
    SELECT DISTINCT user_id, date_trunc('week', ts AT TIME ZONE 'UTC')::date AS w
    FROM public.admin_activity((now() - ((p_cohorts + p_periods + 2) || ' weeks')::interval), now())
  ),
  periods AS (SELECT generate_series(0, p_periods) AS p)
  SELECT sizes.w, sizes.n, periods.p,
    (SELECT count(DISTINCT c2.id) FROM c c2
      JOIN a ON a.user_id = c2.id
      WHERE c2.w = sizes.w
        AND a.w = (sizes.w + (periods.p || ' weeks')::interval)::date)::bigint
  FROM sizes CROSS JOIN periods
  ORDER BY sizes.w DESC, periods.p;
END;
$$;

-- ============ CHURN TREND ============
CREATE OR REPLACE FUNCTION public.admin_churn_trend(p_weeks int DEFAULT 12)
RETURNS TABLE (week date, churn_rate numeric, churned bigint, base bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH a AS (
    SELECT DISTINCT user_id, (ts AT TIME ZONE 'UTC')::date AS d
    FROM public.admin_activity(now() - ((p_weeks + 10) || ' weeks')::interval, now())
  ),
  wks AS (
    SELECT generate_series(
      date_trunc('week', now()) - ((p_weeks - 1) || ' weeks')::interval,
      date_trunc('week', now()),
      interval '1 week'
    )::date AS w
  )
  SELECT wks.w,
    CASE WHEN base_c.n = 0 THEN 0
         ELSE round(100.0 * churn_c.n / base_c.n, 1) END,
    churn_c.n, base_c.n
  FROM wks
  CROSS JOIN LATERAL (
    SELECT count(*)::bigint AS n FROM (
      SELECT DISTINCT user_id FROM a WHERE d >= wks.w - 59 AND d < wks.w - 29
    ) x
  ) base_c
  CROSS JOIN LATERAL (
    SELECT count(*)::bigint AS n FROM (
      SELECT DISTINCT user_id FROM a p WHERE p.d >= wks.w - 59 AND p.d < wks.w - 29
      EXCEPT
      SELECT DISTINCT user_id FROM a q WHERE q.d >= wks.w - 29 AND q.d <= wks.w
    ) y
  ) churn_c
  ORDER BY wks.w;
END;
$$;

-- ============ USER LIST ============
CREATE OR REPLACE FUNCTION public.admin_user_list(p_search text DEFAULT NULL, p_segment text DEFAULT 'all', p_churn_days int DEFAULT 30)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  signup_date timestamptz,
  last_active timestamptz,
  session_count bigint,
  activity_count bigint,
  plan text,
  status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH act AS (
    SELECT a.user_id, max(a.ts) AS last_ts, count(*)::bigint AS cnt
    FROM public.admin_activity() a GROUP BY a.user_id
  ),
  sess AS (
    SELECT e.user_id, count(DISTINCT e.session_id)::bigint AS cnt
    FROM public.analytics_events e WHERE e.user_id IS NOT NULL AND e.session_id IS NOT NULL
    GROUP BY e.user_id
  ),
  sub AS (
    SELECT DISTINCT s.user_id FROM public.subscriptions s WHERE s.status = 'active'
  )
  SELECT u.id,
         u.email::text,
         p.full_name,
         u.created_at,
         act.last_ts,
         COALESCE(sess.cnt, 0),
         COALESCE(act.cnt, 0),
         CASE WHEN sub.user_id IS NOT NULL THEN 'subscribed' ELSE 'free' END,
         CASE
           WHEN act.last_ts IS NULL AND u.created_at < now() - (p_churn_days || ' days')::interval THEN 'churned'
           WHEN act.last_ts IS NULL THEN 'inactive'
           WHEN act.last_ts >= now() - interval '7 days' THEN 'active'
           WHEN act.last_ts >= now() - (p_churn_days || ' days')::interval THEN 'inactive'
           ELSE 'churned'
         END
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN act ON act.user_id = u.id
  LEFT JOIN sess ON sess.user_id = u.id
  LEFT JOIN sub ON sub.user_id = u.id
  WHERE (p_search IS NULL OR p_search = ''
         OR u.email ILIKE '%' || p_search || '%'
         OR COALESCE(p.full_name, '') ILIKE '%' || p_search || '%')
    AND (p_segment = 'all'
         OR (p_segment = 'subscribed' AND sub.user_id IS NOT NULL)
         OR (p_segment = 'free' AND sub.user_id IS NULL))
  ORDER BY u.created_at DESC;
END;
$$;

-- ============ USER TIMELINE ============
CREATE OR REPLACE FUNCTION public.admin_user_timeline(p_user_id uuid, p_limit int DEFAULT 200)
RETURNS TABLE (ts timestamptz, kind text, label text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT a.ts, a.kind, a.label
  FROM public.admin_activity() a
  WHERE a.user_id = p_user_id
  ORDER BY a.ts DESC
  LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_kpis() FROM anon;
REVOKE ALL ON FUNCTION public.admin_growth_series(date, date, text) FROM anon;
REVOKE ALL ON FUNCTION public.admin_active_users(date, date) FROM anon;
REVOKE ALL ON FUNCTION public.admin_sessions_series(date, date) FROM anon;
REVOKE ALL ON FUNCTION public.admin_feature_usage(date, date) FROM anon;
REVOKE ALL ON FUNCTION public.admin_cohort_retention(int, int) FROM anon;
REVOKE ALL ON FUNCTION public.admin_churn_trend(int) FROM anon;
REVOKE ALL ON FUNCTION public.admin_user_list(text, text, int) FROM anon;
REVOKE ALL ON FUNCTION public.admin_user_timeline(uuid, int) FROM anon;