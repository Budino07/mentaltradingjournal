
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertTriangle, Clock, TrendingDown, DollarSign, ThumbsDown } from "lucide-react";

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
    
    // Pattern detection for "Giving Back Profits"
    const givingBackEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      const keywords = ['gave back', 'giving back', 'lost profit', 'slippage', 'profit gone', 'erased gains', 'reversed'];
      return keywords.some(keyword => text.includes(keyword));
    });
    
    // Pattern detection for "Greed"
    const greedEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      const keywords = ['greed', 'greedy', 'more profit', 'bigger win', 'too much', 'excessive'];
      return keywords.some(keyword => text.includes(keyword));
    });
    
    // Pattern detection for "Frustration/Regret"
    const frustrationEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      const keywords = ['frustrat', 'regret', 'disappoint', 'angry', 'upset', 'tilt', 'tilted'];
      return keywords.some(keyword => text.includes(keyword));
    });
    
    // Calculate average P&L for each pattern
    const calculateAvgPnL = (entries: any[]) => {
      if (entries.length === 0) return 0;
      
      const totalPnL = entries.reduce((sum, entry) => {
        const entryPnL = entry.trades?.reduce((tradeSum: number, trade: any) => {
          const tradePnl = typeof trade.pnl === 'string' ? parseFloat(trade.pnl) : 
                         typeof trade.pnl === 'number' ? trade.pnl : 0;
          return tradeSum + tradePnl;
        }, 0) || 0;
        
        return sum + entryPnL;
      }, 0);
      
      return totalPnL / entries.length;
    };
    
    // Extract typical phrases from entries with specific pattern
    const extractPhrases = (entries: any[], patternKeywords: string[]) => {
      const phrases: string[] = [];
      
      entries.forEach(entry => {
        const text = entry.notes || '';
        const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
        
        sentences.forEach((sentence: string) => {
          const lowercaseSentence = sentence.toLowerCase().trim();
          
          // Check for pattern keywords
          if (patternKeywords.some(keyword => lowercaseSentence.includes(keyword))) {
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
      
      return phrases;
    };
    
    // Create patterns array
    const patterns = [];
    
    // Add Rushed to Finish pattern if detected
    if (rushedEntries.length > 0) {
      const rushKeywords = ['rush', 'hurry', 'quick', 'fast', 'wanted to be done', 'done with'];
      const phrases = extractPhrases(rushedEntries, rushKeywords);
      
      patterns.push({
        id: 'rushed-to-finish',
        name: 'Rushed to Finish',
        icon: RefreshCw,
        count: rushedEntries.length,
        avgPnL: calculateAvgPnL(rushedEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Wanted to be done',
          'Forced a quick trade',
          'Didn\'t care about quality, just needed it over'
        ],
        description: 'This pattern usually leads to losses. You\'re better off stopping when this urge appears'
      });
    }
    
    // Add Giving Back Profits pattern if detected
    if (givingBackEntries.length > 0) {
      const givingBackKeywords = ['gave back', 'giving back', 'lost profit', 'slippage', 'profit gone'];
      const phrases = extractPhrases(givingBackEntries, givingBackKeywords);
      
      patterns.push({
        id: 'giving-back-profits',
        name: 'Giving Back Profits',
        icon: TrendingDown,
        count: givingBackEntries.length,
        avgPnL: calculateAvgPnL(givingBackEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Gave too much back to the market',
          'Watched profits disappear',
          'Let winners turn to losers'
        ],
        description: 'Consider implementing trailing stops or taking partial profits to protect gains'
      });
    }
    
    // Add Greed pattern if detected
    if (greedEntries.length > 0) {
      const greedKeywords = ['greed', 'greedy', 'more profit', 'bigger win'];
      const phrases = extractPhrases(greedEntries, greedKeywords);
      
      patterns.push({
        id: 'greed',
        name: 'Greed',
        icon: DollarSign,
        count: greedEntries.length,
        avgPnL: calculateAvgPnL(greedEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Became too greedy',
          'Wanted more profit',
          'Tried to maximize the gain'
        ],
        description: 'Greed often leads to poor risk management. Stick to your original plan and position sizing'
      });
    }
    
    // Add Frustration/Regret pattern if detected
    if (frustrationEntries.length > 0) {
      const frustrationKeywords = ['frustrat', 'regret', 'upset', 'tilt', 'tilted'];
      const phrases = extractPhrases(frustrationEntries, frustrationKeywords);
      
      patterns.push({
        id: 'frustration-regret',
        name: 'Frustration/Regret',
        icon: ThumbsDown,
        count: frustrationEntries.length,
        avgPnL: calculateAvgPnL(frustrationEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'It tilted me',
          'So frustrated with myself',
          'Regret taking that trade'
        ],
        description: 'These emotions often lead to revenge trading. Take a break when you notice these feelings'
      });
    }
    
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
