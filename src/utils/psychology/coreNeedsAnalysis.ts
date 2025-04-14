// First part of the file with imports and type definitions
import { JournalEntry } from "@/types/analytics";

// Define the core trait types
export type CoreTrait = 'control' | 'validation' | 'safety' | 'connection' | 'growth' | 'conviction' | 'focus' | 'confidence' | 'unknown';

// Extended keywords and phrases for each core trait
const coreTraitKeywords: Record<CoreTrait, string[]> = {
  control: [
    'control', 'manage', 'discipline', 'plan', 'strategy', 'stick to', 'follow', 'consistent',
    'organized', 'system', 'rule', 'overrule', 'impulsive', 'spontaneous', 'urge', 
    'couldn\'t resist', 'temptation', 'patience', 'wait', 'rushed', 'hasty', 'deliberate',
    'calm', 'composed', 'panic', 'chaos', 'order', 'structure', 'procedure', 'process',
    'protocol', 'predictable', 'certain', 'uncertain', 'hesitate'
  ],
  validation: [
    'validation', 'acknowledge', 'recognition', 'proud', 'right', 'correct', 'prove', 
    'show', 'demonstrate', 'respect', 'admire', 'achievement', 'success', 'failure',
    'worth', 'value', 'capable', 'competent', 'smart', 'intelligent', 'stupid', 'dumb',
    'mistake', 'error', 'wrong', 'vindicated', 'confirmed', 'justified', 'validated',
    'approval', 'disapproval', 'judgment', 'opinion', 'view', 'reputation'
  ],
  safety: [
    'safe', 'security', 'protect', 'guard', 'shield', 'defend', 'risk', 'danger',
    'threat', 'harm', 'damage', 'loss', 'preserve', 'conserve', 'cautious', 'careful',
    'prudent', 'conservative', 'moderate', 'reserved', 'stop loss', 'hedge', 
    'insurance', 'backup', 'secure', 'comfortable', 'uncomfortable', 'exposed',
    'vulnerable', 'scared', 'afraid', 'fear', 'worry', 'concern', 'anxious'
  ],
  connection: [
    'connect', 'belong', 'relationship', 'community', 'group', 'team', 'together',
    'united', 'aligned', 'consensus', 'agreement', 'disagreement', 'conflict',
    'harmony', 'discord', 'isolation', 'alone', 'supported', 'abandoned',
    'included', 'excluded', 'accepted', 'rejected', 'follow others', 'crowd', 'herd',
    'trend', 'popular', 'unpopular', 'majority', 'minority'
  ],
  growth: [
    'grow', 'improve', 'learn', 'develop', 'progress', 'advance', 'evolve', 'expand',
    'knowledge', 'skill', 'ability', 'capability', 'potential', 'challenge', 'opportunity',
    'experiment', 'try', 'test', 'explore', 'discover', 'understand', 'comprehend', 'grasp',
    'master', 'novice', 'expert', 'beginner', 'advanced', 'intermediate'
  ],
  conviction: [
    'knew this would work', 'high probability setup', 'everything lined up', 'held despite pullback', 
    'stuck to the plan', 'didn\'t flinch', 'went full size', 'sized up', 'didn\'t pull the trigger', 
    'hesitated', 'closed too early', 'didn\'t trust it', 'conviction', 'sure', 'certain', 'committed'
  ],
  focus: [
    'fully present', 'in the zone', 'everything slowed down', 'stayed off my phone', 
    'watched for 30 mins before entry', 'noticed a shift in momentum', 'noticed order flow',  
    'got distracted', 'zoned out', 'didn\'t see the setup', 'wasn\'t paying attention', 
    'focus', 'concentration', 'attentive', 'diligent', 'mindful', 'alert', 'aware'
  ],
  confidence: [
    'I was ready', 'felt sharp', 'I can do this', 'I\'ve seen this before', 'my process is working', 
    'took the loss, no regret', 'wasn\'t sure', 'afraid to lose', 'didn\'t believe in the setup', 
    'felt off today', 'confidence', 'self-assured', 'decisive', 'bold', 'assertive'
  ],
  unknown: [] // No keywords for unknown as it's the default case
};

