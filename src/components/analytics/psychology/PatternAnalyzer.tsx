import React from 'react';
import { Badge } from "@/components/ui/badge";

interface PatternAnalysisResult {
  detected: boolean;
  confidence: 'Low' | 'Medium' | 'High';
  indicators: string[];
  summary: string;
}

export interface PatternAnalyzerProps {
  reflection: string;
}

export const PatternAnalyzer: React.FC<PatternAnalyzerProps> = ({ reflection }) => {
  // Analyze for "Rushed to Finish" pattern
  const analyzeRushedToFinish = (text: string): PatternAnalysisResult => {
    // Skip analysis if reflection is too short
    if (!text || text.length < 10) {
      return {
        detected: false,
        confidence: 'Low',
        indicators: [],
        summary: 'Insufficient text to analyze'
      };
    }
    
    // Keywords and phrases indicating rushing
    const rushKeywords = [
      'rush', 'hurry', 'quick', 'fast', 'speed', 'urgent', 
      'impatient', 'done with', 'be done', 'over with', 'finish',
      'end session', 'end the day', 'get out', 'leave'
    ];
    
    // Contextual phrases that indicate rushing
    const rushPhrases = [
      'wanted to be done',
      'trying to finish',
      'needed it over',
      'forced a trade',
      'hurried through',
      'didn\'t take time',
      'too quickly',
      'tunnel vision',
      'rushing',
      'get it over with'
    ];
    
    // Split text into lowercase words
    const lowercaseText = text.toLowerCase();
    
    // Check for keyword hits
    const keywordHits = rushKeywords.filter(keyword => 
      lowercaseText.includes(keyword)
    );
    
    // Check for phrase hits with context
    const phraseHits = rushPhrases.filter(phrase => 
      lowercaseText.includes(phrase.toLowerCase())
    );
    
    // Extract exact phrases from the text that contain our keywords
    const extractedPhrases: string[] = [];
    if (keywordHits.length > 0 || phraseHits.length > 0) {
      // Split text into sentences
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase().trim();
        
        // Check if sentence contains any keyword or phrase
        const containsKeyword = rushKeywords.some(keyword => 
          lowerSentence.includes(keyword)
        );
        
        const containsPhrase = rushPhrases.some(phrase => 
          lowerSentence.includes(phrase.toLowerCase())
        );
        
        if (containsKeyword || containsPhrase) {
          // Extract a shorter version of the sentence for display (max 60 chars)
          let extractedPhrase = sentence.trim();
          if (extractedPhrase.length > 60) {
            extractedPhrase = extractedPhrase.substring(0, 57) + '...';
          }
          extractedPhrases.push(extractedPhrase);
        }
      });
    }
    
    // Determine confidence level based on hits
    let confidence: 'Low' | 'Medium' | 'High' = 'Low';
    
    if (phraseHits.length >= 2 || (keywordHits.length >= 3 && phraseHits.length >= 1)) {
      confidence = 'High';
    } else if (phraseHits.length === 1 || keywordHits.length >= 2) {
      confidence = 'Medium';
    }
    
    // Determine if pattern is detected (at least Medium confidence)
    const detected = confidence !== 'Low';
    
    // Create summary
    let summary = '';
    if (detected) {
      if (lowercaseText.includes('wanted to be done') || lowercaseText.includes('rushed')) {
        summary = 'Trader explicitly expressed rushing to finish the session';
      } else if (extractedPhrases.length > 0) {
        summary = 'Language indicates impatience and desire to end trading quickly';
      } else {
        summary = 'Multiple signals of rushing behavior detected in trading approach';
      }
    } else {
      summary = 'No clear indicators of rushing to finish were detected';
    }
    
    return {
      detected,
      confidence,
      indicators: extractedPhrases.length > 0 ? extractedPhrases : [],
      summary
    };
  };

  // Analyze for "Giving Back Profits" pattern
  const analyzeGivingBackProfits = (text: string): PatternAnalysisResult => {
    if (!text || text.length < 10) {
      return {
        detected: false,
        confidence: 'Low',
        indicators: [],
        summary: 'Insufficient text to analyze'
      };
    }
    
    const keywords = [
      'gave back', 'giving back', 'lost profit', 'losing profit', 
      'profit gone', 'erased gains', 'reversed', 'turned negative',
      'position reversed', 'went against', 'slippage', 'profit disappeared'
    ];
    
    const phrases = [
      'was up but ended down',
      'gave too much back',
      'profit turned to loss',
      'winning trade became a loser',
      'didn\'t lock in profit',
      'should have closed earlier',
      'watched profits disappear',
      'let winners turn to losers'
    ];
    
    const lowercaseText = text.toLowerCase();
    
    const keywordHits = keywords.filter(keyword => 
      lowercaseText.includes(keyword)
    );
    
    const phraseHits = phrases.filter(phrase => 
      lowercaseText.includes(phrase.toLowerCase())
    );
    
    const extractedPhrases: string[] = [];
    if (keywordHits.length > 0 || phraseHits.length > 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase().trim();
        
        const containsKeyword = keywords.some(keyword => 
          lowerSentence.includes(keyword)
        );
        
        const containsPhrase = phrases.some(phrase => 
          lowerSentence.includes(phrase.toLowerCase())
        );
        
        if (containsKeyword || containsPhrase) {
          let extractedPhrase = sentence.trim();
          if (extractedPhrase.length > 60) {
            extractedPhrase = extractedPhrase.substring(0, 57) + '...';
          }
          extractedPhrases.push(extractedPhrase);
        }
      });
    }
    
    let confidence: 'Low' | 'Medium' | 'High' = 'Low';
    
    if (phraseHits.length >= 2 || (keywordHits.length >= 2 && phraseHits.length >= 1)) {
      confidence = 'High';
    } else if (phraseHits.length === 1 || keywordHits.length >= 1) {
      confidence = 'Medium';
    }
    
    const detected = confidence !== 'Low';
    
    let summary = '';
    if (detected) {
      summary = 'Trader experienced giving back profits, which can lead to emotional decision-making';
    } else {
      summary = 'No indicators of giving back profits were detected';
    }
    
    return {
      detected,
      confidence,
      indicators: extractedPhrases.length > 0 ? extractedPhrases : [],
      summary
    };
  };

  // Analyze for "Greed" pattern
  const analyzeGreed = (text: string): PatternAnalysisResult => {
    if (!text || text.length < 10) {
      return {
        detected: false,
        confidence: 'Low',
        indicators: [],
        summary: 'Insufficient text to analyze'
      };
    }
    
    const keywords = [
      'greed', 'greedy', 'more profit', 'bigger win', 
      'too much', 'excessive', 'overextend', 'overreach',
      'risky', 'chance', 'too big', 'tempted'
    ];
    
    const phrases = [
      'wanted more',
      'got greedy',
      'tried to maximize',
      'risked too much',
      'ignored my plan',
      'beyond my rules',
      'took excessive risk',
      'tried to hit home run'
    ];
    
    const lowercaseText = text.toLowerCase();
    
    const keywordHits = keywords.filter(keyword => 
      lowercaseText.includes(keyword)
    );
    
    const phraseHits = phrases.filter(phrase => 
      lowercaseText.includes(phrase.toLowerCase())
    );
    
    const extractedPhrases: string[] = [];
    if (keywordHits.length > 0 || phraseHits.length > 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase().trim();
        
        const containsKeyword = keywords.some(keyword => 
          lowerSentence.includes(keyword)
        );
        
        const containsPhrase = phrases.some(phrase => 
          lowerSentence.includes(phrase.toLowerCase())
        );
        
        if (containsKeyword || containsPhrase) {
          let extractedPhrase = sentence.trim();
          if (extractedPhrase.length > 60) {
            extractedPhrase = extractedPhrase.substring(0, 57) + '...';
          }
          extractedPhrases.push(extractedPhrase);
        }
      });
    }
    
    let confidence: 'Low' | 'Medium' | 'High' = 'Low';
    
    if (phraseHits.length >= 1 || keywordHits.includes('greed') || keywordHits.includes('greedy')) {
      confidence = 'High';
    } else if (keywordHits.length >= 2) {
      confidence = 'Medium';
    }
    
    const detected = confidence !== 'Low';
    
    let summary = '';
    if (detected) {
      summary = 'Trader exhibited greed-driven behavior, likely leading to overtrading or excessive risk';
    } else {
      summary = 'No indicators of greed were detected';
    }
    
    return {
      detected,
      confidence,
      indicators: extractedPhrases.length > 0 ? extractedPhrases : [],
      summary
    };
  };

  // Analyze for "Frustration/Regret" pattern
  const analyzeFrustrationRegret = (text: string): PatternAnalysisResult => {
    if (!text || text.length < 10) {
      return {
        detected: false,
        confidence: 'Low',
        indicators: [],
        summary: 'Insufficient text to analyze'
      };
    }
    
    const keywords = [
      'frustrat', 'regret', 'disappoint', 'angry', 'upset', 
      'annoyed', 'tilt', 'tilted', 'mad', 'irritated',
      'should have', 'could have', 'would have', 'wish I had'
    ];
    
    const phrases = [
      'kicking myself',
      'beating myself up',
      'can\'t believe I',
      'so stupid',
      'bad decision',
      'knew better',
      'mistake I made',
      'learning lesson'
    ];
    
    const lowercaseText = text.toLowerCase();
    
    const keywordHits = keywords.filter(keyword => 
      lowercaseText.includes(keyword)
    );
    
    const phraseHits = phrases.filter(phrase => 
      lowercaseText.includes(phrase.toLowerCase())
    );
    
    const extractedPhrases: string[] = [];
    if (keywordHits.length > 0 || phraseHits.length > 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase().trim();
        
        const containsKeyword = keywords.some(keyword => 
          lowerSentence.includes(keyword)
        );
        
        const containsPhrase = phrases.some(phrase => 
          lowerSentence.includes(phrase.toLowerCase())
        );
        
        if (containsKeyword || containsPhrase) {
          let extractedPhrase = sentence.trim();
          if (extractedPhrase.length > 60) {
            extractedPhrase = extractedPhrase.substring(0, 57) + '...';
          }
          extractedPhrases.push(extractedPhrase);
        }
      });
    }
    
    let confidence: 'Low' | 'Medium' | 'High' = 'Low';
    
    if ((phraseHits.length >= 1 && keywordHits.length >= 1) || keywordHits.length >= 3) {
      confidence = 'High';
    } else if (phraseHits.length === 1 || keywordHits.length >= 1) {
      confidence = 'Medium';
    }
    
    const detected = confidence !== 'Low';
    
    let summary = '';
    if (detected) {
      summary = 'Trader expressed frustration or regret, which can affect future trading decisions';
    } else {
      summary = 'No indicators of frustration or regret were detected';
    }
    
    return {
      detected,
      confidence,
      indicators: extractedPhrases.length > 0 ? extractedPhrases : [],
      summary
    };
  };
  
  // Analyze for "Recency Bias" pattern
  const analyzeRecencyBias = (text: string): PatternAnalysisResult => {
    if (!text || text.length < 10) {
      return {
        detected: false,
        confidence: 'Low',
        indicators: [],
        summary: 'Insufficient text to analyze'
      };
    }
    
    const keywords = [
      'yesterday', 'last trade', 'previous trade', 'recent', 'just', 'last time',
      'fresh start', 'recover', 'recovered', 'back to', 'starting over', 'restart'
    ];
    
    const phrases = [
      'able to recover',
      'starting fresh',
      'feel good after',
      'back on track',
      'previous day',
      'turned around',
      'bounced back',
      'recovered from',
      'made up for',
      'compensated for'
    ];
    
    const lowercaseText = text.toLowerCase();
    
    const keywordHits = keywords.filter(keyword => 
      lowercaseText.includes(keyword)
    );
    
    const phraseHits = phrases.filter(phrase => 
      lowercaseText.includes(phrase.toLowerCase())
    );
    
    const extractedPhrases: string[] = [];
    if (keywordHits.length > 0 || phraseHits.length > 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase().trim();
        
        const containsKeyword = keywords.some(keyword => 
          lowerSentence.includes(keyword)
        );
        
        const containsPhrase = phrases.some(phrase => 
          lowerSentence.includes(phrase.toLowerCase())
        );
        
        if (containsKeyword || containsPhrase) {
          let extractedPhrase = sentence.trim();
          if (extractedPhrase.length > 60) {
            extractedPhrase = extractedPhrase.substring(0, 57) + '...';
          }
          extractedPhrases.push(extractedPhrase);
        }
      });
    }
    
    let confidence: 'Low' | 'Medium' | 'High' = 'Low';
    
    if ((phraseHits.length >= 1 && keywordHits.length >= 2) || phraseHits.length >= 2) {
      confidence = 'High';
    } else if (phraseHits.length === 1 || keywordHits.length >= 2) {
      confidence = 'Medium';
    }
    
    const detected = confidence !== 'Low';
    
    let summary = '';
    if (detected) {
      summary = 'Trader shows recency bias, placing significant weight on recent trading outcomes';
    } else {
      summary = 'No indicators of recency bias were detected';
    }
    
    return {
      detected,
      confidence,
      indicators: extractedPhrases.length > 0 ? extractedPhrases : [],
      summary
    };
  };

  // Analyze for "Positive Mindset" pattern
  const analyzePositiveMindset = (text: string): PatternAnalysisResult => {
    if (!text || text.length < 10) {
      return {
        detected: false,
        confidence: 'Low',
        indicators: [],
        summary: 'Insufficient text to analyze'
      };
    }
    
    const keywords = [
      'feel good', 'happy', 'positive', 'excited', 'confident', 'optimistic',
      'great', 'excellent', 'wonderful', 'terrific', 'fantastic', 'amazing',
      'proud', 'pleased', 'satisfied', 'content', 'grateful', 'thankful'
    ];
    
    const phrases = [
      'in a good mood',
      'feeling positive',
      'staying optimistic',
      'good mindset',
      'focused and clear',
      'grateful for',
      'learning experience',
      'growth mindset',
      'positive outlook',
      'enjoying the process'
    ];
    
    const lowercaseText = text.toLowerCase();
    
    const keywordHits = keywords.filter(keyword => 
      lowercaseText.includes(keyword)
    );
    
    const phraseHits = phrases.filter(phrase => 
      lowercaseText.includes(phrase.toLowerCase())
    );
    
    const extractedPhrases: string[] = [];
    if (keywordHits.length > 0 || phraseHits.length > 0) {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase().trim();
        
        const containsKeyword = keywords.some(keyword => 
          lowerSentence.includes(keyword)
        );
        
        const containsPhrase = phrases.some(phrase => 
          lowerSentence.includes(phrase.toLowerCase())
        );
        
        if (containsKeyword || containsPhrase) {
          let extractedPhrase = sentence.trim();
          if (extractedPhrase.length > 60) {
            extractedPhrase = extractedPhrase.substring(0, 57) + '...';
          }
          extractedPhrases.push(extractedPhrase);
        }
      });
    }
    
    let confidence: 'Low' | 'Medium' | 'High' = 'Low';
    
    if ((phraseHits.length >= 1 && keywordHits.length >= 2) || keywordHits.length >= 3) {
      confidence = 'High';
    } else if (phraseHits.length === 1 || keywordHits.length >= 1) {
      confidence = 'Medium';
    }
    
    const detected = confidence !== 'Low';
    
    let summary = '';
    if (detected) {
      summary = 'Trader exhibits a positive mindset that can enhance decision-making and resilience';
    } else {
      summary = 'No indicators of a strong positive mindset were detected';
    }
    
    return {
      detected,
      confidence,
      indicators: extractedPhrases.length > 0 ? extractedPhrases : [],
      summary
    };
  };

  // Helper function to capitalize each word
  const capitalizeWords = (text: string) => {
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Run all pattern analyses
  const rushedResult = analyzeRushedToFinish(reflection);
  const givingBackResult = analyzeGivingBackProfits(reflection);
  const greedResult = analyzeGreed(reflection);
  const frustrationResult = analyzeFrustrationRegret(reflection);
  const recencyBiasResult = analyzeRecencyBias(reflection);
  const positiveMindsetResult = analyzePositiveMindset(reflection);
  
  // Collect all detected patterns
  const detectedPatterns = [
    rushedResult.detected && { 
      name: 'Rushed to Finish', 
      result: rushedResult 
    },
    givingBackResult.detected && { 
      name: 'Giving Back Profits', 
      result: givingBackResult 
    },
    greedResult.detected && { 
      name: 'Greed', 
      result: greedResult 
    },
    frustrationResult.detected && { 
      name: 'Frustration/Regret', 
      result: frustrationResult 
    },
    recencyBiasResult.detected && { 
      name: 'Recency Bias', 
      result: recencyBiasResult 
    },
    positiveMindsetResult.detected && { 
      name: 'Positive Mindset', 
      result: positiveMindsetResult 
    }
  ].filter(Boolean);
  
  if (detectedPatterns.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-3 border-t border-dashed border-primary/10">
      <h5 className="text-sm font-medium mb-2 text-muted-foreground">Pattern Analysis</h5>
      
      <div className="space-y-3">
        {detectedPatterns.map((pattern: any, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${
                  pattern.name === 'Rushed to Finish' || pattern.name === 'Greed' ? 
                    'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                  pattern.name === 'Giving Back Profits' ?
                    'bg-orange-100 text-orange-800 border-orange-300' : 
                  pattern.name === 'Frustration/Regret' ?
                    'bg-red-100 text-red-800 border-red-300' :
                  pattern.name === 'Recency Bias' ?
                    'bg-purple-100 text-purple-800 border-purple-300' :
                  pattern.name === 'Positive Mindset' ?
                    'bg-green-100 text-green-800 border-green-300' :
                    'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {capitalizeWords(pattern.name)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Confidence: <span className={`font-medium ${
                  pattern.result.confidence === 'High' ? 'text-red-500' : 
                  pattern.result.confidence === 'Medium' ? 'text-yellow-500' : 'text-blue-500'
                }`}>{pattern.result.confidence}</span>
              </span>
            </div>
            
            {pattern.result.indicators.length > 0 && (
              <div className="bg-muted/30 rounded p-2 text-xs">
                <p className="font-medium mb-1">Key indicators:</p>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  {pattern.result.indicators.slice(0, 3).map((indicator: string, i: number) => (
                    <li key={i}><span className="italic">"{indicator}"</span></li>
                  ))}
                </ul>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">{pattern.result.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
