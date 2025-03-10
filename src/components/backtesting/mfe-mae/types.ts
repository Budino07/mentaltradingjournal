
export interface ChartData {
  id: string;
  mfeRelativeToTp: number;
  maeRelativeToSl: number;
  instrument: string;
  rMultiple: number;
  capturedMove: number;
}

export interface Stats {
  tradesHitTp: number;
  tradesHitSl: number;
  avgUpdrawWinner: number;
  avgUpdrawLoser: number;
  avgDrawdownWinner: number;
  avgDrawdownLoser: number;
}
