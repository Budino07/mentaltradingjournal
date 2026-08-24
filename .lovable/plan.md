# Admin Analytics Console

A private admin console at `/admin`, visible only to your account, with KPIs, growth, engagement, retention/churn, and a user explorer.

## Important: your app doesn't track activity yet

Today the database stores users and their trading data, but nothing records logins, page views, or sessions. So DAU/WAU/MAU, sessions, feature usage, retention and churn can't be computed from what exists.

Two parts to fix that:

1. **Start tracking now** — a lightweight event tracker fires on every route change and key action (journal entry saved, backtest run, note created, etc.) and writes to a new `analytics_events` table with a session id. From the moment this ships, real engagement data accumulates.
2. **Backfill history** — so the dashboard isn't empty on day one, historical "activity days" are derived from existing timestamps (journal entries, backtesting sessions, notebook notes, weekly reviews, profile signup dates). This gives real signup growth and approximate active-user history immediately. Metrics that need true sessions (session count, average duration, page-level feature usage) will only be accurate going forward, and the UI will label them as such.

## Access control

- New `user_roles` table (`admin` / `user`) with a `has_role()` security-definer function — roles never live on `profiles`.
- Your account (edwardhong.bk@gmail.com) is seeded as `admin`.
- All admin queries run through RLS policies gated on `has_role(auth.uid(), 'admin')`, so nobody else can read other users' data even by calling the API directly. The route guard is only a UI convenience; the real enforcement is in the database.
- `/admin` is hidden from the normal sidebar entirely for non-admins.

## Sections

**Overview** — KPI cards: total users, DAU/WAU/MAU, new signups (today/week/month) with % change vs previous period, 30-day churn rate, N-day retention. Each card shows a big number plus an up/down trend chip.

**Growth** — new signups over time with daily/weekly/monthly toggle, cumulative user line, date-range filter.

**Engagement** — active-user chart (DAU/WAU/MAU), session count and average session duration over time, ranked most-used features table/bar chart (feature, unique users, total uses), and a least-used list.

**Retention & Churn** — cohort retention table (signup week/month cohorts x weeks 1–8, color-shaded), churn-rate trend line, and a churned-users list with a configurable inactivity threshold (14/30/60/90 days).

**Users** — searchable, sortable table: email/name, signup date, last active, session count, plan, status (active / inactive / churned). Clicking a row opens that user's activity timeline.

**Filters** — a shared date-range picker and segment filter (plan: free/subscribed) applied across sections via a small context.

## Design

Stripe/Mixpanel-style admin shell: its own collapsible sidebar (Overview, Growth, Engagement, Retention, Users), sticky topbar with date range + segment + dark-mode toggle, card grid with generous whitespace, recharts line/bar charts with hover tooltips, responsive down to mobile. All colors come from existing semantic tokens so light/dark both work.

## Technical notes

- Migration: `app_role` enum, `user_roles` (+grants, RLS, `has_role`), `analytics_events` (user_id, event_name, event_type, path, session_id, metadata jsonb, created_at) with indexes on `(created_at)`, `(user_id, created_at)`, `(session_id)`; insert-own policy for authenticated users, admin-only select.
- Aggregation happens in Postgres via security-definer RPCs (`admin_kpis`, `admin_growth_series`, `admin_active_users`, `admin_feature_usage`, `admin_cohort_retention`, `admin_churn_trend`, `admin_user_list`, `admin_user_timeline`), each asserting `has_role(auth.uid(), 'admin')`. Keeps payloads small and avoids pulling raw rows to the browser.
- Client: `src/pages/admin/*` pages, `src/components/admin/*` (KPI card, chart wrappers, cohort grid, user table), `src/hooks/useAdminAnalytics.ts` (react-query), `AdminRoute` guard in `App.tsx`.
- Tracker: `src/lib/analytics.ts` + `useTrackPageViews` mounted in `AppLayout`; session id in sessionStorage with a 30-minute idle rollover.
