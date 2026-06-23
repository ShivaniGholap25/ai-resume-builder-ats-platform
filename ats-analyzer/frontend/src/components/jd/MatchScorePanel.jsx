// ============================================================
// components/jd/MatchScorePanel.jsx — Resume vs JD match results
// ============================================================

import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';

const getMatchColor = (pct) => {
  if (pct >= 75) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', ring: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,0.3)' };
  if (pct >= 55) return { text: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500',    ring: 'from-blue-400 to-cyan-500',    glow: 'rgba(59,130,246,0.3)' };
  if (pct >= 35) return { text: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500',   ring: 'from-amber-400 to-orange-500', glow: 'rgba(245,158,11,0.3)' };
  return              { text: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-500',    ring: 'from-rose-400 to-red-500',     glow: 'rgba(239,68,68,0.3)' };
};

// Animated circular score
function ScoreRing({ value, label, size = 120, strokeWidth = 10 }) {
  const cfg = getMatchColor(value);
  const r   = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-slate-200 dark:text-slate-700" />
          <motion.circle
            cx={size/2} cy={size/2} r={r}
            fill="none" strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke="url(#ringGrad)"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl font-black ${cfg.text}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">{label}</span>
    </div>
  );
}

// Keyword gap bar chart
const COLORS = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#3b82f6'];

function KeywordGapChart({ matched = [], missing = [] }) {
  const data = [
    ...matched.slice(0, 6).map(k => ({ name: k, type: 'Matched', value: 1 })),
    ...missing.slice(0, 6).map(k => ({ name: k, type: 'Missing', value: 1 })),
  ];

  if (data.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Keyword Distribution</h4>
      <div className="flex flex-wrap gap-2">
        {matched.slice(0, 12).map(k => (
          <span key={k} className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 flex items-center gap-1">
            <span className="text-emerald-500">✓</span>{k}
          </span>
        ))}
        {missing.slice(0, 12).map(k => (
          <span key={k} className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 flex items-center gap-1">
            <span className="text-rose-400">✗</span>{k}
          </span>
        ))}
      </div>
    </div>
  );
}

// Radar chart for multi-dimension match
function MatchRadar({ comparison }) {
  const data = [
    { subject: 'Skills',    score: comparison.skillMatchPct },
    { subject: 'Keywords',  score: comparison.keywordMatchPct },
    { subject: 'Semantic',  score: comparison.semanticScore },
    { subject: 'Overall',   score: comparison.overallMatch },
  ];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
        <Radar name="Match" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
        <Tooltip
          contentStyle={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 12 }}
          formatter={v => [`${v}%`, 'Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default function MatchScorePanel({ comparison }) {
  if (!comparison) return null;

  const {
    overallMatch, skillMatchPct, keywordMatchPct, semanticScore,
    matchedSkills = [], missingSkills = [],
    matchedKeywords = [], missingKeywords = [],
    extraSkills = [], matchLabel, atsTips = [],
  } = comparison;

  const cfg = getMatchColor(overallMatch);

  return (
    <div className="space-y-5">
      {/* Match label banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center justify-between px-5 py-3 rounded-2xl bg-gradient-to-r ${cfg.ring} text-white shadow-lg`}
        style={{ boxShadow: `0 8px 24px ${cfg.glow}` }}
      >
        <div>
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">Overall Match</p>
          <p className="text-2xl font-black">{matchLabel}</p>
        </div>
        <div className="text-5xl font-black opacity-90">{overallMatch}%</div>
      </motion.div>

      {/* Score rings row */}
      <div className="grid grid-cols-3 gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <ScoreRing value={skillMatchPct}   label="Skill Match"    />
        <ScoreRing value={keywordMatchPct} label="Keyword Match"  />
        <ScoreRing value={semanticScore}   label="Semantic Match" />
      </div>

      {/* Radar chart */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Match Dimensions</h4>
        <MatchRadar comparison={comparison} />
      </div>

      {/* Skills gap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Matched skills */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-4">
          <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Matched Skills ({matchedSkills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.length === 0
              ? <p className="text-xs text-slate-400">No skill matches found</p>
              : matchedSkills.slice(0, 15).map(s => (
                <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 capitalize">
                  {s}
                </span>
              ))
            }
          </div>
        </div>

        {/* Missing skills */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-800 p-4">
          <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Missing Skills ({missingSkills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.length === 0
              ? <p className="text-xs text-emerald-600 dark:text-emerald-400">All required skills found! 🎉</p>
              : missingSkills.slice(0, 15).map(s => (
                <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 capitalize">
                  {s}
                </span>
              ))
            }
          </div>
        </div>
      </div>

      {/* Keyword gap */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <KeywordGapChart matched={matchedKeywords} missing={missingKeywords} />
      </div>

      {/* Extra skills (resume has but JD doesn't mention) */}
      {extraSkills.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-blue-800 p-4">
          <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Additional Skills on Resume ({extraSkills.length})
            <span className="text-xs font-normal text-slate-400 ml-1">— not required by this JD</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {extraSkills.slice(0, 12).map(s => (
              <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 capitalize">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
