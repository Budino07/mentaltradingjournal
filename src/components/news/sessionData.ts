export interface MarketSession {
  name: string;
  timeZone: string;
  flag: string;
  /** UTC open/close hours (close may wrap past midnight) */
  open: number;
  close: number;
  /** map coordinates on a 1000x500 equirectangular viewBox */
  x: number;
  y: number;
}

export const MARKET_SESSIONS: MarketSession[] = [
  { name: "Tokyo", timeZone: "Asia/Tokyo", flag: "🇯🇵", open: 0, close: 9, x: 888, y: 151 },
  { name: "Sydney", timeZone: "Australia/Sydney", flag: "🇦🇺", open: 22, close: 7, x: 919, y: 344 },
  { name: "London", timeZone: "Europe/London", flag: "🇬🇧", open: 8, close: 17, x: 500, y: 107 },
  { name: "New York", timeZone: "America/New_York", flag: "🇺🇸", open: 13, close: 22, x: 294, y: 137 },
];

export const isSessionActive = (session: MarketSession, utcHours: number) =>
  session.open < session.close
    ? utcHours >= session.open && utcHours < session.close
    : utcHours >= session.open || utcHours < session.close;

export const hoursUntilOpen = (session: MarketSession, utcHours: number) => {
  const diff = session.open - utcHours;
  return diff >= 0 ? diff : diff + 24;
};

export const localTime = (timeZone: string, date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone,
  }).format(date);