// Emotion-based indicators for core traits
const emotionToCoreTraitMap: Record<string, CoreTrait[]> = {
  // Control-related emotions
  'frustrated': ['control'],
  'overwhelmed': ['control'],
  'powerless': ['control'],
  'determined': ['control'],
  'empowered': ['control'],
  'in control': ['control'],
  'out of control': ['control'],
  'chaotic': ['control'],
  
  // Validation-related emotions
  'proud': ['validation'],
  'accomplished': ['validation'],
  'confident': ['validation', 'confidence'],
  'disappointed': ['validation'],
  'embarrassed': ['validation'],
  'ashamed': ['validation'],
  'vindicated': ['validation'],
  
  // Safety-related emotions
  'anxious': ['safety'],
  'worried': ['safety'],
  'fearful': ['safety'],
  'secure': ['safety'],
  'comfortable': ['safety'],
  'uncertain': ['safety', 'control'],
  'calm': ['safety', 'control'],
  
  // Connection-related emotions
  'isolated': ['connection'],
  'connected': ['connection'],
  'supported': ['connection'],
  'rejected': ['connection'],
  'accepted': ['connection'],
  'included': ['connection'],
  
  // Growth-related emotions
  'curious': ['growth'],
  'interested': ['growth'],
  'inspired': ['growth'],
  'challenged': ['growth'],
  'stimulated': ['growth'],
  'bored': ['growth'],
  'stagnant': ['growth'],
  
  // Conviction-related emotions
  'certain': ['conviction'],
  'doubtful': ['conviction'],
  'confused': ['conviction'],
  'decisive': ['conviction', 'confidence'],
  
  // Focus-related emotions
  'alert': ['focus'],
  'distracted': ['focus'],
  'present': ['focus'],
  'scattered': ['focus'],
  
  // Confidence-related emotions
  'self-assured': ['confidence'],
  'insecure': ['confidence'],
  // 'doubtful': ['confidence'], - Removed duplicate, it's already defined above
  'hesitant': ['confidence', 'conviction']
};

// Trading behavior indicators for core traits
const tradingBehaviorToCoreTraitMap: Record<string, CoreTrait[]> = {
  // Control-related behaviors
  'overtrade': ['control'],
  'revenge trade': ['control', 'validation'],
  'stick to plan': ['control', 'conviction'],
  'follow rules': ['control'],
  'break rules': ['control'],
  'change strategy': ['control', 'growth'],
  'adjust position': ['control'],
  'hesitate': ['control', 'safety', 'conviction'],
  
  // Validation-related behaviors
  'let winners run': ['validation', 'conviction'],
  'prove right': ['validation'],
  'boast': ['validation'],
  'share results': ['validation', 'connection'],
  
  // Safety-related behaviors
  'cut losses': ['safety'],
  'move stop loss': ['safety', 'control'],
  'tight stop': ['safety'],
  'wide stop': ['safety'],
  'small position': ['safety'],
  'reduce risk': ['safety'],
  'hedge': ['safety'],
  
  // Connection-related behaviors
  'follow signal': ['connection'],
  'group trade': ['connection'],
  'consensus': ['connection'],
  'discuss trade': ['connection'],
  'seek advice': ['connection', 'growth'],
  'share analysis': ['connection', 'validation'],
  
  // Growth-related behaviors
  'try new setup': ['growth'],
  'learn technique': ['growth'],
  'study chart': ['growth', 'focus'],
  'analyze mistake': ['growth'],
  'journal': ['growth'],
  'test strategy': ['growth'],
  'backtest': ['growth'],
  
  // Conviction-related behaviors
  'held position': ['conviction'],
  'sized up': ['conviction', 'confidence'],
  'full size': ['conviction', 'confidence'],
  'closed early': ['conviction'],
  
  // Focus-related behaviors
  'watched setup': ['focus'],
  'monitored price action': ['focus'],
  'noticed pattern': ['focus'],
  'stayed focused': ['focus'],
  'avoided distractions': ['focus'],
  
  // Confidence-related behaviors
  'executed quickly': ['confidence'],
  'no hesitation': ['confidence', 'conviction'],
  'trusted analysis': ['confidence'],
  'took loss well': ['confidence']
};

