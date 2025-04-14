
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, TrendingDown, DollarSign, ThumbsDown, BarChart2, Zap, Award, Repeat, Target, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface BehavioralPatternsProps {
  journalEntries: any[];
}

export const BehavioralPatterns: React.FC<BehavioralPatternsProps> = ({ journalEntries }) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patternEntries, setPatternEntries] = useState<any[]>([]);

  const analyzePatterns = () => {
    // Early return if no entries
    if (!journalEntries || journalEntries.length === 0) {
      return { patterns: [] };
    }
    
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
    
    // Pattern detection for "Overtrading"
    const overtradingEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      const keywords = ['overtrad', 'too many trades', 'kept entering', 'multiple entries', 'excessive', 'couldn\'t stop', 'another entry', 'second entry', 're-enter'];
      return keywords.some(keyword => text.includes(keyword));
    });
    
    // Pattern detection for "FOMO"
    const fomoEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      const keywords = ['fomo', 'fear of missing', 'missed out', 'didn\'t want to miss', 'everyone else', 'jumping in', 'getting left behind', 'had to get in'];
      return keywords.some(keyword => text.includes(keyword));
    });
    
    // Pattern detection for "Discipline"
    const disciplineEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      const keywords = ['discipline', 'followed plan', 'stuck to rules', 'patient', 'waited', 'followed system', 'according to plan', 'avoided', 'resisted', 'stayed out'];
      return keywords.some(keyword => text.includes(keyword));
    });
    
    // Pattern detection for "Revenge Trading"
    const revengeEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      const keywords = ['revenge', 'make it back', 'recover loss', 'get back', 'after that loss', 'angry trade', 'emotional trade', 'impulsive after loss'];
      return keywords.some(keyword => text.includes(keyword));
    });
    
    // Pattern detection for "Peak State / Flow"
    const peakStateEntries = journalEntries.filter(entry => {
      const text = entry.notes?.toLowerCase() || '';
      
      const keywords = ['flow', 'peak', 'zone', 'clarity', 'focused', 'aligned', 'calm', 'clear mind', 'everything clicked', 'effortless', 'in sync', 'perfect execution'];
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
        description: 'Consider implementing trailing stops or taking partial profits to protect gains',
        entries: givingBackEntries
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
        description: 'Greed often leads to poor risk management. Stick to your original plan and position sizing',
        entries: greedEntries
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
        description: 'These emotions often lead to revenge trading. Take a break when you notice these feelings',
        entries: frustrationEntries
      });
    }
    
    // Add Overtrading pattern if detected
    if (overtradingEntries.length > 0) {
      const overtradingKeywords = ['overtrad', 'too many trades', 'multiple entries', 're-enter'];
      const phrases = extractPhrases(overtradingEntries, overtradingKeywords);
      
      patterns.push({
        id: 'overtrading',
        name: 'Overtrading',
        icon: BarChart2,
        count: overtradingEntries.length,
        avgPnL: calculateAvgPnL(overtradingEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Kept entering over and over',
          'Too many trades today',
          'Couldn\'t stop myself from trading'
        ],
        description: 'Consider setting a daily trade limit and stopping after reaching it. Quality over quantity',
        entries: overtradingEntries
      });
    }
    
    // Add FOMO pattern if detected
    if (fomoEntries.length > 0) {
      const fomoKeywords = ['fomo', 'fear of missing', 'didn\'t want to miss'];
      const phrases = extractPhrases(fomoEntries, fomoKeywords);
      
      patterns.push({
        id: 'fomo',
        name: 'FOMO',
        icon: AlertTriangle,
        count: fomoEntries.length,
        avgPnL: calculateAvgPnL(fomoEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Everyone was jumping in',
          'Didn\'t want to miss the move',
          'Fear of missing out on profits'
        ],
        description: 'Remember there will always be another opportunity. Wait for setups that meet your criteria',
        entries: fomoEntries
      });
    }
    
    // Add Discipline pattern if detected
    if (disciplineEntries.length > 0) {
      const disciplineKeywords = ['discipline', 'followed plan', 'patient', 'waited'];
      const phrases = extractPhrases(disciplineEntries, disciplineKeywords);
      
      patterns.push({
        id: 'discipline',
        name: 'Discipline',
        icon: Award,
        count: disciplineEntries.length,
        avgPnL: calculateAvgPnL(disciplineEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Followed my trading plan exactly',
          'Stayed patient and waited',
          'Resisted the urge to deviate'
        ],
        description: 'Excellent! Discipline is the foundation of consistent trading. Continue to reinforce this strength',
        entries: disciplineEntries
      });
    }
    
    // Add Revenge Trading pattern if detected
    if (revengeEntries.length > 0) {
      const revengeKeywords = ['revenge', 'make it back', 'recover loss', 'get back'];
      const phrases = extractPhrases(revengeEntries, revengeKeywords);
      
      patterns.push({
        id: 'revenge-trading',
        name: 'Revenge Trading',
        icon: Repeat,
        count: revengeEntries.length,
        avgPnL: calculateAvgPnL(revengeEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Tried to make back my losses',
          'Jumped back in right away',
          'Wasn\'t thinking clearly after that loss'
        ],
        description: 'Consider implementing a "cooling off" period after losses. Step away for at least 30 minutes',
        entries: revengeEntries
      });
    }
    
    // Add Peak State / Flow pattern if detected
    if (peakStateEntries.length > 0) {
      const peakStateKeywords = ['flow', 'peak', 'zone', 'clarity', 'focused'];
      const phrases = extractPhrases(peakStateEntries, peakStateKeywords);
      
      patterns.push({
        id: 'peak-state',
        name: 'Peak State / Flow',
        icon: Target,
        count: peakStateEntries.length,
        avgPnL: calculateAvgPnL(peakStateEntries),
        typicalPhrases: phrases.length > 0 ? phrases : [
          'Everything felt aligned today',
          'I was in the zone',
          'Trading felt effortless and clear'
        ],
        description: 'Excellent! Document what contributed to this state so you can recreate it in future sessions',
        entries: peakStateEntries
      });
    }
    
    return { patterns };
  };
  
  const { patterns } = analyzePatterns();

  if (!patterns || patterns.length === 0) {
    return null;
  }

  const handleViewJournalEntries = (patternId: string, entries: any[]) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (pattern) {
      setSelectedPattern(pattern.name);
      setPatternEntries(pattern.entries);
      setIsDialogOpen(true);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "No date";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <>
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <pattern.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-lg">{pattern.name}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          Detected in {pattern.count} {pattern.count === 1 ? 'entry' : 'entries'}
                        </p>
                        <button 
                          onClick={() => handleViewJournalEntries(pattern.id, pattern.entries)}
                          className="p-1 rounded-full hover:bg-muted transition-colors"
                          title="View journal entries"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
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

      {/* Dialog for displaying journal entries */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPattern} Journal Entries</DialogTitle>
            <DialogDescription>
              Review the journal entries where this pattern was detected
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {patternEntries.map((entry, index) => (
              <div key={index} className="border rounded-md p-4 bg-background/50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{formatDate(entry.created_at)}</h3>
                  <div className="flex gap-2">
                    {entry.emotion && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.emotion === 'positive' ? 'bg-green-100 text-green-700' :
                        entry.emotion === 'neutral' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {entry.emotion}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-line">{entry.notes}</p>
                {entry.trades && entry.trades.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Related Trades:</h4>
                    <div className="space-y-2">
                      {entry.trades.map((trade: any, tradeIndex: number) => (
                        <div key={tradeIndex} className="text-xs p-2 bg-muted/50 rounded">
                          <div className="flex justify-between">
                            <span>{trade.instrument || 'Unknown'}</span>
                            <span className={trade.pnl > 0 ? 'text-green-500' : 'text-red-500'}>
                              {typeof trade.pnl === 'number' ? trade.pnl.toFixed(2) : trade.pnl}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
