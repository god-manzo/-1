import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { StatKey } from '../types';
import { STAT_CONFIG } from '../constants';

interface StatsRadarProps {
  stats: Record<StatKey, number>;
}

export function StatsRadar({ stats }: StatsRadarProps) {
  if (!stats) return null;

  const data = Object.keys(stats).map((key) => {
    const k = key as StatKey;
    return {
      subject: STAT_CONFIG[k].label,
      A: stats[k],
      fullMark: 100, 
    };
  });

  // Calculate dynamic domain max based on highest stat to keep chart looking good
  const maxStat = Math.max(...Object.values(stats), 10);
  const domainMax = Math.ceil(maxStat * 1.2);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          {/* Blue grid lines for system look */}
          <PolarGrid stroke="#1e3a8a" strokeDasharray="3 3" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#60a5fa', fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, domainMax]} tick={false} axisLine={false} />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.4}
            isAnimationActive={true}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}