// Context-based analysis for core traits
const contextToCoreTraitMap: Record<string, CoreTrait[]> = {
  // Context indicating control traits
  'should have waited': ['control'],
  'jumped the gun': ['control'],
  'too early': ['control'],
  'too late': ['control'],
  'impulsive decision': ['control'],
  'stick to the plan': ['control', 'conviction'],
  
  // Context indicating validation traits
  'finally right': ['validation'],
  'knew it would': ['validation', 'conviction'],
  'told you so': ['validation'],
  'proved them wrong': ['validation'],
  'should have trusted myself': ['validation', 'confidence'],
  
  // Context indicating safety traits
  'preserved capital': ['safety'],
  'avoided loss': ['safety'],
  'played it safe': ['safety'],
  'better safe than sorry': ['safety'],
  'too risky': ['safety'],
  
  // Context indicating connection traits
  'everyone else': ['connection'],
  'others were': ['connection'],
  'group consensus': ['connection'],
  'community thinks': ['connection'],
  
  // Context indicating growth traits
  'learned from': ['growth'],
  'next time I will': ['growth'],
  'improving my': ['growth'],
  'getting better at': ['growth'],
  
  // Context indicating conviction traits
  'everything lined up': ['conviction'],
  'high probability': ['conviction'],
  'strong setup': ['conviction'],
  'perfect pattern': ['conviction'],
  
  // Context indicating focus traits
  'paid close attention': ['focus'],
  'stayed focused': ['focus'],
  'lost focus': ['focus'],
  'distracted by': ['focus'],
  
  // Context indicating confidence traits
  'trusted myself': ['confidence'],
  'believed in my analysis': ['confidence'],
  'doubted myself': ['confidence'],
  'second-guessed': ['confidence']
};

// Extract core traits from emotion details
function extractTraitFromEmotionDetail(emotionDetail: string): CoreTrait | null {
  const lowercaseDetail = emotionDetail.toLowerCase();
  
  // Direct mapping based on emotion detail
  if (lowercaseDetail.includes('control') || lowercaseDetail.includes('discipline')) return 'control';
  if (lowercaseDetail.includes('confidence') || lowercaseDetail.includes('proud')) return 'validation';
  if (lowercaseDetail.includes('safe') || lowercaseDetail.includes('secure') || lowercaseDetail.includes('anxious')) return 'safety';
  if (lowercaseDetail.includes('connect') || lowercaseDetail.includes('support')) return 'connection';
  if (lowercaseDetail.includes('grow') || lowercaseDetail.includes('learn') || lowercaseDetail.includes('improve')) return 'growth';
  if (lowercaseDetail.includes('certain') || lowercaseDetail.includes('conviction')) return 'conviction';
  if (lowercaseDetail.includes('focus') || lowercaseDetail.includes('attention')) return 'focus';
  if (lowercaseDetail.includes('confident') || lowercaseDetail.includes('self-assured')) return 'confidence';
  
  return null;
}

// Check if text contains any keywords from a given array
function containsAnyKeyword(text: string, keywords: string[]): boolean {
  if (!text) return false;
  const lowercaseText = text.toLowerCase();
  return keywords.some(keyword => lowercaseText.includes(keyword.toLowerCase()));
}

