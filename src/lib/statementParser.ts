/**
 * Parsers for broker statements (MT5 / MT4 exports).
 * Supports:
 *  - CSV / TSV exports (fuzzy header matching)
 *  - MT4/MT5 HTML statement files (the "Positions" / "Closed Transactions" table)
 */

export interface ParsedTrade {
  external_id: string;
  symbol: string | null;
  direction: string | null;
  volume: number | null;
  open_price: number | null;
  close_price: number | null;
  open_time: string | null;
  close_time: string | null;
  profit: number | null;
  commission: number | null;
  swap: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  comment: string | null;
  raw: Record<string, unknown>;
}

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "");

const FIELD_ALIASES: Record<keyof Omit<ParsedTrade, "raw" | "external_id">, string[]> = {
  symbol: ["symbol", "instrument", "pair", "item", "market"],
  direction: ["type", "direction", "side", "action", "buysell"],
  volume: ["volume", "size", "lots", "lot", "quantity", "qty"],
  open_price: ["openprice", "entryprice", "priceopen", "entry", "pricein"],
  close_price: ["closeprice", "exitprice", "priceclose", "exit", "priceout"],
  open_time: ["opentime", "entrytime", "timeopen", "opendate", "entrydate", "time", "date"],
  close_time: ["closetime", "exittime", "timeclose", "closedate", "exitdate"],
  profit: ["profit", "pnl", "netprofit", "pl", "gross", "grossprofit", "result"],
  commission: ["commission", "commissions", "fee", "fees"],
  swap: ["swap", "rollover", "interest", "storage"],
  stop_loss: ["sl", "stoploss"],
  take_profit: ["tp", "takeprofit"],
  comment: ["comment", "notes", "note"],
};

const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\s|\u00a0/g, "").replace(/[^0-9.,+-]/g, "");
  if (!s) return null;
  // Handle "1 234,56" / "1,234.56"
  let cleaned = s;
  if (s.includes(",") && s.includes(".")) {
    cleaned = s.lastIndexOf(",") > s.lastIndexOf(".")
      ? s.replace(/\./g, "").replace(",", ".")
      : s.replace(/,/g, "");
  } else if (s.includes(",")) {
    cleaned = /,\d{1,2}$/.test(s) ? s.replace(",", ".") : s.replace(/,/g, "");
  }
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
};

const toIso = (v: unknown): string | null => {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  // MT formats: 2024.05.13 09:31:22 or 2024-05-13 09:31
  const m = s.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})[ T]?(\d{1,2})?:?(\d{2})?:?(\d{2})?/);
  if (m) {
    const [, y, mo, d, h = "0", mi = "0", sec = "0"] = m;
    const dt = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +sec));
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt.toISOString();
};

const directionOf = (v: unknown): string | null => {
  const s = String(v ?? "").toLowerCase();
  if (/\bsell|short\b/.test(s)) return "sell";
  if (/\bbuy|long\b/.test(s)) return "buy";
  return null;
};

function splitDelimited(text: string): string[][] {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length) ?? "";
  const delim =
    (firstLine.match(/\t/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
      ? "\t"
      : (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
        ? ";"
        : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === delim) { row.push(cell); cell = ""; continue; }
    if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; continue; }
    if (ch === "\r") continue;
    cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim().length));
}

function mapRows(headers: string[], rows: string[][]): ParsedTrade[] {
  const normHeaders = headers.map(norm);
  const indexFor = (aliases: string[], from = 0) => {
    for (const alias of aliases) {
      const i = normHeaders.findIndex((h, idx) => idx >= from && h === alias);
      if (i !== -1) return i;
    }
    for (const alias of aliases) {
      const i = normHeaders.findIndex((h, idx) => idx >= from && h.includes(alias));
      if (i !== -1) return i;
    }
    return -1;
  };

  const idx: Record<string, number> = {};
  (Object.keys(FIELD_ALIASES) as (keyof typeof FIELD_ALIASES)[]).forEach((key) => {
    idx[key] = indexFor(FIELD_ALIASES[key]);
  });
  // MT5 duplicates "Time" and "Price" columns (open then close)
  if (idx.close_time === -1 && idx.open_time !== -1) {
    idx.close_time = indexFor(["time", "date"], idx.open_time + 1);
  }
  if (idx.close_price === -1 && idx.open_price !== -1) {
    idx.close_price = indexFor(["price"], idx.open_price + 1);
  }
  const ticketIdx = indexFor(["ticket", "position", "dealid", "orderid", "id", "order", "deal"]);

  const get = (row: string[], key: string) =>
    idx[key] >= 0 ? row[idx[key]] : undefined;

  return rows
    .map((row, i) => {
      const raw: Record<string, unknown> = {};
      headers.forEach((h, hi) => { if (h.trim()) raw[h.trim()] = row[hi] ?? ""; });

      const trade: ParsedTrade = {
        external_id: String(
          (ticketIdx >= 0 ? row[ticketIdx] : "") || `row-${i + 1}-${get(row, "open_time") ?? ""}`
        ).trim(),
        symbol: (get(row, "symbol") ?? "").trim() || null,
        direction: directionOf(get(row, "direction")),
        volume: toNumber(get(row, "volume")),
        open_price: toNumber(get(row, "open_price")),
        close_price: toNumber(get(row, "close_price")),
        open_time: toIso(get(row, "open_time")),
        close_time: toIso(get(row, "close_time")),
        profit: toNumber(get(row, "profit")),
        commission: toNumber(get(row, "commission")),
        swap: toNumber(get(row, "swap")),
        stop_loss: toNumber(get(row, "stop_loss")),
        take_profit: toNumber(get(row, "take_profit")),
        comment: (get(row, "comment") ?? "").trim() || null,
        raw,
      };
      return trade;
    })
    .filter((t) => t.symbol || t.profit !== null);
}

export function parseCsvStatement(text: string): ParsedTrade[] {
  const rows = splitDelimited(text);
  if (!rows.length) return [];
  // Find the header row: the first row containing a recognisable field name
  const headerIdx = rows.findIndex((r) => {
    const n = r.map(norm);
    return n.some((c) => ["symbol", "instrument", "pair"].includes(c)) &&
      n.some((c) => ["profit", "pnl", "type", "volume", "lots"].some((k) => c.includes(k)));
  });
  if (headerIdx === -1) return [];
  const headers = rows[headerIdx];
  const body = rows.slice(headerIdx + 1).filter((r) => r.length >= Math.min(3, headers.length));
  return mapRows(headers, body);
}

export function parseHtmlStatement(html: string): ParsedTrade[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const tables = Array.from(doc.querySelectorAll("table"));
  const results: ParsedTrade[] = [];

  for (const table of tables) {
    const rows = Array.from(table.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th,td")).map((td) =>
        (td.textContent ?? "").replace(/\u00a0/g, " ").trim()
      )
    );
    const headerIdx = rows.findIndex((r) => {
      const n = r.map(norm);
      return n.some((c) => ["symbol", "instrument", "item"].includes(c)) &&
        n.some((c) => c.includes("profit") || c.includes("volume") || c.includes("size"));
    });
    if (headerIdx === -1) continue;
    const headers = rows[headerIdx];
    const body: string[][] = [];
    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      if (r.length < Math.max(3, Math.floor(headers.length / 2))) break;
      body.push(r);
    }
    results.push(...mapRows(headers, body));
  }
  return results;
}

export function parseStatement(fileName: string, text: string): ParsedTrade[] {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".htm") || lower.endsWith(".html") || /<table/i.test(text)) {
    const html = parseHtmlStatement(text);
    if (html.length) return html;
  }
  return parseCsvStatement(text);
}
