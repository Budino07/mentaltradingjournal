
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey?: string;
    fill?: string;
  }>;
  label?: string;
  valueFormatter?: (value: number, dataKey?: string) => string;
  customProps?: {
    showPnl?: boolean;
  };
}

export const CustomTooltip = ({ active, payload, label, valueFormatter, customProps }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  // For components that show P&L data alongside other metrics
  if (customProps?.showPnl) {
    const tradeData = payload.find(entry => entry.dataKey === 'trades');
    const pnlData = payload.find(entry => entry.dataKey === 'pnl');
    
    if (tradeData && pnlData) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
          <p className="font-medium text-sm text-foreground mb-2">{label}</p>
          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tradeData.color || tradeData.fill }}
            />
            <span className="text-muted-foreground">
              {tradeData.name}:
            </span>
            <span className="font-medium text-foreground">
              {valueFormatter ? valueFormatter(tradeData.value, tradeData.dataKey) : `${tradeData.value}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: pnlData.value >= 0 ? '#10b981' : '#ef4444' }}
            />
            <span className="text-muted-foreground">
              Net P&L:
            </span>
            <span className={`font-medium ${pnlData.value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {valueFormatter ? valueFormatter(pnlData.value, pnlData.dataKey) : `$${pnlData.value.toFixed(2)}`}
            </span>
          </div>
        </div>
      );
    }
  }

  // Default tooltip rendering for other charts
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95">
      <p className="font-medium text-sm text-foreground mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="text-muted-foreground">
            {entry.name}:
          </span>
          <span className="font-medium text-foreground">
            {valueFormatter ? valueFormatter(entry.value, entry.dataKey) : `${entry.value}${entry.dataKey?.toLowerCase().includes('percentage') ? '%' : ''}`}
          </span>
        </div>
      ))}
    </div>
  );
};
