import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const getMatchColor = (pct) => {
  if (pct >= 70) return ['#22c55e', '#dcfce7'];
  if (pct >= 50) return ['#f59e0b', '#fef3c7'];
  if (pct >= 30) return ['#f97316', '#ffedd5'];
  return ['#ef4444', '#fee2e2'];
};

export default function JobMatchRing({ matchPercent = 0 }) {
  const { dark } = useTheme();
  const [fill, bg] = getMatchColor(matchPercent);
  const data = [
    { name: 'Match',    value: matchPercent },
    { name: 'Gap',      value: 100 - matchPercent },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={46} outerRadius={62}
              startAngle={90} endAngle={-270}
              dataKey="value"
              strokeWidth={0}
              animationBegin={300}
              animationDuration={1000}
            >
              <Cell fill={fill} />
              <Cell fill={dark ? '#1e293b' : '#f1f5f9'} />
            </Pie>
            <Tooltip
              contentStyle={{
                background: dark ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
                border: `1px solid ${fill}40`,
                borderRadius: 10,
                fontSize: 12,
              }}
              formatter={(v, n) => [`${v}%`, n]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.span
            className="text-2xl font-black"
            style={{ color: fill }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
          >
            {matchPercent}%
          </motion.span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">match</span>
        </div>
      </div>

      <div className="flex gap-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: fill }} />
          <span className="text-slate-600 dark:text-slate-400">Matched</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block bg-slate-200 dark:bg-slate-700" />
          <span className="text-slate-600 dark:text-slate-400">Gap</span>
        </span>
      </div>
    </div>
  );
}
