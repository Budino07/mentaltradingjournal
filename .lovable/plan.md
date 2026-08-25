# Full-Funnel Admin Analytics

Extends the existing admin console (Overview, Growth, Engagement, Retention, Users) into a complete funnel view: Reach → Engagement → Sign-up → Activation → Retention → Monetization → Takeaways.

## What's missing today (and why)

The current tracker only fires inside the logged-in app shell, and it records just `path` + `user_id` + `session_id`. So there is no data yet for:

- Anonymous visitors on the landing / pricing / features pages
- Traffic source (referrer, UTM tags), device type, browser
- Bounce rate, pages per session, landing/exit page
- Sign-up method (email vs Google), and whether a visitor signed up in their first session
- Ad impressions — these live in Reddit/X/Google Ads, not in our app; nothing can be inferred without connecting those platforms

Everything below either uses existing data or starts collecting the missing pieces now. Metrics that need new tracking will fill in from the moment this ships, and each panel will say so instead of showing a fake number.

## Tracking upgrade

- Track page views on **public** pages too (landing, pricing, features, login) for anonymous visitors, with a persistent `visitor_id` cookie so a visitor can be tied to their later sign-up.
- Capture per-event: `referrer`, `utm_source/medium/campaign`, `device_type` (mobile/tablet/desktop), `is_first_visit`, plus session sequence number so bounce and pages-per-session are computable.
- Fire explicit funnel events: `signup_started`, `signup_completed` (with method), `first_journal_entry`, `upgrade_prompt_shown`, `upgrade_clicked` (with source: pricing page / in-app nudge / paywall).
- Backfill nothing that would be invented — historical rows stay as they are.

## New admin sections

**Acquisition** (new page)
- Unique visitors, total visits, new vs returning
- Traffic source breakdown (organic / direct / social / referral / paid) from referrer + UTM
- Top landing pages and top referrers, each with visits, sign-up rate, bounce rate
- Paid campaign table with an optional manual "impressions spent" input per campaign so CTR (impressions → visits) can be shown; without connecting the ad platforms this is the only honest way to get impressions

**Engagement** (extend existing page)
- Average session duration, pages per session, bounce rate
- Highest-bounce pages table
- Device breakdown (mobile / tablet / desktop) with per-device session duration and sign-up rate

**Funnel** (new page)
- Visitor → sign-up → first journal entry → 2nd session → paid, as a step chart with drop-off % at each step
- Sign-up method split (email vs Google)
- Time from first visit to sign-up (same session / same day / 2-7 days / later)
- Activation: % of new sign-ups logging a trade within 24h and within 7 days, % returning for a 2nd session within 7 days, and the stall point where most new users stop

**Retention** (extend existing page)
- Day 1 / Day 7 / Day 30 retention cards alongside the existing cohort grid
- Weekly active users trend
- Average trades logged per active user

**Monetization** (new page)
- Free → paid conversion rate, average time from sign-up to upgrade
- Which upgrade surface converts best (pricing page vs in-app nudge vs paywall)
- MRR and MRR trend, derived from active subscriptions and plan interval
- Keeps the existing subscription-lifetime and cancellation-reason panels

**Key Takeaways** (new page)
- Auto-generated from the numbers above: top 3 strengths, top 3 funnel leaks (largest drop-off steps), and 2-3 concrete recommendations tied to the worst-performing step. Rules-based, computed in the browser from the same RPC results — no guessing, and each statement cites the metric behind it.

## Technical notes

- Migration adds columns to `analytics_events` (`referrer`, `utm_source`, `utm_medium`, `utm_campaign`, `device_type`, `visitor_id`, `event_index`) plus indexes, and an `ad_campaigns` table (admin-only) for manually entered impressions/spend.
- New security-definer RPCs, all gated on `has_role(auth.uid(),'admin')`: `admin_acquisition`, `admin_traffic_sources`, `admin_landing_pages`, `admin_engagement_quality`, `admin_device_breakdown`, `admin_signup_funnel`, `admin_activation`, `admin_retention_dn`, `admin_monetization`.
- Client: new pages under `src/pages/admin/`, hooks appended to `useAdminAnalytics.ts`, charts reusing `AdminCharts.tsx`, new sidebar entries. All respect the existing date-range + segment context.
- Anonymous inserts into `analytics_events` need an insert policy for `anon`; reads stay admin-only.

## Rollout

Because of the volume, this ships in three passes: (1) tracking upgrade + migration, (2) Acquisition + Engagement + Funnel, (3) Monetization + Retention additions + Key Takeaways.
