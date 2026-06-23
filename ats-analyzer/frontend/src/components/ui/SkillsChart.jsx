import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

/* Radar chart — section scores */
export function SectionRadar({ breakdown = {} }) {
  const { dark } = useTheme();

  const data = Object.entries(breakdown).map(([key, val]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: Math.round((val.score / val.max) * 100),
    fullMark: 100,
  }));

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke={dark ? '#334155' : '#e2e8f0'} />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 500 }}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: dark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 12,
            color: dark ? '#e2e8f0' : '#1e293b',
            fontSize: 12,
          }}
          formatter={(v) => [`${v}%`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* Bar chart — top keywords by frequency */
const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#3b82f6'];

export function KeywordBar({ keywords = [] }) {
  const { dark } = useTheme();
  const data = keywords.slice(0, 8).map(k => ({
    name: typeof k === 'string' ? k : k.keyword,
    freq: typeof k === 'object' ? k.frequency || 1 : 1,
  }));

  if (data.length === 0) return (
    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
      No keyword data available
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 24, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 10 }}
          angle={-30} textAnchor="end" interval={0}
        />
        <YAxis tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 10 }} width={24} />
        <Tooltip
          contentStyle={{
            background: dark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 12,
            color: dark ? '#e2e8f0' : '#1e293b',
            fontSize: 12,
          }}
        />
        <Bar dataKey="freq" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
