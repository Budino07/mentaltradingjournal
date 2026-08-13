export interface MarketSession {
  name: string;
  timeZone: string;
  flag: string;
  /** UTC open/close hours (close may wrap past midnight) */
  open: number;
  close: number;
  /** map coordinates on a 1000x500 equirectangular viewBox (see worldGeo.ts) */
  x: number;
  y: number;
}

/** Ordered by session start in the 24h UTC trading day: Sydney -> Tokyo -> London -> New York */
export const MARKET_SESSIONS: MarketSession[] = [
  { name: "Sydney", timeZone: "Australia/Sydney", flag: "🇦🇺", open: 22, close: 7, x: 920, y: 409.3 },
  { name: "Tokyo", timeZone: "Asia/Tokyo", flag: "🇯🇵", open: 0, close: 9, x: 888, y: 167.8 },
  { name: "London", timeZone: "Europe/London", flag: "🇬🇧", open: 8, close: 17, x: 499.6, y: 112.8 },
  { name: "New York", timeZone: "America/New_York", flag: "🇺🇸", open: 13, close: 22, x: 294.4, y: 150.3 },
];

export const isSessionActive = (session: MarketSession, utcHours: number) =>
  session.open < session.close
    ? utcHours >= session.open && utcHours < session.close
    : utcHours >= session.open || utcHours < session.close;

/** Every session currently open (sessions overlap, e.g. London + New York) */
export const getActiveSessions = (utcHours: number) =>
  MARKET_SESSIONS.filter((s) => isSessionActive(s, utcHours));

export const hoursUntilOpen = (session: MarketSession, utcHours: number) => {
  const diff = session.open - utcHours;
  return diff > 0 ? diff : diff + 24;
};

export const hoursUntilClose = (session: MarketSession, utcHours: number) => {
  const diff = session.close - utcHours;
  return diff > 0 ? diff : diff + 24;
};

export const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h ${m}m`;
};

export const localTime = (timeZone: string, date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
