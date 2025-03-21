interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey?: string;
    fill?: string;
    payload?: any;
    loss?: number;
  }>;
  label?: string;
  valueFormatter?: (value: number) => string;
}

export const CustomTooltip = ({ active, payload, label, valueFormatter }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  // Filter out duplicate entries with the same name
  // This keeps only the first occurrence of each unique name
  const uniquePayload = payload.reduce((acc: any[], current) => {
    if (!acc.find(item => item.name === current.name)) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <div className="bg-black/90 dark:bg-background/90 border border-border/50 rounded-lg shadow-lg p-3 animate-in fade-in-0 zoom-in-95 backdrop-blur-sm">
      <div className="flex flex-col gap-2">
        <p className="font-medium text-sm text-white dark:text-foreground mb-1 border-b border-white/10 pb-1.5">{label}</p>
        
        {uniquePayload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ 
                backgroundColor: entry.color || entry.fill || '#9b87f5',
                boxShadow: '0 0 6px rgba(155, 135, 245, 0.6)'
              }}
            />
            <span className="text-white/75 dark:text-muted-foreground">
              {entry.name}:
            </span>
            <span className="font-medium text-white dark:text-foreground">
              {valueFormatter 
                ? valueFormatter(entry.value) 
                : `${entry.value.toFixed(1)}${entry.dataKey?.toLowerCase().includes('percentage') ? '%' : '%'}`}
            </span>
          </div>
        ))}
        
        {/* Display Net P&L if available in the payload */}
        {uniquePayload[0]?.payload?.dailyPnL !== undefined && (
          <div className="flex items-center gap-2 text-sm mt-1 pt-1.5 border-t border-white/10">
            <div className={`w-2.5 h-2.5 rounded-full ${uniquePayload[0].payload.dailyPnL >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-white/75 dark:text-muted-foreground">Daily P&L:</span>
            <span className={`font-medium ${uniquePayload[0].payload.dailyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {valueFormatter 
                ? valueFormatter(uniquePayload[0].payload.dailyPnL)
                : `$${uniquePayload[0].payload.dailyPnL.toFixed(2)}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
