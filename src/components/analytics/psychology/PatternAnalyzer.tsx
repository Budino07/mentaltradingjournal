
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

  const result = analyzeRushedToFinish(reflection);
  
  if (!result.detected) {
    return null;
  }
  
  return (
    <div className="mt-4 pt-3 border-t border-dashed border-primary/10">
      <h5 className="text-sm font-medium mb-2 text-muted-foreground">Pattern Analysis</h5>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Rushed to Finish
          </Badge>
          <span className="text-xs text-muted-foreground">
            Confidence: <span className={`font-medium ${
              result.confidence === 'High' ? 'text-red-500' : 
              result.confidence === 'Medium' ? 'text-yellow-500' : 'text-blue-500'
            }`}>{result.confidence}</span>
          </span>
        </div>
        
        {result.indicators.length > 0 && (
          <div className="bg-muted/30 rounded p-2 text-xs">
            <p className="font-medium mb-1">Key indicators:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              {result.indicators.slice(0, 3).map((indicator, i) => (
                <li key={i}><span className="italic">"{indicator}"</span></li>
              ))}
            </ul>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">{result.summary}</p>
      </div>
    </div>
  );
};
