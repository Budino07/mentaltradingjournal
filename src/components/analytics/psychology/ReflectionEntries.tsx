import React from 'react';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, AlertTriangle, Info } from 'lucide-react';
import { EnhancedEmotionalDataPoint } from '@/utils/psychology/coreNeedsAnalysis';
import { format } from 'date-fns';

interface ReflectionEntriesProps {
  emotionalData: EnhancedEmotionalDataPoint[] | undefined;
  onClose: () => void;
}

export const ReflectionEntries: React.FC<ReflectionEntriesProps> = ({ 
  emotionalData, 
  onClose 
}) => {
  if (!emotionalData || emotionalData.length === 0) {
    return null;
  }
  
  // Since we may now have multiple entries for the same day,
  // we'll display them in a list with separators
  
  const formattedDate = emotionalData[0].date 
    ? format(new Date(emotionalData[0].date), 'MMMM d, yyyy') 
    : 'Unknown Date';
  
  // Calculate total P&L for the day
  const totalPnL = emotionalData.reduce((sum, entry) => sum + entry.tradePnL, 0);
  
  const hasPreTrading = emotionalData.some(entry => entry.preScore !== null);
  const hasPostTrading = emotionalData.some(entry => entry.postScore !== null);
  
  // Check for warnings
  const hasHarmfulPatterns = emotionalData.some(entry => entry.hasHarmfulPattern);
  
  return (
    <Card className="border border-border/50 shadow-md relative animate-in fade-in-0 zoom-in-95">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-2 top-2"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </Button>
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Journal Entries: {formattedDate}</span>
          <Badge 
            variant={totalPnL >= 0 ? "success" : "destructive"} 
            className="ml-2"
          >
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      {!hasPreTrading && !hasPostTrading && (
        <div className="px-6 py-2 bg-amber-500/10 border-y border-amber-500/20 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <p className="text-sm text-muted-foreground">
            No emotional state data recorded for this day. Only trade data available.
          </p>
        </div>
      )}
      
      <CardContent className="pt-4 space-y-4">
        {emotionalData.map((entry, index) => (
          <div key={index} className={index > 0 ? "pt-4 border-t border-border/50" : ""}>
            {entry.emotion && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Emotional State:</h4>
                <Badge 
                  variant={entry.emotion === 'positive' ? 'success' : 
                          entry.emotion === 'negative' ? 'destructive' : 'outline'}
                  className="capitalize"
                >
                  {entry.emotion}
                </Badge>
                {entry.preScore !== null && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Pre-Trading)
                  </span>
                )}
                {entry.postScore !== null && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Post-Trading)
                  </span>
                )}
              </div>
            )}
            
            {entry.reflection && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Reflection:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.reflection}</p>
              </div>
            )}
            
            {entry.hasHarmfulPattern && (
              <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded-md">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-500">
                    Pattern Warning: {entry.patternType || 'Harmful Pattern Detected'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    This trading session shows signs of a potentially harmful pattern.
                  </p>
                </div>
              </div>
            )}
            
            {entry.tradePnL !== 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">Trade P&L:</h4>
                <Badge 
                  variant={entry.tradePnL >= 0 ? "success" : "destructive"} 
                >
                  {entry.tradePnL >= 0 ? '+' : ''}{entry.tradePnL.toFixed(2)}
                </Badge>
              </div>
            )}
          </div>
        ))}
        
        {emotionalData.length > 1 && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <p className="text-sm text-muted-foreground">
              Showing all {emotionalData.length} entries for this date.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button variant="outline" size="sm" onClick={onClose} className="w-full">
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};