// Analyze entry for core traits using multiple methods
function analyzeEntryForCoreTraits(entry: JournalEntry): CoreTrait {
  if (!entry) return 'unknown';
  
  const textToAnalyze = [
    entry.notes || '',
    entry.emotion_detail || '',
    entry.post_submission_notes || '',
    entry.market_conditions || '',
    Array.isArray(entry.followed_rules) ? entry.followed_rules.join(' ') : '',
    Array.isArray(entry.mistakes) ? entry.mistakes.join(' ') : '',
  ].join(' ').toLowerCase();
  
  // Prioritize trait detection for conviction, focus, and confidence
  // First, check for conviction trait
  if (containsAnyKeyword(textToAnalyze, coreTraitKeywords.conviction)) {
    return 'conviction';
  }
  
  // Second, check for focus trait
  if (containsAnyKeyword(textToAnalyze, coreTraitKeywords.focus)) {
    return 'focus';
  }
  
  // Third, check for confidence trait
  if (containsAnyKeyword(textToAnalyze, coreTraitKeywords.confidence)) {
    return 'confidence';
  }
  
  // Next, check for other traits with keywords
  for (const [trait, keywords] of Object.entries(coreTraitKeywords)) {
    if (trait !== 'unknown' && trait !== 'conviction' && trait !== 'focus' && trait !== 'confidence' && 
        containsAnyKeyword(textToAnalyze, keywords)) {
      return trait as CoreTrait;
    }
  }
  
  // Continue with remaining detection methods
  // Second check: Emotion-based indicators
  for (const [emotion, traits] of Object.entries(emotionToCoreTraitMap)) {
    if (textToAnalyze.includes(emotion.toLowerCase())) {
      return traits[0]; // Take the first associated trait
    }
  }
  
  // Third check: Trading behavior indicators
  for (const [behavior, traits] of Object.entries(tradingBehaviorToCoreTraitMap)) {
    if (textToAnalyze.includes(behavior.toLowerCase())) {
      return traits[0]; // Take the first associated trait
    }
  }
  
  // Fourth check: Context-based analysis
  for (const [context, traits] of Object.entries(contextToCoreTraitMap)) {
    if (textToAnalyze.includes(context.toLowerCase())) {
      return traits[0]; // Take the first associated trait
    }
  }
  
  // Fifth check: Direct emotion detail analysis
  if (entry.emotion_detail) {
    const traitFromEmotion = extractTraitFromEmotionDetail(entry.emotion_detail);
    if (traitFromEmotion) {
      return traitFromEmotion;
    }
  }
  
  // Additional check: Analyze session_type and outcome for implicit traits
  if (entry.session_type === 'pre') {
    // Pre-session often indicates control (preparation) or growth (learning)
    if (textToAnalyze.includes('plan') || textToAnalyze.includes('strategy')) {
      return 'control';
    } 
    if (textToAnalyze.includes('learn') || textToAnalyze.includes('study')) {
      return 'growth';
    }
  }
  
  if (entry.outcome) {
    if (entry.outcome === 'win' && (entry.emotion === 'positive' || textToAnalyze.includes('proud'))) {
      return 'validation';
    }
    if (entry.outcome === 'loss' && textToAnalyze.includes('learn')) {
      return 'growth';
    }
    if (entry.outcome === 'loss' && textToAnalyze.includes('safe')) {
      return 'safety';
    }
  }
  
  // Analyze trades for implicit traits
  if (entry.trades && entry.trades.length > 0) {
    const trade = entry.trades[0]; // Analyze first trade for simplicity
    
    if (trade.stopLoss && parseFloat(trade.stopLoss.toString()) > 0) {
      return 'safety'; // Setting stop loss indicates safety trait
    }
    
    if (trade.setup && trade.setup.toLowerCase().includes('test')) {
      return 'growth'; // Testing setups indicates growth trait
    }
  }
  
  // Default to 'growth' instead of 'unknown' if no specific trait detected
  return 'growth';
}

