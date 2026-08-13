import { MarketSession, MARKET_SESSIONS } from "./sessionData";
import { WORLD_LAND_PATH } from "./worldGeo";

interface WorldMapProps {
  activeSessions: MarketSession[];
}

/** Great-circle-ish arc between two points on the flat map */
const arcPath = (a: MarketSession, b: MarketSession) => {
  const mx = (a.x + b.x) / 2;
  const my = Math.min(a.y, b.y) - Math.abs(a.x - b.x) * 0.18 - 20;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
};

export const WorldMap = ({ activeSessions }: WorldMapProps) => {
  const activeNames = new Set(activeSessions.map((s) => s.name));
  // Route through all four pins in trading-day order, closing the loop back to the first
  const route = MARKET_SESSIONS.map((s, i) => [s, MARKET_SESSIONS[(i + 1) % MARKET_SESSIONS.length]] as const);

  return (
    <svg
      viewBox="0 0 1000 500"
      className="w-full h-full"
      role="img"
      aria-label="World map with trading session markers"
    >
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="1000" height="500" fill="url(#mapGlow)" />

      {/* graticule */}
      {[0, 125, 250, 375, 500].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y} stroke="currentColor" strokeOpacity="0.06" />
      ))}
      {[0, 200, 400, 600, 800, 1000].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" stroke="currentColor" strokeOpacity="0.06" />
      ))}

      <path
        d={WORLD_LAND_PATH}
        className="fill-primary/20 stroke-primary/30"
        strokeWidth="0.8"
        strokeLinejoin="round"
        fillRule="evenodd"
      />

      {route.map(([a, b]) => {
        const hot = activeNames.has(a.name) || activeNames.has(b.name);
        return (
          <path
            key={`${a.name}-${b.name}`}
            d={arcPath(a, b)}
            fill="none"
            className={hot ? "stroke-primary/70" : "stroke-muted-foreground/30"}
            strokeWidth={hot ? 2.5 : 1.5}
            strokeDasharray="10 10"
          />
        );
      })}

      {MARKET_SESSIONS.map((s) => {
        const isActive = activeNames.has(s.name);
        return (
          <g key={s.name}>
            {isActive && <circle cx={s.x} cy={s.y} r="34" className="fill-primary/25 animate-ping" />}
            <circle
              cx={s.x}
              cy={s.y}
              r="22"
              className={isActive ? "fill-primary/30 stroke-primary" : "fill-muted stroke-border"}
              strokeWidth="2"
            />
            <text x={s.x} y={s.y + 9} textAnchor="middle" fontSize="26">
              {s.flag}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
