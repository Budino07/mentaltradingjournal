import { JournalEntry } from "@/types/analytics";

// Define the core need types
export type CoreNeed = 'control' | 'validation' | 'safety' | 'connection' | 'growth' | 'unknown';

// Extended keywords and phrases for each core need
const coreNeedKeywords: Record<CoreNeed, string[]> = {
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
    'harmony', 'discord', 'isolation', 'alone', 'lonely', 'supported', 'abandoned',
    'included', 'excluded', 'accepted', 'rejected', 'follow others', 'crowd', 'herd',
    'trend', 'popular', 'unpopular', 'majority', 'minority'
  ],
  growth: [
    'grow', 'improve', 'learn', 'develop', 'progress', 'advance', 'evolve', 'expand',
    'knowledge', 'skill', 'ability', 'capability', 'potential', 'challenge', 'opportunity',
    'experiment', 'try', 'test', 'explore', 'discover', 'understand', 'comprehend', 'grasp',
    'master', 'novice', 'expert', 'beginner', 'advanced', 'intermediate'
  ],
  unknown: [] // No keywords for unknown as it's the default case
};

// Emotion-based indicators for core needs
const emotionToCoreNeedMap: Record<string, CoreNeed[]> = {
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
  'confident': ['validation'],
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
  'lonely': ['connection'],
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
  'stagnant': ['growth']
};

// Trading behavior indicators for core needs
const tradingBehaviorToCoreNeedMap: Record<string, CoreNeed[]> = {
  // Control-related behaviors
  'overtrade': ['control'],
  'revenge trade': ['control', 'validation'],
  'stick to plan': ['control'],
  'follow rules': ['control'],
  'break rules': ['control'],
  'change strategy': ['control', 'growth'],
  'adjust position': ['control'],
  'hesitate': ['control', 'safety'],
  
  // Validation-related behaviors
  'take profit early': ['validation', 'safety'],
  'let winners run': ['validation'],
  'prove right': ['validation'],
  // 'revenge trade': ['validation', 'control'], - Removed duplicate entry
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
  'study chart': ['growth'],
  'analyze mistake': ['growth'],
  'journal': ['growth'],
  'test strategy': ['growth'],
  'backtest': ['growth']
};

// Context-based analysis for core needs
const contextToCoreNeedMap: Record<string, CoreNeed[]> = {
  // Context indicating control needs
  'missed opportunity': ['control'],
  'should have waited': ['control'],
  'jumped the gun': ['control'],
  'too early': ['control'],
  'too late': ['control'],
  'impulsive decision': ['control'],
  'stick to the plan': ['control'],
  
  // Context indicating validation needs
  'finally right': ['validation'],
  'knew it would': ['validation'],
  'told you so': ['validation'],
  'proved them wrong': ['validation'],
  'should have trusted myself': ['validation'],
  
  // Context indicating safety needs
  'preserved capital': ['safety'],
  'avoided loss': ['safety'],
  'played it safe': ['safety'],
  'better safe than sorry': ['safety'],
  'too risky': ['safety'],
  
  // Context indicating connection needs
  'everyone else': ['connection'],
  'others were': ['connection'],
  'group consensus': ['connection'],
  'community thinks': ['connection'],
  
  // Context indicating growth needs
  'learned from': ['growth'],
  'next time I will': ['growth'],
  'improving my': ['growth'],
  'getting better at': ['growth']
};

// Extract core needs from emotion details
function extractNeedFromEmotionDetail(emotionDetail: string): CoreNeed | null {
  const lowercaseDetail = emotionDetail.toLowerCase();
  
  // Direct mapping based on emotion detail
  if (lowercaseDetail.includes('control') || lowercaseDetail.includes('discipline')) return 'control';
  if (lowercaseDetail.includes('confidence') || lowercaseDetail.includes('proud')) return 'validation';
  if (lowercaseDetail.includes('safe') || lowercaseDetail.includes('secure') || lowercaseDetail.includes('anxious')) return 'safety';
  if (lowercaseDetail.includes('alone') || lowercaseDetail.includes('connect') || lowercaseDetail.includes('support')) return 'connection';
  if (lowercaseDetail.includes('grow') || lowercaseDetail.includes('learn') || lowercaseDetail.includes('improve')) return 'growth';
  
  return null;
}

// Check if text contains any keywords from a given array
function containsAnyKeyword(text: string, keywords: string[]): boolean {
  if (!text) return false;
  const lowercaseText = text.toLowerCase();
  return keywords.some(keyword => lowercaseText.includes(keyword.toLowerCase()));
}

