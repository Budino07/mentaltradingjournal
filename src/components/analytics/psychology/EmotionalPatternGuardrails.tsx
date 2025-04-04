
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Award, BookOpen } from "lucide-react";

interface EmotionalPatternGuardrailsProps {
  emotionalData: any[];
}

export const EmotionalPatternGuardrails = ({ emotionalData }: EmotionalPatternGuardrailsProps) => {
  const detectPatterns = () => {
    if (!emotionalData.length) return [];
    
    const patterns = [];
    
    // Check for harmful patterns
    const harmfulPatterns = emotionalData.filter(data => data.hasHarmfulPattern);
    if (harmfulPatterns.length > 0) {
      const revengeTrading = harmfulPatterns.filter(p => p.patternType === 'revenge trading');
      const overconfidence = harmfulPatterns.filter(p => p.patternType === 'overconfidence');
      
      if (revengeTrading.length >= 2) {
        patterns.push({
          type: 'harmful',
          title: 'Revenge Trading Pattern',
          description: 'You may be trying to recover losses too aggressively after negative emotions.',
          icon: AlertTriangle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          recommendation: 'Take a mandatory 1-hour break after any losing trade before placing another one.'
        });
      }
      
      if (overconfidence.length >= 2) {
        patterns.push({
          type: 'harmful',
          title: 'Overconfidence Pattern',
          description: 'Winning trades appear to be leading to excessive risk-taking.',
          icon: AlertTriangle,
          color: 'text-orange-500',
          bgColor: 'bg-orange-100',
          recommendation: 'Set a maximum risk percentage per trade, even after winning streaks.'
        });
      }
    }
    
    // Check for positive patterns
    const consistentEntries = emotionalData.filter(d => d.preScore !== null && d.postScore !== null);
    if (consistentEntries.length >= 5) {
      patterns.push({
        type: 'positive',
        title: 'Consistent Journaling',
        description: 'You\'re maintaining regular emotional check-ins before and after trading.',
        icon: Award,
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        recommendation: 'Continue this practice and look for patterns in your best trading days.'
      });
    }
    
    const emotionalImprovement = emotionalData.filter(d => 
      d.preScore !== null && d.postScore !== null && d.postScore > d.preScore && d.tradePnL < 0
    );
    if (emotionalImprovement.length >= 2) {
      patterns.push({
        type: 'positive',
        title: 'Emotional Resilience',
        description: 'You\'ve shown ability to maintain or improve emotional state despite losses.',
        icon: Shield,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        recommendation: 'Document the specific techniques that help you bounce back from losses.'
      });
    }
    
    // Check for learning opportunities
    if (patterns.length === 0) {
      patterns.push({
        type: 'neutral',
        title: 'Building Your Pattern Database',
        description: 'Continue logging emotions and trades to reveal your psychological patterns.',
        icon: BookOpen,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100',
        recommendation: 'Try adding more detail to your journal entries, especially around triggers.'
      });
    }
    
    return patterns;
  };
  
  const patterns = detectPatterns();

  return (
    <Card className="border border-primary/10 bg-card/30 backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-gradient-primary">Emotional Guardrails</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patterns.map((pattern, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                pattern.type === 'harmful' ? 'border-red-200' : 
                pattern.type === 'positive' ? 'border-green-200' : 'border-purple-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${pattern.bgColor}`}>
                  <pattern.icon className={`h-5 w-5 ${pattern.color}`} />
                </div>
                <div>
                  <h4 className={`font-medium ${pattern.color} mb-1`}>{pattern.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                  
                  <div className={`p-2 rounded text-xs bg-background/80 border border-border`}>
                    <strong>Recommendation:</strong> {pattern.recommendation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
