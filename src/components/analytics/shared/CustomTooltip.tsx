
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

  return (
    <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl p-3 animate-in fade-in-0 zoom-in-95">
      <p className="font-medium text-sm text-white mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="text-white/75">
            {entry.name}:
          </span>
          <span className="font-medium text-white">
            {valueFormatter 
              ? valueFormatter(entry.value) 
              : entry.dataKey?.toLowerCase().includes('frequency')
                ? `${entry.value.toFixed(1)}%`
                : entry.dataKey?.toLowerCase().includes('percentage') 
                  ? `${entry.value.toFixed(1)}%` 
                  : entry.value.toFixed(1)}
          </span>
        </div>
      ))}
      
      {/* Display Net P&L if available in the payload */}
      {payload[0]?.payload?.dailyPnL !== undefined && (
        <div className="flex items-center gap-2 text-sm mt-1 pt-1 border-t border-white/10">
          <div className="w-2 h-2 rounded-full" 
               style={{ backgroundColor: payload[0].payload.dailyPnL >= 0 ? '#34D399' : '#F87171' }} />
          <span className="text-white/75">Daily P&L:</span>
          <span className={`font-medium ${payload[0].payload.dailyPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${payload[0].payload.dailyPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
      )}
    </div>
  );
};
