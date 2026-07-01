import React, { useState, useMemo } from 'react';
import { 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Line, 
  ComposedChart
} from 'recharts';
import type { WeightLog } from '../../types';

interface WeightChartProps {
  weights: WeightLog[];
  goalWeight: number;
}

type TimeframeType = '7d' | '30d' | '90d' | 'year' | 'all';

export const WeightChart: React.FC<WeightChartProps> = ({ weights, goalWeight }) => {
  const [timeframe, setTimeframe] = useState<TimeframeType>('7d');

  // Filter weights based on timeframe
  const filteredData = useMemo(() => {
    if (weights.length === 0) return [];
    
    // Sort ascending
    const sorted = [...weights].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    
    const now = new Date();
    let cutoff = new Date();
    
    if (timeframe === '7d') cutoff.setDate(now.getDate() - 7);
    else if (timeframe === '30d') cutoff.setDate(now.getDate() - 30);
    else if (timeframe === '90d') cutoff.setDate(now.getDate() - 90);
    else if (timeframe === 'year') cutoff.setFullYear(now.getFullYear() - 1);
    else return sorted; // 'all'
    
    return sorted.filter(w => new Date(w.time) >= cutoff);
  }, [weights, timeframe]);

  // Compute trend line (3-point moving average)
  const chartData = useMemo(() => {
    return filteredData.map((item, idx) => {
      const start = Math.max(0, idx - 2);
      const subset = filteredData.slice(start, idx + 1);
      const sum = subset.reduce((acc, w) => acc + w.value, 0);
      const trendVal = parseFloat((sum / subset.length).toFixed(2));
      
      const dateObj = new Date(item.time);
      // Nice short formatting
      const dateLabel = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      return {
        ...item,
        dateLabel,
        value: parseFloat(item.value.toFixed(2)),
        trend: trendVal,
        goal: goalWeight
      };
    });
  }, [filteredData, goalWeight]);

  // Compute margins for y-axis so the line fits nicely
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [60, 100];
    const vals = chartData.map(d => d.value);
    const minVal = Math.min(...vals, goalWeight);
    const maxVal = Math.max(...vals, goalWeight);
    
    // Pad by 2kg on each side
    return [Math.floor(minVal - 1.5), Math.ceil(maxVal + 1.5)];
  }, [chartData, goalWeight]);

  const timeframes: { id: TimeframeType; label: string }[] = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: 'year', label: 'Year' },
    { id: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-4">
      {/* Timeframe selector tabs */}
      <div className="flex bg-background border border-border-subtle p-1 rounded-2xl">
        {timeframes.map((tf) => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id)}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
              timeframe === tf.id
                ? 'bg-card text-primary-brand shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart container */}
      <div className="h-64 sm:h-80 w-full relative pr-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-secondary text-sm">
            Log weight entries to see your graph.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D7FF2F" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D7FF2F" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="dateLabel" 
                stroke="#444444" 
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              
              <YAxis 
                domain={yDomain} 
                stroke="#444444" 
                fontSize={10}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#181818', 
                  border: '1px solid #242424', 
                  borderRadius: '16px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                labelClassName="text-primary-brand font-semibold mb-1"
                formatter={(value: any, name: any) => {
                  if (name === 'value') return [`${value} kg`, 'Actual'];
                  if (name === 'trend') return [`${value} kg`, 'Trend'];
                  return [value, name];
                }}
              />

              {/* Goal reference line */}
              <ReferenceLine 
                y={goalWeight} 
                stroke="#8B8B8B" 
                strokeDasharray="4 4" 
                strokeWidth={1.5}
                label={{ 
                  value: `Goal ${goalWeight}kg`, 
                  fill: '#8B8B8B', 
                  position: 'insideBottomRight',
                  fontSize: 10,
                  fontWeight: 600,
                  offset: 5
                }} 
              />

              {/* Actual weight Area */}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#D7FF2F" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#weightGrad)" 
                activeDot={{ r: 6, fill: '#D7FF2F', stroke: '#090909', strokeWidth: 2 }}
              />

              {/* Smooth trend line */}
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#52D273"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
export default WeightChart;