// New function to detect harmful patterns more accurately
function detectHarmfulPatterns(entry: JournalEntry | null, textContent: string, tradePnL: number): {
  hasHarmfulPattern: boolean;
  patternType: string | null;
} {
  // No entry means no pattern
  if (!entry) {
    return { hasHarmfulPattern: false, patternType: null };
  }
  
  // Check for keyword indicators in text content
  const keywordPatterns = {
    'revenge trading': ['revenge', 'get back', 'make up for'],
    'overtrading': ['overtrade', 'too many trades', 'excessive'],
    'panic trading': ['panic', 'fear driven', 'scared'],
    'fomo': ['fomo', 'fear of missing out', 'jumped in', 'couldn\'t miss'],
    'analysis paralysis': ['overthinking', 'can\'t decide', 'frozen', 'paralyzed'],
    'greed': ['greedy', 'too much', 'more and more', 'never enough']
  };
  
  // Check for each pattern
  for (const [pattern, keywords] of Object.entries(keywordPatterns)) {
    if (keywords.some(keyword => textContent.includes(keyword.toLowerCase()))) {
      return { hasHarmfulPattern: true, patternType: pattern };
    }
  }
  
  // P&L-based pattern detection
  if (tradePnL < -200) {
    // Major loss might indicate a harmful pattern
    return { hasHarmfulPattern: true, patternType: 'Significant Loss' };
  }
  
  // Additional checks from entry data if available
  if (entry.emotion === 'negative' && tradePnL < 0) {
    // Negative emotion combined with loss could indicate pattern issues
    return { hasHarmfulPattern: true, patternType: 'Emotional Trading' };
  }
  
  // Check for common mistake patterns if available
  if (Array.isArray(entry.mistakes) && entry.mistakes.length > 2) {
    return { hasHarmfulPattern: true, patternType: 'Multiple Mistakes' };
  }
  
  // No harmful pattern detected
  return { hasHarmfulPattern: false, patternType: null };
}

// Process all journal entries and categorize them by core trait 
export function analyzeJournalEntriesForCoreTraits(entries: JournalEntry[]): { 
  coreTrait: CoreTrait; 
  count: number;
}[] {
  // Map each entry to a core trait
  const traitsMapping = entries.map(entry => {
    return {
      coreTrait: analyzeEntryForCoreTraits(entry),
      entry
    };
  });
  
  // Count occurrences of each core trait
  const traitsCounts = traitsMapping.reduce((acc, { coreTrait }) => {
    if (!acc[coreTrait]) {
      acc[coreTrait] = 0;
    }
    acc[coreTrait]++;
    return acc;
  }, {} as Record<CoreTrait, number>);
  
  // Convert to array format, filtering out unknown trait
  return Object.entries(traitsCounts)
    .filter(([trait]) => trait !== 'unknown')
    .map(([trait, count]) => ({
      coreTrait: trait as CoreTrait,
      count
    }));
}

// Process all journal entries and return them grouped by core trait
export function getEntriesByCoreTrait(entries: JournalEntry[]): { 
  coreTrait: CoreTrait; 
  entries: JournalEntry[];
}[] {
  // Map each entry to a core trait
  const traitsMapping = entries.map(entry => {
    return {
      coreTrait: analyzeEntryForCoreTraits(entry),
      entry
    };
  });
  
  // Group entries by core trait
  const entriesByTrait = traitsMapping.reduce((acc, { coreTrait, entry }) => {
    if (!acc[coreTrait]) {
      acc[coreTrait] = [];
    }
    acc[coreTrait].push(entry);
    return acc;
  }, {} as Record<CoreTrait, JournalEntry[]>);
  
  // Convert to array format
  return Object.entries(entriesByTrait).map(([trait, entries]) => ({
    coreTrait: trait as CoreTrait,
    entries
  }));
}

