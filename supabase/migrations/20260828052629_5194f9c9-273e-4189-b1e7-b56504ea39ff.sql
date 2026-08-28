CREATE OR REPLACE FUNCTION public.is_capital_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
     AND EXISTS (
       SELECT 1 FROM auth.users u
       WHERE u.id = auth.uid()
         AND lower(u.email) = 'edwardhong.bk@gmail.com'
     );
$$;

CREATE OR REPLACE FUNCTION public.admin_trader_stats(p_start date DEFAULT '2000-01-01'::date, p_end date DEFAULT '2999-01-01'::date)
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  total_rows bigint,
  missing_pnl bigint,
  missing_exit bigint,
  missing_stop bigint,
  points jsonb
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_capital_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  WITH raw AS (
    SELECT je.user_id AS uid,
           e.trade AS t,
           COALESCE(
             NULLIF(e.trade->>'exitDate','')::timestamptz,
             NULLIF(e.trade->>'entryDate','')::timestamptz,
             je.created_at
           ) AS ts,
           NULLIF(e.trade->>'pnl','')::numeric AS pnl
    FROM public.journal_entries je,
         LATERAL unnest(je.trades) AS e(trade)
    WHERE je.trades IS NOT NULL
  ),
  scoped AS (
    SELECT * FROM raw
    WHERE (ts AT TIME ZONE 'UTC')::date BETWEEN p_start AND p_end
  ),
  agg AS (
    SELECT s.uid,
           count(*)::bigint AS total_rows,
           count(*) FILTER (WHERE s.pnl IS NULL)::bigint AS missing_pnl,
           count(*) FILTER (WHERE NULLIF(s.t->>'exitDate','') IS NULL)::bigint AS missing_exit,
           count(*) FILTER (WHERE NULLIF(s.t->>'stopLoss','') IS NULL)::bigint AS missing_stop,
           COALESCE(jsonb_agg(
             jsonb_build_object('ts', s.ts, 'pnl', s.pnl)
             ORDER BY s.ts
           ) FILTER (WHERE s.pnl IS NOT NULL), '[]'::jsonb) AS points
    FROM scoped s
    GROUP BY s.uid
  )
  SELECT a.uid,
         u.email::text,
         p.full_name,
         a.total_rows,
         a.missing_pnl,
         a.missing_exit,
         a.missing_stop,
         a.points
  FROM agg a
  JOIN auth.users u ON u.id = a.uid
  LEFT JOIN public.profiles p ON p.id = a.uid;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_trader_trades(p_user_id uuid)
RETURNS TABLE(
  trade_id text,
  ts timestamptz,
  entry_ts timestamptz,
  symbol text,
  direction text,
  entry_price numeric,
  exit_price numeric,
  quantity numeric,
  stop_loss numeric,
  take_profit numeric,
  pnl numeric,
  setup text,
  notes text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_capital_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT COALESCE(NULLIF(e.trade->>'id',''), je.id::text || ':' || ord::text),
         COALESCE(
           NULLIF(e.trade->>'exitDate','')::timestamptz,
           NULLIF(e.trade->>'entryDate','')::timestamptz,
           je.created_at
         ),
         NULLIF(e.trade->>'entryDate','')::timestamptz,
         NULLIF(e.trade->>'instrument',''),
         NULLIF(e.trade->>'direction',''),
         NULLIF(e.trade->>'entryPrice','')::numeric,
         NULLIF(e.trade->>'exitPrice','')::numeric,
         NULLIF(e.trade->>'quantity','')::numeric,
         NULLIF(e.trade->>'stopLoss','')::numeric,
         NULLIF(e.trade->>'takeProfit','')::numeric,
         NULLIF(e.trade->>'pnl','')::numeric,
         NULLIF(e.trade->>'setup',''),
         NULLIF(e.trade->>'notes','')
  FROM public.journal_entries je,
       LATERAL unnest(je.trades) WITH ORDINALITY AS e(trade, ord)
  WHERE je.user_id = p_user_id
    AND je.trades IS NOT NULL
  ORDER BY 2;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_trader_stats(date, date) FROM anon;
REVOKE ALL ON FUNCTION public.admin_trader_trades(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_capital_admin() FROM anon;