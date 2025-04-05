
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertTriangle, Clock } from "lucide-react";

interface BehavioralPatternsProps {
  journalEntries: any[];
}

export const BehavioralPatterns: React.FC<BehavioralPatternsProps> = ({ journalEntries }) => {
  const analyzePatterns = () => {
    // Early return if no entries
    if (!journalEntries || journalEntries.length === 0) {
      return { patterns: [] };
    }
    
    // Pattern detection for "Rushed to Finish"
    const rushedEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      // Basic keyword matching
      const rushKeywords = ['rush', 'hurry', 'quick', 'fast', 'speed', 'urgent', 'wanted to be done', 'done with'];
      return rushKeywords.some(keyword => text.includes(keyword));
    });
    
    // Calculate average P&L for rushed entries
    let avgPnL = 0;
    if (rushedEntries.length > 0) {
      const totalPnL = rushedEntries.reduce((sum, entry) => {
        const entryPnL = entry.trades?.reduce((tradeSum: number, trade: any) => {
          const tradePnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                         typeof trade.pnl === 'number' ? trade.pnl : 0;
          return tradeSum + tradePnl;
        }, 0) || 0;
        
        return sum + entryPnL;
      }, 0);
      
      avgPnL = totalPnL / rushedEntries.length;
    }
    
    // Extract typical phrases from rushed entries
    const phrases: string[] = [];
    rushedEntries.forEach(entry => {
      const text = entry.notes || '';
      const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
      
      sentences.forEach((sentence: string) => {
        const lowercaseSentence = sentence.toLowerCase().trim();
        
        // Check for rush keywords
        if (['rush', 'hurry', 'quick', 'fast', 'wanted to be done', 'forced'].some(
          keyword => lowercaseSentence.includes(keyword)
        )) {
          // Add shortened version of sentence to phrases
          let phrase = sentence.trim();
          if (phrase.length > 40) {
            phrase = phrase.substring(0, 37) + '...';
          }
          
          if (!phrases.includes(phrase) && phrases.length < 3) {
            phrases.push(phrase);
          }
        }
      });
    });
    
    // Create patterns array
    const patterns = [];
    
    if (rushedEntries.length > 0) {
      patterns.push({
        id: 'rushed-to-finish',
        name: 'Rushed to Finish',
        icon: RefreshCw,
        count: rushedEntries.length,
        avgPnL: avgPnL,
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Wanted to be done',
          'Forced a quick trade',
          'Didn\'t care about quality, just needed it over'
        ],
        description: 'This pattern usually leads to losses. You\'re better off stopping when this urge appears'
      });
    }
    
    // Add more patterns here as needed
    
    return { patterns };
  };
  
  const { patterns } = analyzePatterns();

  if (!patterns || patterns.length === 0) {
    return null;
  }

  return (
    <Card className="border border-primary/10 bg-card/30 backdrop-blur-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-gradient-primary">Behavioral Recognition</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patterns.map((pattern) => (
            <div 
              key={pattern.id}
              className="p-4 rounded-lg border border-primary/20 bg-background/40 backdrop-blur-md"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-full bg-muted">
                  <pattern.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-lg">{pattern.name}</h4>
                  <p className="text-sm text-muted-foreground">Detected in {pattern.count} {pattern.count === 1 ? 'entry' : 'entries'}</p>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium mb-1 text-muted-foreground">Avg P&L {pattern.avgPnL < 0 ? '-' : '+'}{Math.abs(pattern.avgPnL).toFixed(1)}%</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Typical phrases</p>
                <ul className="space-y-1 pl-1">
                  {pattern.typicalPhrases.map((phrase, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <span>{phrase}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <p className="text-xs text-muted-foreground">{pattern.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
