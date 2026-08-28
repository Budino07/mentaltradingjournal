# Trader Performance Analytics (Admin-only)

## What your data actually looks like

There is no `trades` table. Real trades live as a JSONB array inside `journal_entries.trades`, one row per journal entry.

- 3,056 journal entries, 1,909 trades, 79 distinct traders with trades, 126 users with journals.
- `imported_trades` and `broker_accounts` exist but are **empty** (0 rows) — the CSV import flow hasn't been used yet.
- `backtesting_sessions` (98 rows) is simulated practice data, not live trading — excluded by default.

Field coverage across the 1,909 trades:

| Field | Present | Notes |
|---|---|---|
| pnl | 1,832 (96%) | primary metric, self-reported |
| exitDate | 1,796 (94%) | needed for time-ordering / equity curve |
| direction | 1,715 (90%) | long/short |
| entryPrice | 1,503 (79%) | |
| quantity | 1,403 (73%) | lots, not dollars |
| exitPrice | 1,176 (62%) | |
| stopLoss | 1,074 (56%) | enables R-multiple risk |
| fees/commission | 0 | never captured |

## What's missing (will NOT be faked)

1. **Account balance per trade** — nothing anywhere. `broker_accounts.balance` is empty, `backtesting_sessions.start_balance` is backtest-only. So:
   - "% return relative to account balance" → shown as **Unavailable** unless you enter a starting balance manually per trader (I'll add an admin-editable override field).
   - "Position size as % of balance" → **Unavailable** for the same reason.
2. **Fees/commissions** — never recorded, so all P&L is gross; labelled as such.
3. **Contract/point value per symbol** — `quantity` is in lots and P&L is self-reported, so quantity and P&L can't be reconciled into a dollar risk. Risk per trade is instead expressed as **R-multiples** using `stopLoss` where present (56% of trades).
4. **Verification** — every number is self-reported by the user, with no broker feed. This gets a permanent banner on the page.

## Page structure

```text
/admin/traders                 Leaderboard: sortable table, all traders
/admin/traders/:userId         Detail: metrics, equity curve, monthly, trade log, simulator
```
Both live under the existing `AdminRoute` guard + `has_role(auth.uid(),'admin')`, same as the rest of `/admin`.

### Leaderboard
Sortable on every column: trader (email/name), trades, net P&L, win rate, profit factor, avg win, avg loss, win/loss ratio, max drawdown, drawdown duration (days), trades/week, longest win streak, longest loss streak, months traded, consistency (share of profitable months). Search box, min-trade-count filter, CSV export.

### Trader detail
- Metric cards: all of the above + monthly breakdown bar chart.
- Equity curve: cumulative P&L over exit date, with the max-drawdown span shaded.
- Monthly P&L table/bars (consistency vs. one lucky streak).
- Trade log table: date, symbol, direction, entry, exit, qty, stop, P&L, R-multiple.
- Data-quality strip: how many of that trader's trades lack pnl/exit/stop, so you know what the metrics rest on.

### Part 2 — Copy-trading simulator (same page, clearly marked "HYPOTHETICAL")
Inputs: starting capital, sizing method (match trader's R-risk % / fixed $ per trade / fixed % of current simulated balance), slippage (bps, default 7.5 bps applied against you on both entry and exit), optional max position cap.
- Sizing method (a) only runs on trades that have a stop loss; trades without one are skipped and counted in a "skipped" note.
- Slippage is applied per trade against the P&L; where entry/exit prices exist it scales off notional, otherwise it's a fixed % haircut on gross P&L, and the fallback is labelled.
- Output: simulated equity curve overlaid on the trader's actual curve, plus a side-by-side metrics table (actual vs. simulated) with delta column.
- Every simulated figure carries a "Hypothetical — not real trades, gross of fees" label.

## Technical notes

- One new security-definer RPC `admin_trader_stats(p_start, p_end)` returning per-trader aggregates from `journal_entries.trades`, guarded by `has_role`; plus `admin_trader_trades(p_user_id)` returning the normalized trade log.
- Streaks, drawdown, monthly breakdown and the entire simulator run client-side in a shared `src/lib/traderMetrics.ts` so the leaderboard and the simulator use identical math.
- New files: `src/pages/admin/Traders.tsx`, `src/pages/admin/TraderDetail.tsx`, `src/components/admin/CopyTradeSimulator.tsx`, `src/lib/traderMetrics.ts`; routes added in `src/App.tsx`, nav item in `AdminSidebar.tsx`.
- Trades are read from `journal_entries.trades` and (when populated) `imported_trades`, unioned; backtesting sessions excluded.
