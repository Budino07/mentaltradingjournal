ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS referrer text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS device_type text,
  ADD COLUMN IF NOT EXISTS visitor_id text,
  ADD COLUMN IF NOT EXISTS event_index integer;

CREATE INDEX IF NOT EXISTS analytics_events_visitor_idx ON public.analytics_events (visitor_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_session_created_idx ON public.analytics_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_name_idx ON public.analytics_events (event_name, created_at);

GRANT INSERT ON public.analytics_events TO anon;

DROP POLICY IF EXISTS "Anonymous visitors can insert analytics events" ON public.analytics_events;
CREATE POLICY "Anonymous visitors can insert analytics events"
ON public.analytics_events FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  channel text NOT NULL DEFAULT 'other',
  utm_campaign text,
  impressions bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  spend numeric NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ad_campaigns TO authenticated;
GRANT ALL ON public.ad_campaigns TO service_role;

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage ad campaigns" ON public.ad_campaigns;
CREATE POLICY "Admins manage ad campaigns"
ON public.ad_campaigns FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS set_timestamp ON public.ad_campaigns;
CREATE TRIGGER set_timestamp BEFORE UPDATE ON public.ad_campaigns
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();