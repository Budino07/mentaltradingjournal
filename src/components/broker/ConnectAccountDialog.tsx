import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileUp, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { parseStatement, ParsedTrade } from "@/lib/statementParser";

interface ConnectAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported?: () => void;
}

type Platform = "mt5" | "mt4" | "ctrader" | "other";

const PLATFORMS: { id: Platform; label: string; description: string; available: boolean }[] = [
  { id: "mt5", label: "MetaTrader 5", description: "Import a CSV or HTML statement exported from MT5", available: true },
  { id: "mt4", label: "MetaTrader 4", description: "Import a CSV or HTML statement exported from MT4", available: true },
  { id: "ctrader", label: "cTrader", description: "Import a CSV statement exported from cTrader", available: true },
  { id: "other", label: "Other broker", description: "Any CSV export with symbol, volume and profit columns", available: true },
];

interface AccountRow {
  id: string;
  name: string | null;
  platform: string;
  login: string;
  server: string;
}

export const ConnectAccountDialog = ({ open, onOpenChange, onImported }: ConnectAccountDialogProps) => {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [targetAccount, setTargetAccount] = useState<string>("new");
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [server, setServer] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedTrade[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setPlatform(null);
      setFile(null);
      setParsed(null);
      setTargetAccount("new");
      setName("");
      setLogin("");
      setServer("");
    }
  }, [open]);

  useEffect(() => {
    const load = async () => {
      if (!user || !open) return;
      const { data } = await supabase
        .from("broker_accounts")
        .select("id, name, platform, login, server")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setAccounts((data as AccountRow[]) ?? []);
    };
    load();
  }, [user, open]);

  const summary = useMemo(() => {
    if (!parsed?.length) return null;
    const wins = parsed.filter((t) => (t.profit ?? 0) > 0).length;
    const net = parsed.reduce(
      (sum, t) => sum + (t.profit ?? 0) + (t.commission ?? 0) + (t.swap ?? 0),
      0
    );
    return { count: parsed.length, wins, net };
  }, [parsed]);

  const handleFile = async (selected: File | null) => {
    setFile(selected);
    setParsed(null);
    if (!selected) return;
    setParsing(true);
    try {
      const text = await selected.text();
      const trades = parseStatement(selected.name, text);
      if (!trades.length) {
        toast.error("No trades found in that file. Make sure it's a statement export with symbol/volume/profit columns.");
        return;
      }
      setParsed(trades);
      if (!name) setName(selected.name.replace(/\.[^.]+$/, ""));
    } catch (error) {
      console.error("Statement parse failed", error);
      toast.error("Couldn't read that file");
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!user || !parsed?.length || !platform) return;
    setSaving(true);
    try {
      let accountId = targetAccount;

      if (targetAccount === "new") {
        const { data, error } = await supabase
          .from("broker_accounts")
          .insert({
            user_id: user.id,
            platform,
            name: name || `${platform.toUpperCase()} import`,
            login: login || "manual",
            server: server || "manual-import",
            provider: "manual_csv",
            state: "connected",
            connection_status: "imported",
          })
          .select("id")
          .single();
        if (error) throw error;
        accountId = data.id;
      }

      const { data: existing } = await supabase
        .from("imported_trades")
        .select("external_id")
        .eq("broker_account_id", accountId);
      const seen = new Set((existing ?? []).map((r) => r.external_id));

      const rows = parsed
        .filter((t) => !seen.has(t.external_id))
        .map((t) => ({
          user_id: user.id,
          broker_account_id: accountId,
          external_id: t.external_id,
          symbol: t.symbol,
          direction: t.direction,
          volume: t.volume,
          open_price: t.open_price,
          close_price: t.close_price,
          open_time: t.open_time,
          close_time: t.close_time,
          profit: t.profit,
          commission: t.commission,
          swap: t.swap,
          stop_loss: t.stop_loss,
          take_profit: t.take_profit,
          comment: t.comment,
          raw: t.raw as never,
        }));

      if (rows.length) {
        const { error } = await supabase.from("imported_trades").insert(rows);
        if (error) throw error;
      }

      await supabase
        .from("broker_accounts")
        .update({ last_sync_at: new Date().toISOString() })
        .eq("id", accountId);

      const skipped = parsed.length - rows.length;
      toast.success(
        `Imported ${rows.length} trade${rows.length === 1 ? "" : "s"}${skipped ? ` (${skipped} already imported)` : ""}`
      );
      onImported?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Import failed", error);
      toast.error("Failed to import trades");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {platform && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -ml-2"
                onClick={() => setPlatform(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            Connect Trading Account
          </DialogTitle>
          <DialogDescription>
            {platform
              ? "Upload a statement export and we'll pull in your closed trades."
              : "Choose the platform your trading account runs on."}
          </DialogDescription>
        </DialogHeader>

        {!platform && (
          <div className="grid gap-2">
            {PLATFORMS.map((p) => (
              <Card
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setPlatform(p.id)}
                onKeyDown={(e) => e.key === "Enter" && setPlatform(p.id)}
                className="p-4 cursor-pointer transition-colors hover:border-primary hover:bg-accent/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{p.label}</p>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <Badge variant="secondary">Statement import</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}

        {platform && (
          <div className="space-y-4">
            {accounts.length > 0 && (
              <div className="space-y-1.5">
                <Label>Import into</Label>
                <Select value={targetAccount} onValueChange={setTargetAccount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New account</SelectItem>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name || a.login} · {a.platform.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {targetAccount === "new" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="acct-name">Account name</Label>
                  <Input
                    id="acct-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Live MT5 – Prop account"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acct-login">Login (optional)</Label>
                  <Input
                    id="acct-login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="12345678"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="acct-server">Server (optional)</Label>
                  <Input
                    id="acct-server"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    placeholder="ICMarkets-Live02"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="statement">Statement file</Label>
              <label
                htmlFor="statement"
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors"
              >
                {parsing ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <FileUp className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {file ? file.name : "Click to select a .csv or .html statement"}
                </span>
                <span className="text-xs text-muted-foreground">
                  In MetaTrader: History tab → right click → Report / Save as Report
                </span>
              </label>
              <Input
                id="statement"
                type="file"
                accept=".csv,.tsv,.txt,.htm,.html"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {summary && (
              <Card className="p-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold">{summary.count}</p>
                  <p className="text-xs text-muted-foreground">Trades found</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {summary.count ? Math.round((summary.wins / summary.count) * 100) : 0}%
                  </p>
                  <p className="text-xs text-muted-foreground">Win rate</p>
                </div>
                <div>
                  <p
                    className={`text-lg font-semibold ${summary.net >= 0 ? "text-emerald-500" : "text-destructive"}`}
                  >
                    {summary.net >= 0 ? "+" : ""}
                    {summary.net.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Net P&amp;L</p>
                </div>
              </Card>
            )}

            <Button
              className="w-full"
              disabled={!parsed?.length || saving}
              onClick={handleImport}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import trades
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
