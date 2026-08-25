CREATE TABLE public.broker_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL,
  name text,
  server text NOT NULL,
  login text NOT NULL,
  provider text NOT NULL DEFAULT 'metaapi',
  provider_account_id text,
  state text NOT NULL DEFAULT 'pending',
  connection_status text,
  balance numeric,
  equity numeric,
  currency text,
  last_sync_at timestamptz,
  sync_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, server, login)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.broker_accounts TO authenticated;
GRANT ALL ON public.broker_accounts TO service_role;

ALTER TABLE public.broker_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own broker accounts"
  ON public.broker_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.imported_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  broker_account_id uuid NOT NULL REFERENCES public.broker_accounts(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  symbol text,
  direction text,
  volume numeric,
  open_price numeric,
  close_price numeric,
  open_time timestamptz,
  close_time timestamptz,
  profit numeric,
  commission numeric,
  swap numeric,
  stop_loss numeric,
  take_profit numeric,
  comment text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (broker_account_id, external_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.imported_trades TO authenticated;
GRANT ALL ON public.imported_trades TO service_role;

ALTER TABLE public.imported_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own imported trades"
  ON public.imported_trades FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_imported_trades_user_close ON public.imported_trades (user_id, close_time DESC);
CREATE INDEX idx_imported_trades_account ON public.imported_trades (broker_account_id);

CREATE TRIGGER set_broker_accounts_updated_at
  BEFORE UPDATE ON public.broker_accounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_imported_trades_updated_at
  BEFORE UPDATE ON public.imported_trades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();