// Analyze entry for core needs using multiple methods
function analyzeEntryForCoreNeeds(entry: JournalEntry): CoreNeed {
  if (!entry) return 'unknown';
  
  const textToAnalyze = [
    entry.notes || '',
    entry.emotion_detail || '',
    entry.post_submission_notes || '',
    entry.market_conditions || '',
    Array.isArray(entry.followed_rules) ? entry.followed_rules.join(' ') : '',
    Array.isArray(entry.mistakes) ? entry.mistakes.join(' ') : '',
  ].join(' ').toLowerCase();
  
  // First check: Direct keyword matching
  for (const [need, keywords] of Object.entries(coreNeedKeywords)) {
    if (need !== 'unknown' && containsAnyKeyword(textToAnalyze, keywords)) {
      return need as CoreNeed;
    }
  }
  
  // Second check: Emotion-based indicators
  for (const [emotion, needs] of Object.entries(emotionToCoreNeedMap)) {
    if (textToAnalyze.includes(emotion.toLowerCase())) {
      return needs[0]; // Take the first associated need
    }
  }
  
  // Third check: Trading behavior indicators
  for (const [behavior, needs] of Object.entries(tradingBehaviorToCoreNeedMap)) {
    if (textToAnalyze.includes(behavior.toLowerCase())) {
      return needs[0]; // Take the first associated need
    }
  }
  
  // Fourth check: Context-based analysis
  for (const [context, needs] of Object.entries(contextToCoreNeedMap)) {
    if (textToAnalyze.includes(context.toLowerCase())) {
      return needs[0]; // Take the first associated need
    }
  }
  
  // Fifth check: Direct emotion detail analysis
  if (entry.emotion_detail) {
    const needFromEmotion = extractNeedFromEmotionDetail(entry.emotion_detail);
    if (needFromEmotion) {
      return needFromEmotion;
    }
  }
  
  // Additional check: Analyze session_type and outcome for implicit needs
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
  
  // Analyze trades for implicit needs
  if (entry.trades && entry.trades.length > 0) {
    const trade = entry.trades[0]; // Analyze first trade for simplicity
    
    if (trade.stopLoss && parseFloat(trade.stopLoss.toString()) > 0) {
      return 'safety'; // Setting stop loss indicates safety need
    }
    
    if (trade.setup && trade.setup.toLowerCase().includes('test')) {
      return 'growth'; // Testing setups indicates growth need
    }
  }
  
  return 'unknown';
}

// Process all journal entries and categorize them by core need
export function analyzeJournalEntriesForCoreNeeds(entries: JournalEntry[]): { 
  coreNeed: CoreNeed; 
  count: number;
}[] {
  // Map each entry to a core need
  const needsMapping = entries.map(entry => {
    return {
      coreNeed: analyzeEntryForCoreNeeds(entry),
      entry
    };
  });
  
  // Count occurrences of each core need
  const needsCounts = needsMapping.reduce((acc, { coreNeed }) => {
    if (!acc[coreNeed]) {
      acc[coreNeed] = 0;
    }
    acc[coreNeed]++;
    return acc;
  }, {} as Record<CoreNeed, number>);
  
  // Convert to array format
  return Object.entries(needsCounts).map(([need, count]) => ({
    coreNeed: need as CoreNeed,
    count
  }));
}

// Process all journal entries and return them grouped by core need
export function getEntriesByCoreSeed(entries: JournalEntry[]): { 
  coreNeed: CoreNeed; 
  entries: JournalEntry[];
}[] {
  // Map each entry to a core need
  const needsMapping = entries.map(entry => {
    return {
      coreNeed: analyzeEntryForCoreNeeds(entry),
      entry
    };
  });
  
  // Group entries by core need
  const entriesByNeed = needsMapping.reduce((acc, { coreNeed, entry }) => {
    if (!acc[coreNeed]) {
      acc[coreNeed] = [];
    }
    acc[coreNeed].push(entry);
    return acc;
  }, {} as Record<CoreNeed, JournalEntry[]>);
  
  // Convert to array format
  return Object.entries(entriesByNeed).map(([need, entries]) => ({
    coreNeed: need as CoreNeed,
    entries
  }));
}

