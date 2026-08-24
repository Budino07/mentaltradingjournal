REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_kpis() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_kpis() TO authenticated;

REVOKE ALL ON FUNCTION public.admin_growth_series(date, date, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_growth_series(date, date, text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_active_users(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_active_users(date, date) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_sessions_series(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_sessions_series(date, date) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_feature_usage(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_feature_usage(date, date) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_cohort_retention(int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_cohort_retention(int, int) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_churn_trend(int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_churn_trend(int) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_user_list(text, text, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_list(text, text, int) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_user_timeline(uuid, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_timeline(uuid, int) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_activity(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;