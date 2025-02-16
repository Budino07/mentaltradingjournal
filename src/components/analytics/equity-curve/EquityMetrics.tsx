
interface EquityMetricsProps {
  initialBalance: number;
  currentBalance: number;
  totalReturn: number;
  maxDrawdown: number;
}

export const EquityMetrics = ({
  initialBalance,
  currentBalance,
  totalReturn,
  maxDrawdown,
}: EquityMetricsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all">
        <p className="text-sm text-muted-foreground">Initial Balance</p>
        <p className="text-lg font-bold">${initialBalance.toLocaleString()}</p>
      </div>
      <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all">
        <p className="text-sm text-muted-foreground">Current Balance</p>
        <p className="text-lg font-bold">${currentBalance.toLocaleString()}</p>
      </div>
      <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all">
        <p className="text-sm text-muted-foreground">Total Return</p>
        <p className={`text-lg font-bold ${totalReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
        </p>
      </div>
      <div className="p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card/70 transition-all">
        <p className="text-sm text-muted-foreground">Max Drawdown</p>
        <p className="text-lg font-bold text-red-500">
          -{maxDrawdown.toFixed(2)}%
        </p>
      </div>
    </div>
  );
};
