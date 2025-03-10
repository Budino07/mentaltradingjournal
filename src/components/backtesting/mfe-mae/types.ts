
export interface ChartData {
  id: string;
  mfeRelativeToTp: number;
  maeRelativeToSl: number;
  instrument: string;
  rMultiple: number;
  capturedMove: number;
  journalEntryId?: string; // Add journal entry ID for navigation
  entryDate?: string; // Add entry date for display
}

export interface Stats {
  tradesHitTp: number;
  tradesHitSl: number;
  avgUpdrawWinner: number;
  avgUpdrawLoser: number;
  avgDrawdownWinner: number;
  avgDrawdownLoser: number;
}
