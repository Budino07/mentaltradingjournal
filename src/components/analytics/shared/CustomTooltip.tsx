
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey?: string;
    fill?: string;
    payload?: any;
  }>;
  label?: string;
  valueFormatter?: (value: number) => string;
}

export const CustomTooltip = ({ active, payload, label, valueFormatter }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-black/90 dark:bg-background/90 border border-border/50 rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
      <p className="font-medium text-sm text-white dark:text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="text-white/75 dark:text-muted-foreground">
            {entry.name}:
          </span>
          <span className="font-medium text-white dark:text-foreground">
            {valueFormatter ? valueFormatter(entry.value) : `${entry.value}${entry.dataKey?.toLowerCase().includes('percentage') ? '%' : ''}`}
          </span>
        </div>
      ))}
      
      {/* Display Net P&L if available in the payload */}
      {payload[0]?.payload?.pnl !== undefined && (
        <div className="flex items-center gap-2 text-sm mt-1">
          <div className="w-2 h-2 rounded-full bg-transparent" />
          <span className="text-white/75 dark:text-muted-foreground">Net P&L:</span>
          <span className={`font-medium ${payload[0].payload.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${payload[0].payload.pnl.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};
