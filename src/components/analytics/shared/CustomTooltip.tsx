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
  valueFormatter?: (value: number) => string;
}

export const CustomTooltip = ({ active, payload, label, valueFormatter }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

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
            {valueFormatter ? valueFormatter(entry.value) : `${entry.value}${entry.dataKey?.toLowerCase().includes('percentage') ? '%' : ''}`}
          </span>
        </div>
      ))}
    </div>
  );
};