// List of harmful patterns to detect in trading reflections
const harmfulPatterns = [
  {
    type: 'revenge trading',
    keywords: ['revenge', 'get back', 'make up for', 'recover loss'],
    description: 'Taking trades to recover losses rather than based on strategy'
  },
  {
    type: 'overtrading',
    keywords: ['overtrade', 'too many trades', 'trading too much', 'excessive', 'volume'],
    description: 'Taking too many trades in a short period'
  },
  {
    type: 'panic trading',
    keywords: ['panic', 'fear', 'anxiety', 'stress', 'nervous', 'worried'],
    description: 'Trading based on emotional fear rather than strategy'
  },
  {
    type: 'emotional decision making',
    keywords: ['emotion', 'feel', 'gut', 'impulsive', 'urge', 'temptation'],
    description: 'Making decisions based on emotions rather than analysis'
  },
  {
    type: 'ignoring stop loss',
    keywords: ['moved stop', 'ignored stop', 'no stop loss', 'without stop', 'bypassed stop'],
    description: 'Moving, ignoring, or trading without stop losses'
  },
  {
    type: 'profit chasing',
    keywords: ['fomo', 'missing out', 'chase', 'chasing', 'greedy', 'greed'],
    description: 'Entering trades out of fear of missing out or greed'
  },
  {
    type: 'risk management issues',
    keywords: ['too large', 'oversized', 'big position', 'excessive risk', 'high leverage'],
    description: 'Taking positions that are too large for account size'
  }
];

// Detect harmful patterns in a reflection or trading notes
export function detectHarmfulPatterns(text: string): { detected: boolean; patternType: string | null; source: string } {
  if (!text) return { detected: false, patternType: null, source: 'no data' };
  
  const lowercaseText = text.toLowerCase();
  
  // Check against each defined pattern
  for (const pattern of harmfulPatterns) {
    if (pattern.keywords.some(keyword => lowercaseText.includes(keyword.toLowerCase()))) {
      return { 
        detected: true, 
        patternType: pattern.type,
        source: `keyword: "${pattern.keywords.find(k => lowercaseText.includes(k.toLowerCase()))}"` 
      };
    }
  }
  
  // Check for P&L-based pattern indicators
  if (
    (lowercaseText.includes('loss') && 
      (lowercaseText.includes('frustrat') || lowercaseText.includes('angry') || lowercaseText.includes('upset'))) ||
    (lowercaseText.includes('profit') && lowercaseText.includes('gave back')) ||
    (lowercaseText.includes('gave up') && lowercaseText.includes('gain'))
  ) {
    return { 
      detected: true, 
      patternType: 'emotional reaction to P&L',
      source: 'emotional P&L reaction'
    };
  }
  
  // Check for behavioral indicators without explicit keywords
  if (
    (lowercaseText.includes('should have waited') || lowercaseText.includes('too early')) ||
    (lowercaseText.includes('didn\'t follow') && lowercaseText.includes('plan')) ||
    (lowercaseText.includes('broke') && lowercaseText.includes('rule'))
  ) {
    return { 
      detected: true, 
      patternType: 'discipline issues',
      source: 'behavioral indicators'
    };
  }
  
  return { detected: false, patternType: null, source: 'no pattern detected' };
}

// Create an interface for the emotional data to match what EmotionalWaveform expects
export interface EnhancedEmotionalDataPoint {
  coreNeed: CoreNeed;
  emotion: string;
  date: Date;
  formattedDate: string;
  preScore: number | null;
  postScore: number | null;
  emotionalChange: number | null;
  preEmotion: string | null;
  postEmotion: string | null;
  tradePnL: number;
  reflection: string;
  hasHarmfulPattern: boolean;
  patternType: string | null;
  patternSource?: string; // New field to track how pattern was detected
  intensity: number;
}

// Generate emotional data for Core Needs Matrix
export function generateEmotionalData(entries: JournalEntry[]): EnhancedEmotionalDataPoint[] {
  return entries.map(entry => {
    const coreNeed = analyzeEntryForCoreNeeds(entry);
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
    
    // Enhanced pattern detection using the new function
    const { detected: hasHarmfulPattern, patternType, source: patternSource } = detectHarmfulPatterns(
      [entry.notes, entry.emotion_detail, entry.post_submission_notes].filter(Boolean).join(' ')
    );

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
    
    // Additional pattern detection based on P&L data when emotional data is limited
    let finalPatternType = patternType;
    let finalHasHarmfulPattern = hasHarmfulPattern;
    let finalPatternSource = patternSource;
    
    // Look for large losses with minimal reflection as potential harmful patterns
    if (!hasHarmfulPattern && tradePnL < -100 && (!entry.notes || entry.notes.length < 20)) {
      finalHasHarmfulPattern = true;
      finalPatternType = 'significant loss with minimal reflection';
      finalPatternSource = 'P&L data with limited reflection';
    }

    // Return enhanced emotional data point with all required fields
    return {
      coreNeed,
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
      hasHarmfulPattern: finalHasHarmfulPattern,
      patternType: finalPatternType,
      patternSource: finalPatternSource,
      intensity
    };
  });
}
