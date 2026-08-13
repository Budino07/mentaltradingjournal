import { MARKET_SESSIONS, MarketSession } from "./sessionData";

// Stylized low-poly landmasses on a 1000x500 equirectangular canvas
const LANDMASSES = [
  // North America
  "M120,70 L250,55 L320,80 L300,120 L270,135 L250,180 L210,215 L180,190 L150,140 L110,110 Z",
  // Central America
  "M250,180 L280,205 L300,240 L275,235 L245,200 Z",
  // South America
  "M300,240 L345,235 L360,290 L340,360 L310,410 L295,370 L285,300 Z",
  // Greenland
  "M395,35 L455,30 L465,70 L420,85 L390,60 Z",
  // Europe
  "M480,70 L560,60 L590,95 L555,130 L505,125 L478,100 Z",
  // Africa
  "M490,150 L580,140 L610,190 L590,255 L545,320 L515,290 L495,215 Z",
  // Asia
  "M590,55 L820,45 L890,95 L860,140 L790,165 L720,150 L660,175 L620,140 L595,100 Z",
  // India / SE Asia
  "M700,160 L745,165 L735,215 L705,200 Z",
  "M790,175 L845,185 L835,225 L795,210 Z",
  // Australia
  "M860,300 L940,295 L950,345 L905,375 L865,345 Z",
  // Japan
  "M878,130 L900,120 L905,155 L884,162 Z",
];

interface WorldMapProps {
  activeSession?: MarketSession;
  nextSession?: MarketSession;
}

export const WorldMap = ({ activeSession, nextSession }: WorldMapProps) => {
  const arc =
    activeSession && nextSession
      ? `M${activeSession.x},${activeSession.y} Q${(activeSession.x + nextSession.x) / 2},${
          Math.min(activeSession.y, nextSession.y) - 80
        } ${nextSession.x},${nextSession.y}`
      : null;

  return (
    <svg viewBox="0 0 1000 500" className="w-full h-full" role="img" aria-label="World map with trading session markers">
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

      {LANDMASSES.map((d, i) => (
        <path
          key={i}
          d={d}
          className="fill-primary/20 stroke-primary/30"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      ))}

      {arc && (
        <path
          d={arc}
          fill="none"
          className="stroke-primary/60"
          strokeWidth="2"
          strokeDasharray="10 10"
        />
      )}

      {MARKET_SESSIONS.map((s) => {
        const isActive = activeSession?.name === s.name;
        return (
          <g key={s.name}>
            {isActive && (
              <circle cx={s.x} cy={s.y} r="34" className="fill-primary/25 animate-ping" />
            )}
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