// Create an interface for the emotional data to match what EmotionalWaveform expects
export interface EnhancedEmotionalDataPoint {
  coreTrait: CoreTrait;
  emotion: string;
  date: Date;
  formattedDate: string;
  preScore: number | null;  // Changed from optional to required but nullable
  postScore: number | null; // Changed from optional to required but nullable
  emotionalChange: number | null;
  preEmotion: string | null;
  postEmotion: string | null;
  tradePnL: number;
  reflection: string;
  hasHarmfulPattern: boolean;
  patternType: string | null;
  intensity: number;
}

// Generate emotional data for Core Traits Matrix
export function generateEmotionalData(entries: JournalEntry[]): EnhancedEmotionalDataPoint[] {
  return entries.map(entry => {
    const coreTrait = analyzeEntryForCoreTraits(entry);
    const emotion = entry.emotion || 'neutral';
    
    // Calculate emotional scores for the waveform
    let preScore: number | null = null;
    let postScore: number | null = null;
    
    // Convert emotion to score
    const getScoreFromEmotion = (emotion: string): number => {
      switch(emotion.toLowerCase()) {
        case 'positive': return 5;
        case 'negative': return -5;
        case 'neutral': return 0;
        default: return 0;
      }
    };
    
    // Set pre and post scores based on session type
    if (entry.session_type === 'pre') {
      preScore = getScoreFromEmotion(emotion);
    } else if (entry.session_type === 'post') {
      postScore = getScoreFromEmotion(emotion);
    } else if (entry.session_type === 'trade') {
      // For trade entries, use emotion for both pre and post as an approximation
      preScore = getScoreFromEmotion(emotion);
      postScore = getScoreFromEmotion(emotion);
    }
    
    // Parse date
    const date = new Date(entry.created_at);
    
    // Calculate intensity based on emotion and content
    let intensity = 5; // Default medium intensity
    
    if (emotion.toLowerCase() === 'positive') {
      intensity = 8;
    } else if (emotion.toLowerCase() === 'negative') {
      intensity = 3;
    }
    
    // Adjust intensity based on content indicators
    const textContent = [
      entry.notes || '',
      entry.emotion_detail || ''
    ].join(' ').toLowerCase();
    
    // Words that indicate higher intensity
    const intensifiers = ['very', 'extremely', 'incredibly', 'highly', 'strongly', 'absolutely'];
    
    // Words that indicate lower intensity
    const diminishers = ['slightly', 'somewhat', 'a bit', 'a little', 'barely', 'hardly'];
    
    if (intensifiers.some(word => textContent.includes(word))) {
      intensity += 2;
    }
    
    if (diminishers.some(word => textContent.includes(word))) {
      intensity -= 2;
    }
    
    // Keep intensity within 1-10 range
    intensity = Math.max(1, Math.min(10, intensity));
    
    // Format date for display
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Extract PNL if available from trades
    let tradePnL = 0;
    if (entry.trades && entry.trades.length > 0) {
      entry.trades.forEach(trade => {
        const pnl = trade.pnl || trade.profit_loss;
        if (pnl !== undefined) {
          const pnlValue = typeof pnl === 'string' ? parseFloat(pnl) : pnl;
          if (!isNaN(pnlValue)) {
            tradePnL += pnlValue;
          }
        }
      });
    }
    
    // Use the improved pattern detection
    const { hasHarmfulPattern, patternType } = detectHarmfulPatterns(entry, textContent, tradePnL);

    // Return enhanced emotional data point with all required fields
    return {
      // If the coreTrait is unknown, replace with 'growth' as a safe default
      coreTrait: coreTrait === 'unknown' ? 'growth' : coreTrait,
      emotion,
      date,
      formattedDate,
      preScore,
      postScore,
      emotionalChange: postScore !== null && preScore !== null ? postScore - preScore : null,
      preEmotion: entry.session_type === 'pre' ? emotion : null,
      postEmotion: entry.session_type === 'post' ? emotion : null,
      tradePnL,
      reflection: entry.notes || '',
      hasHarmfulPattern,
      patternType,
      intensity
    };
  });
}
