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
  const data = Object.keys(stats).map((key) => {
    const k = key as StatKey;
    return {
      subject: STAT_CONFIG[k].label,
      A: stats[k],
      fullMark: 100, // You might want this to scale with level
    };
  });

  // Calculate dynamic domain max based on highest stat to keep chart looking good
  const maxStat = Math.max(...Object.values(stats), 10);
  const domainMax = Math.ceil(maxStat * 1.2);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, domainMax]} tick={false} axisLine={false} />
          <Radar
            name="Stats"
            dataKey="A"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
