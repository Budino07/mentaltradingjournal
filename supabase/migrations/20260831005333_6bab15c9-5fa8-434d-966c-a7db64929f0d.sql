GRANT SELECT, INSERT, UPDATE, DELETE ON public.broker_accounts TO authenticated;
GRANT ALL ON public.broker_accounts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.imported_trades TO authenticated;
GRANT ALL ON public.imported_trades TO service_role;