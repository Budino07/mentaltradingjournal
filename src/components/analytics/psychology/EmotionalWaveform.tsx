import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, ComposedChart } from 'recharts';
import { EnhancedEmotionalDataPoint, CoreTrait } from '@/utils/psychology/coreNeedsAnalysis';

// Define the interface based on what's needed for the component
// Instead of extending, we'll define it directly to avoid type conflicts
interface EmotionalDataPoint {
  date: Date;
  formattedDate: string;
  preScore: number | null;
  postScore: number | null;
  emotionalChange: number | null;
  preEmotion: string | null;
  postEmotion: string | null;
  tradePnL: number;
  reflection: string;
  coreTrait: CoreTrait;  // Now correctly using the CoreTrait type
  emotion: string;
  hasHarmfulPattern: boolean;
  patternType: string | null;
}

interface EmotionalWaveformProps {
  emotionalData: EmotionalDataPoint[];
  onDayClick: (day: Date) => void;
}

export const EmotionalWaveform = ({ emotionalData, onDayClick }: EmotionalWaveformProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Create a chart config with color mappings
  const chartConfig = {
    pre: {
      theme: {
        light: 'rgba(116, 116, 252, 0.5)',
        dark: 'rgba(147, 51, 234, 0.5)',
      },
      label: 'Pre-Trading Emotional State',
    },
    post: {
      theme: {
        light: 'rgba(244, 114, 182, 0.5)',
        dark: 'rgba(236, 72, 153, 0.5)',
      },
      label: 'Post-Trading Emotional State',
    },
  };
  
  // Function to get color gradient for core trait overlay
  const getCoreNeedGradient = (coreTrait: CoreTrait) => {
    switch (coreTrait) {
      case 'control': return ['#e9d5ff', '#9333ea'];
      case 'validation': return ['#fecaca', '#dc2626'];
      case 'safety': return ['#bbf7d0', '#16a34a'];
      case 'connection': return ['#bae6fd', '#0284c7'];
      case 'growth': return ['#fef08a', '#ca8a04'];
      case 'conviction': return ['#fee2e2', '#e11d48'];
      case 'focus': return ['#cffafe', '#0891b2'];
      case 'confidence': return ['#ddd6fe', '#7c3aed'];
      default: return ['#d1d5db', '#6b7280'];
    }
  };

  // Debug function to log the emotional data
  useEffect(() => {
    console.log('Emotional data for waveform:', emotionalData);
  }, [emotionalData]);

  const renderCustomizedDot = ({ cx, cy, payload }: any) => {
    if (!payload) return null;
    
    const coreNeed = payload.coreNeed;
    const [startColor, endColor] = getCoreNeedGradient(coreNeed);
    const hasPattern = payload.hasHarmfulPattern;
    
    return (
      <g>
        {payload.preScore !== null && (
          <>
            {/* Core need aura - reduced size */}
            <defs>
              <radialGradient id={`auraGradient${payload.formattedDate}`}>
                <stop offset="0%" stopColor={startColor} stopOpacity={0.8} />
                <stop offset="100%" stopColor={endColor} stopOpacity={0.2} />
              </radialGradient>
            </defs>
            <circle 
              cx={cx} 
              cy={cy} 
              r={15} 
              fill={`url(#auraGradient${payload.formattedDate})`} 
              opacity={0.7}
            />
            
            {/* Point marker */}
            <circle 
              cx={cx} 
              cy={cy} 
              r={4}
              fill={payload.preScore > 0 ? '#9333ea' : '#dc2626'}
              stroke="#ffffff"
              strokeWidth={1}
            />
            
            {/* Warning indicator for harmful patterns - improved to be more visible */}
            {hasPattern && (
              <g>
                <path 
                  d={`M${cx - 8},${cy - 8} L${cx + 8},${cy + 8} M${cx + 8},${cy - 8} L${cx - 8},${cy + 8}`} 
                  stroke="#ff0000" 
                  strokeWidth={1.5} 
                />
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={10} 
                  fill="none" 
                  stroke="#ff0000" 
                  strokeWidth={1.5} 
                  strokeDasharray="3,2"
                />
              </g>
            )}
          </>
        )}
      </g>
    );
  };

  const formatYAxisTick = (value: number) => {
    if (value === 10) return "Positive";
    if (value === 0) return "Neutral";
    if (value === -10) return "Negative";
    return "";
  };

  const CustomActiveDot = ({ cx, cy, payload }: any) => {
    const data = payload;
    if (!data) return null;
    
    return (
      <motion.g 
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
        style={{ cursor: 'pointer' }}
        onClick={() => onDayClick(data.date)}
      >
        <circle
          cx={cx}
          cy={cy}
          r={6}
          stroke="#ffffff"
          strokeWidth={1.5}
          fill={data.preScore > 0 ? '#9333ea' : '#dc2626'}
          opacity={0.9}
        />
      </motion.g>
    );
  };
  
  // Add faces or emojis to represent emotional states
  const renderEmotionFace = (x: number, y: number, score: number) => {
    const emoji = score > 5 ? '😀' : 
                 score > 0 ? '🙂' :
                 score > -5 ? '😐' : '😩';
                 
    return (
      <text
        x={x}
        y={y}
        fontSize="16"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {emoji}
      </text>
    );
  };
  
  // Add pattern gradients for background styling
  useEffect(() => {
    if (!svgRef.current) return;
    
    // Get SVG element
    const svg = svgRef.current;
    
    // Create defs if needed
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      svg.appendChild(defs);
    }
    
    // Create linear gradient
    const gradientId = 'emotionalBackgroundGradient';
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', gradientId);
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');
    
    // Create gradient stops
    const stops = [
      { offset: '0%', color: 'rgba(147, 51, 234, 0.1)' },
      { offset: '50%', color: 'rgba(255, 255, 255, 0.05)' },
      { offset: '100%', color: 'rgba(236, 72, 153, 0.1)' },
    ];
    
    stops.forEach(stop => {
      const stopElement = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stopElement.setAttribute('offset', stop.offset);
      stopElement.setAttribute('stop-color', stop.color);
      gradient.appendChild(stopElement);
    });
    
    defs.appendChild(gradient);
    
  }, [svgRef.current]);

  // Fix: Enhance the data to ensure postEmotion is correctly represented as a score
  const enhancedData = emotionalData.map(entry => {
    // Convert emotion strings to scores for visualization
    const getScoreFromEmotion = (emotion: string | null): number | null => {
      if (!emotion) return null;
      
      switch(emotion.toLowerCase()) {
        case 'positive': return 10;
        case 'negative': return -10;
        case 'neutral': return 0;
        default: return null;
      }
    };
    
    // If postEmotion exists but postScore is null/0 when it shouldn't be
    if (entry.postEmotion && (entry.postScore === null || entry.postScore === 0) && 
        entry.postEmotion.toLowerCase() === 'negative') {
      return {
        ...entry,
        postScore: -10 // Set to negative for 'negative' emotion
      };
    }
    
    // If preEmotion exists but preScore is null/0 when it shouldn't be
    if (entry.preEmotion && (entry.preScore === null || entry.preScore === 0) && 
        entry.preEmotion.toLowerCase() === 'negative') {
      return {
        ...entry,
        preScore: -10 // Set to negative for 'negative' emotion
      };
    }
    
    return entry;
  });

  return (
    <div className="w-full h-full relative">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
          backgroundSize: '30px 30px',
        }}
      />
      
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={enhancedData}
            margin={{ top: 10, right: 0, left: 0, bottom: 30 }}
          >
            <defs>
              <linearGradient id="preGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="postGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[-10, 10]} 
              tickFormatter={formatYAxisTick}
              ticks={[-10, 0, 10]}
              tick={{ fill: 'currentColor', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium mb-1">{data.formattedDate}</p>
                      <p className="text-sm text-primary mt-1 flex items-center gap-1 font-medium">
                        Click to view
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            {/* Pre-trading emotional curve */}
            <Area 
              type="monotoneX"
              dataKey="preScore"
              name="pre"
              stroke="url(#preGradient)"
              fillOpacity={0.4}
              fill="url(#preGradient)"
              activeDot={<CustomActiveDot />}
              dot={renderCustomizedDot}
            />
            
            {/* Post-trading emotional curve */}
            <Area 
              type="monotoneX"
              dataKey="postScore"
              name="post"
              stroke="url(#postGradient)" 
              fillOpacity={0.3}
              fill="url(#postGradient)"
              activeDot={<CustomActiveDot />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-6 text-xs py-2">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-purple-600 mr-2"></div>
          <span>Pre-Trading State</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-pink-600 mr-2"></div>
          <span>Post-Trading State</span>
        </div>
      </div>
    </div>
  );
};
