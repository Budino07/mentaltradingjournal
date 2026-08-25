CREATE TABLE IF NOT EXISTS public.plan_prices (
  price_id text PRIMARY KEY,
  nickname text,
  unit_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  interval text NOT NULL DEFAULT 'month',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_prices TO authenticated;
GRANT ALL ON public.plan_prices TO service_role;

ALTER TABLE public.plan_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage plan prices" ON public.plan_prices;
CREATE POLICY "Admins manage plan prices"
ON public.plan_prices FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS set_timestamp ON public.plan_prices;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.plan_prices
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

INSERT INTO public.plan_prices (price_id, nickname, unit_amount, currency, interval)
SELECT DISTINCT s.stripe_price_id, 'Unnamed plan', 0, 'usd', 'month'
FROM public.subscriptions s
WHERE s.stripe_price_id IS NOT NULL
ON CONFLICT (price_id) DO NOTHING;

-- ============ helper: sessionized events ============
CREATE OR REPLACE FUNCTION public.admin_sessions_base(p_start date, p_end date)
RETURNS TABLE(session_id text, visitor_id text, user_id uuid, started timestamptz, ended timestamptz,
              pageviews bigint, landing_path text, device_type text, referrer text,
              utm_source text, utm_medium text, utm_campaign text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.session_id,
         (array_agg(e.visitor_id ORDER BY e.created_at) FILTER (WHERE e.visitor_id IS NOT NULL))[1],
         (array_agg(e.user_id ORDER BY e.created_at) FILTER (WHERE e.user_id IS NOT NULL))[1],
         min(e.created_at),
         max(e.created_at),
         count(*) FILTER (WHERE e.event_type = 'page_view')::bigint,
         (array_agg(COALESCE(e.path, e.event_name) ORDER BY e.created_at))[1],
         (array_agg(e.device_type ORDER BY e.created_at) FILTER (WHERE e.device_type IS NOT NULL))[1],
         (array_agg(e.referrer ORDER BY e.created_at) FILTER (WHERE e.referrer IS NOT NULL))[1],
         (array_agg(e.utm_source ORDER BY e.created_at) FILTER (WHERE e.utm_source IS NOT NULL))[1],
         (array_agg(e.utm_medium ORDER BY e.created_at) FILTER (WHERE e.utm_medium IS NOT NULL))[1],
         (array_agg(e.utm_campaign ORDER BY e.created_at) FILTER (WHERE e.utm_campaign IS NOT NULL))[1]
  FROM public.analytics_events e
  WHERE e.session_id IS NOT NULL
    AND e.created_at >= p_start::timestamptz
    AND e.created_at < (p_end + 1)::timestamptz
  GROUP BY e.session_id
$$;

CREATE OR REPLACE FUNCTION public.admin_source_of(p_referrer text, p_utm_source text, p_utm_medium text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN lower(COALESCE(p_utm_medium,'')) IN ('cpc','ppc','paid','paid_social','display') THEN 'paid'
    WHEN COALESCE(p_utm_source,'') <> '' THEN 'campaign'
    WHEN COALESCE(p_referrer,'') = '' THEN 'direct'
    WHEN p_referrer ~* '(google|bing|duckduckgo|yahoo|ecosia|brave)\.' THEN 'organic search'
    WHEN p_referrer ~* '(reddit|twitter|x\.com|facebook|instagram|linkedin|tiktok|youtube|discord|t\.me)' THEN 'social'
    ELSE 'referral'
  END
$$;

-- ============ acquisition ============
CREATE OR REPLACE FUNCTION public.admin_acquisition(p_start date, p_end date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  WITH s AS (SELECT * FROM public.admin_sessions_base(p_start, p_end)),
  firstseen AS (
    SELECT visitor_id, min(created_at) AS first_at
    FROM public.analytics_events WHERE visitor_id IS NOT NULL GROUP BY visitor_id
  ),
  signups AS (
    SELECT count(*)::bigint AS n FROM auth.users u
    WHERE (u.created_at AT TIME ZONE 'UTC')::date BETWEEN p_start AND p_end
  )
  SELECT jsonb_build_object(
    'visits', (SELECT count(*) FROM s),
    'visitors', (SELECT count(DISTINCT visitor_id) FROM s WHERE visitor_id IS NOT NULL),
    'new_visitors', (SELECT count(DISTINCT s.visitor_id) FROM s JOIN firstseen f ON f.visitor_id = s.visitor_id
                     WHERE (f.first_at AT TIME ZONE 'UTC')::date BETWEEN p_start AND p_end),
    'pageviews', (SELECT COALESCE(sum(pageviews),0) FROM s),
    'signups', (SELECT n FROM signups),
    'anon_visits', (SELECT count(*) FROM s WHERE user_id IS NULL),
    'tracked_visitors', (SELECT count(DISTINCT visitor_id) FROM s WHERE visitor_id IS NOT NULL)
  ) INTO r;
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_traffic_sources(p_start date, p_end date)
RETURNS TABLE(source text, visits bigint, visitors bigint, signups bigint, bounce_rate numeric, avg_pages numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH s AS (
    SELECT b.*, public.admin_source_of(b.referrer, b.utm_source, b.utm_medium) AS src,
           EXISTS (SELECT 1 FROM public.analytics_events e
                   WHERE e.session_id = b.session_id AND e.event_name = 'signup_completed') AS converted
    FROM public.admin_sessions_base(p_start, p_end) b
  )
  SELECT s.src,
         count(*)::bigint,
         count(DISTINCT s.visitor_id)::bigint,
         count(*) FILTER (WHERE s.converted)::bigint,
         round(100.0 * count(*) FILTER (WHERE s.pageviews <= 1) / NULLIF(count(*),0), 1),
         round(avg(s.pageviews)::numeric, 2)
  FROM s GROUP BY s.src ORDER BY 2 DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_landing_pages(p_start date, p_end date, p_limit integer DEFAULT 15)
RETURNS TABLE(path text, visits bigint, bounce_rate numeric, avg_pages numeric, avg_seconds numeric, signups bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH s AS (
    SELECT b.*, EXTRACT(EPOCH FROM (b.ended - b.started)) AS dur,
           EXISTS (SELECT 1 FROM public.analytics_events e
                   WHERE e.session_id = b.session_id AND e.event_name = 'signup_completed') AS converted
    FROM public.admin_sessions_base(p_start, p_end) b
  )
  SELECT COALESCE(s.landing_path, '(unknown)'),
         count(*)::bigint,
         round(100.0 * count(*) FILTER (WHERE s.pageviews <= 1) / NULLIF(count(*),0), 1),
         round(avg(s.pageviews)::numeric, 2),
         round(avg(s.dur)::numeric, 0),
         count(*) FILTER (WHERE s.converted)::bigint
  FROM s GROUP BY 1 ORDER BY 2 DESC LIMIT GREATEST(p_limit, 1);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_top_referrers(p_start date, p_end date, p_limit integer DEFAULT 15)
RETURNS TABLE(referrer text, visits bigint, visitors bigint, signups bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH s AS (
    SELECT b.*, EXISTS (SELECT 1 FROM public.analytics_events e
                        WHERE e.session_id = b.session_id AND e.event_name = 'signup_completed') AS converted
    FROM public.admin_sessions_base(p_start, p_end) b
    WHERE COALESCE(b.referrer, '') <> '' OR COALESCE(b.utm_source, '') <> ''
  )
  SELECT COALESCE(NULLIF(s.utm_source,''), regexp_replace(s.referrer, '^https?://(www\.)?([^/]+).*$', '\2')),
         count(*)::bigint,
         count(DISTINCT s.visitor_id)::bigint,
         count(*) FILTER (WHERE s.converted)::bigint
  FROM s GROUP BY 1 ORDER BY 2 DESC LIMIT GREATEST(p_limit, 1);
END; $$;

-- ============ engagement quality ============
CREATE OR REPLACE FUNCTION public.admin_engagement_quality(p_start date, p_end date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  WITH s AS (
    SELECT b.*, EXTRACT(EPOCH FROM (b.ended - b.started)) AS dur
    FROM public.admin_sessions_base(p_start, p_end) b
  )
  SELECT jsonb_build_object(
    'sessions', count(*),
    'avg_duration_sec', COALESCE(round(avg(dur)::numeric, 0), 0),
    'median_duration_sec', COALESCE(round((percentile_cont(0.5) WITHIN GROUP (ORDER BY dur))::numeric, 0), 0),
    'pages_per_session', COALESCE(round(avg(pageviews)::numeric, 2), 0),
    'bounce_rate', COALESCE(round(100.0 * count(*) FILTER (WHERE pageviews <= 1) / NULLIF(count(*),0), 1), 0)
  ) INTO r FROM s;
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_page_bounce(p_start date, p_end date, p_limit integer DEFAULT 15)
RETURNS TABLE(path text, entries bigint, bounce_rate numeric, avg_seconds numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH s AS (
    SELECT b.*, EXTRACT(EPOCH FROM (b.ended - b.started)) AS dur
    FROM public.admin_sessions_base(p_start, p_end) b
  )
  SELECT COALESCE(s.landing_path, '(unknown)'),
         count(*)::bigint,
         round(100.0 * count(*) FILTER (WHERE s.pageviews <= 1) / NULLIF(count(*),0), 1),
         round(avg(s.dur)::numeric, 0)
  FROM s GROUP BY 1 HAVING count(*) >= 1
  ORDER BY 3 DESC NULLS LAST, 2 DESC LIMIT GREATEST(p_limit, 1);
END; $$;

CREATE OR REPLACE FUNCTION public.admin_device_breakdown(p_start date, p_end date)
RETURNS TABLE(device text, sessions bigint, visitors bigint, avg_seconds numeric, pages_per_session numeric, bounce_rate numeric, signups bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  RETURN QUERY
  WITH s AS (
    SELECT b.*, EXTRACT(EPOCH FROM (b.ended - b.started)) AS dur,
           EXISTS (SELECT 1 FROM public.analytics_events e
                   WHERE e.session_id = b.session_id AND e.event_name = 'signup_completed') AS converted
    FROM public.admin_sessions_base(p_start, p_end) b
  )
  SELECT COALESCE(s.device_type, 'unknown'),
         count(*)::bigint,
         count(DISTINCT s.visitor_id)::bigint,
         round(avg(s.dur)::numeric, 0),
         round(avg(s.pageviews)::numeric, 2),
         round(100.0 * count(*) FILTER (WHERE s.pageviews <= 1) / NULLIF(count(*),0), 1),
         count(*) FILTER (WHERE s.converted)::bigint
  FROM s GROUP BY 1 ORDER BY 2 DESC;
END; $$;

-- ============ signup funnel + activation ============
CREATE OR REPLACE FUNCTION public.admin_signup_funnel(p_start date, p_end date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  WITH s AS (SELECT * FROM public.admin_sessions_base(p_start, p_end)),
  cohort AS (
    SELECT u.id, u.created_at,
           COALESCE(NULLIF(u.raw_app_meta_data->>'provider',''), 'email') AS provider
    FROM auth.users u
    WHERE (u.created_at AT TIME ZONE 'UTC')::date BETWEEN p_start AND p_end
  ),
  journaled AS (
    SELECT DISTINCT c.id FROM cohort c
    JOIN public.journal_entries j ON j.user_id = c.id
  ),
  second_session AS (
    SELECT c.id FROM cohort c
    WHERE (SELECT count(DISTINCT e.session_id) FROM public.analytics_events e
           WHERE e.user_id = c.id AND e.created_at <= c.created_at + interval '7 days') >= 2
  ),
  paid AS (
    SELECT DISTINCT c.id FROM cohort c
    JOIN public.subscriptions sub ON sub.user_id = c.id
  ),
  ttfs AS (
    SELECT c.id,
      (SELECT min(e.created_at) FROM public.analytics_events e
        WHERE e.visitor_id IS NOT NULL
          AND e.visitor_id = (SELECT e2.visitor_id FROM public.analytics_events e2
                              WHERE e2.user_id = c.id AND e2.visitor_id IS NOT NULL
                              ORDER BY e2.created_at LIMIT 1)) AS first_seen,
      c.created_at
    FROM cohort c
  )
  SELECT jsonb_build_object(
    'visitors', (SELECT count(DISTINCT visitor_id) FROM s WHERE visitor_id IS NOT NULL),
    'signups', (SELECT count(*) FROM cohort),
    'journaled', (SELECT count(*) FROM journaled),
    'second_session', (SELECT count(*) FROM second_session),
    'paid', (SELECT count(*) FROM paid),
    'methods', (SELECT COALESCE(jsonb_agg(jsonb_build_object('method', provider, 'users', n) ORDER BY n DESC), '[]'::jsonb)
                FROM (SELECT provider, count(*)::int AS n FROM cohort GROUP BY provider) m),
    'time_to_signup', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('bucket', bucket, 'users', n)), '[]'::jsonb)
      FROM (
        SELECT CASE
                 WHEN first_seen IS NULL THEN 'untracked'
                 WHEN created_at - first_seen < interval '30 minutes' THEN 'same session'
                 WHEN created_at - first_seen < interval '1 day' THEN 'same day'
                 WHEN created_at - first_seen < interval '7 days' THEN '2-7 days'
                 ELSE '7+ days'
               END AS bucket,
               count(*)::int AS n
        FROM ttfs GROUP BY 1
      ) t)
  ) INTO r;
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_activation(p_start date, p_end date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  WITH cohort AS (
    SELECT u.id, u.created_at FROM auth.users u
    WHERE (u.created_at AT TIME ZONE 'UTC')::date BETWEEN p_start AND p_end
  ),
  first_entry AS (
    SELECT c.id, c.created_at,
           (SELECT min(j.created_at) FROM public.journal_entries j WHERE j.user_id = c.id) AS first_j,
           (SELECT min(b.created_at) FROM public.backtesting_sessions b WHERE b.user_id = c.id) AS first_b,
           (SELECT count(DISTINCT e.session_id) FROM public.analytics_events e
             WHERE e.user_id = c.id AND e.created_at <= c.created_at + interval '7 days') AS sessions_7d,
           (SELECT count(*) FROM public.analytics_events e WHERE e.user_id = c.id) AS events
    FROM cohort c
  )
  SELECT jsonb_build_object(
    'cohort', (SELECT count(*) FROM cohort),
    'entry_24h', (SELECT count(*) FROM first_entry WHERE first_j IS NOT NULL AND first_j <= created_at + interval '1 day'),
    'entry_7d', (SELECT count(*) FROM first_entry WHERE first_j IS NOT NULL AND first_j <= created_at + interval '7 days'),
    'entry_ever', (SELECT count(*) FROM first_entry WHERE first_j IS NOT NULL),
    'backtest_7d', (SELECT count(*) FROM first_entry WHERE first_b IS NOT NULL AND first_b <= created_at + interval '7 days'),
    'second_session_7d', (SELECT count(*) FROM first_entry WHERE sessions_7d >= 2),
    'never_active', (SELECT count(*) FROM first_entry WHERE first_j IS NULL AND first_b IS NULL AND events = 0),
    'signed_up_never_journaled', (SELECT count(*) FROM first_entry WHERE first_j IS NULL),
    'median_hours_to_first_entry', (
      SELECT COALESCE(round((percentile_cont(0.5) WITHIN GROUP (
        ORDER BY EXTRACT(EPOCH FROM (first_j - created_at)) / 3600.0))::numeric, 1), 0)
      FROM first_entry WHERE first_j IS NOT NULL)
  ) INTO r;
  RETURN r;
END; $$;

-- ============ retention day-n ============
CREATE OR REPLACE FUNCTION public.admin_retention_dn(p_start date, p_end date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  WITH cohort AS (
    SELECT u.id, (u.created_at AT TIME ZONE 'UTC')::date AS d FROM auth.users u
    WHERE (u.created_at AT TIME ZONE 'UTC')::date BETWEEN p_start AND p_end
  ),
  a AS (
    SELECT DISTINCT act.user_id, (act.ts AT TIME ZONE 'UTC')::date AS d
    FROM public.admin_activity(now() - interval '400 days', now()) act
  ),
  wk AS (
    SELECT date_trunc('week', d)::date AS w, count(DISTINCT user_id)::int AS users
    FROM a WHERE d BETWEEN p_start - 56 AND p_end GROUP BY 1
  ),
  active_users AS (SELECT DISTINCT user_id FROM a WHERE d BETWEEN p_start AND p_end),
  entries AS (
    SELECT count(*)::numeric AS n FROM public.journal_entries j
    WHERE (j.created_at AT TIME ZONE 'UTC')::date BETWEEN p_start AND p_end
  )
  SELECT jsonb_build_object(
    'cohort', (SELECT count(*) FROM cohort),
    'd1', (SELECT count(*) FROM cohort c WHERE EXISTS (SELECT 1 FROM a WHERE a.user_id = c.id AND a.d = c.d + 1)),
    'd7', (SELECT count(*) FROM cohort c WHERE EXISTS (SELECT 1 FROM a WHERE a.user_id = c.id AND a.d BETWEEN c.d + 5 AND c.d + 9)),
    'd30', (SELECT count(*) FROM cohort c WHERE EXISTS (SELECT 1 FROM a WHERE a.user_id = c.id AND a.d BETWEEN c.d + 25 AND c.d + 35)),
    'weekly_active', (SELECT COALESCE(jsonb_agg(jsonb_build_object('week', w, 'users', users) ORDER BY w), '[]'::jsonb) FROM wk),
    'active_users', (SELECT count(*) FROM active_users),
    'entries_per_active_user', (
      SELECT CASE WHEN (SELECT count(*) FROM active_users) = 0 THEN 0
             ELSE round((SELECT n FROM entries) / (SELECT count(*) FROM active_users), 2) END)
  ) INTO r;
  RETURN r;
END; $$;

-- ============ monetization ============
CREATE OR REPLACE FUNCTION public.admin_monetization(p_start date, p_end date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  WITH sub AS (
    SELECT s.*,
           CASE WHEN COALESCE(EXTRACT(EPOCH FROM (s.current_period_end - s.current_period_start)) / 86400, 30) > 200
                THEN 'year' ELSE 'month' END AS plan_interval,
           COALESCE(pp.unit_amount, 0) AS amount,
           COALESCE(pp.currency, 'usd') AS currency
    FROM public.subscriptions s
    LEFT JOIN public.plan_prices pp ON pp.price_id = s.stripe_price_id
  ),
  users_total AS (SELECT count(*)::numeric AS n FROM auth.users u WHERE (u.created_at AT TIME ZONE 'UTC')::date <= p_end),
  first_sub AS (
    SELECT s.user_id, min(s.created_at) AS first_at FROM public.subscriptions s GROUP BY s.user_id
  ),
  upgrade_time AS (
    SELECT EXTRACT(EPOCH FROM (f.first_at - u.created_at)) / 86400.0 AS days
    FROM first_sub f JOIN auth.users u ON u.id = f.user_id
    WHERE f.first_at >= u.created_at
  ),
  months AS (
    SELECT generate_series(date_trunc('month', p_start::timestamp), date_trunc('month', p_end::timestamp), interval '1 month')::date AS m
  ),
  mrr_trend AS (
    SELECT months.m,
           round(COALESCE(sum(CASE WHEN sub.plan_interval = 'year' THEN sub.amount / 12.0 ELSE sub.amount END), 0)::numeric, 2) AS mrr
    FROM months
    LEFT JOIN sub ON sub.created_at < (months.m + interval '1 month')
                 AND (sub.canceled_at IS NULL OR sub.canceled_at >= months.m)
    GROUP BY months.m
  ),
  upgrade_src AS (
    SELECT COALESCE(e.metadata->>'source', 'unknown') AS source, count(*)::int AS clicks,
           count(DISTINCT e.user_id)::int AS users
    FROM public.analytics_events e
    WHERE e.event_name = 'upgrade_clicked'
      AND e.created_at >= p_start::timestamptz AND e.created_at < (p_end + 1)::timestamptz
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'total_users', (SELECT n FROM users_total),
    'paying_users', (SELECT count(DISTINCT user_id) FROM sub WHERE status = 'active'),
    'free_to_paid_rate', CASE WHEN (SELECT n FROM users_total) = 0 THEN 0
      ELSE round(100.0 * (SELECT count(DISTINCT user_id) FROM sub WHERE status = 'active') / (SELECT n FROM users_total), 1) END,
    'avg_days_to_upgrade', (SELECT COALESCE(round(avg(days)::numeric, 1), 0) FROM upgrade_time),
    'median_days_to_upgrade', (SELECT COALESCE(round((percentile_cont(0.5) WITHIN GROUP (ORDER BY days))::numeric, 1), 0) FROM upgrade_time),
    'mrr', (SELECT round(COALESCE(sum(CASE WHEN plan_interval = 'year' THEN amount / 12.0 ELSE amount END), 0)::numeric, 2)
            FROM sub WHERE status = 'active'),
    'currency', (SELECT COALESCE(max(currency), 'usd') FROM sub WHERE status = 'active'),
    'prices_configured', (SELECT count(*) FROM public.plan_prices WHERE unit_amount > 0),
    'mrr_trend', (SELECT COALESCE(jsonb_agg(jsonb_build_object('month', m, 'mrr', mrr) ORDER BY m), '[]'::jsonb) FROM mrr_trend),
    'upgrade_sources', (SELECT COALESCE(jsonb_agg(jsonb_build_object('source', source, 'clicks', clicks, 'users', users) ORDER BY clicks DESC), '[]'::jsonb) FROM upgrade_src)
  ) INTO r;
  RETURN r;
END; $$;

REVOKE EXECUTE ON FUNCTION public.admin_sessions_base(date, date) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_source_of(text, text, text) FROM anon;