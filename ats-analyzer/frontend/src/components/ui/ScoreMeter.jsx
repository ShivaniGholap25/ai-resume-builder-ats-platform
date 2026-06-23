import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

/* Colour stops for the score arc */
const getScoreConfig = (score) => {
  if (score >= 80) return { color: '#22c55e', glow: 'rgba(34,197,94,0.4)',  label: 'Excellent', ring: 'from-green-400 to-emerald-500' };
  if (score >= 60) return { color: '#f59e0b', glow: 'rgba(245,158,11,0.4)', label: 'Good',      ring: 'from-amber-400 to-yellow-500' };
  if (score >= 40) return { color: '#f97316', glow: 'rgba(249,115,22,0.4)', label: 'Fair',      ring: 'from-orange-400 to-amber-500' };
  return              { color: '#ef4444', glow: 'rgba(239,68,68,0.4)',   label: 'Poor',      ring: 'from-red-400 to-rose-500' };
};

/* SVG arc helper */
const polarToCartesian = (cx, cy, r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx, cy, r, startDeg, endDeg) => {
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

export default function ScoreMeter({ score = 0 }) {
  const [displayed, setDisplayed] = useState(0);
  const cfg = getScoreConfig(score);

  /* Animate the number counter */
  useEffect(() => {
    let start = 0;
    const step = () => {
      start += Math.ceil((score - start) / 8);
      if (start >= score) { setDisplayed(score); return; }
      setDisplayed(start);
      requestAnimationFrame(step);
    };
    const t = setTimeout(() => requestAnimationFrame(step), 300);
    return () => clearTimeout(t);
  }, [score]);

  /* Arc geometry — 220° sweep from -110° to +110° */
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2 + 10;
  const R = 88;
  const START_DEG = -110;
  const END_DEG = 110;
  const TOTAL_DEG = END_DEG - START_DEG;
  const fillDeg = START_DEG + (score / 100) * TOTAL_DEG;

  const trackPath = describeArc(CX, CY, R, START_DEG, END_DEG);
  const fillPath  = score > 0 ? describeArc(CX, CY, R, START_DEG, fillDeg) : '';

  /* Needle tip */
  const needle = polarToCartesian(CX, CY, R, fillDeg);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE * 0.72 }}>
        <svg width={SIZE} height={SIZE * 0.72} viewBox={`0 0 ${SIZE} ${SIZE * 0.72}`}>
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={cfg.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={cfg.color} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Track */}
          <path d={trackPath} fill="none" stroke="currentColor"
            strokeWidth="14" strokeLinecap="round"
            className="text-slate-200 dark:text-slate-700" />

          {/* Filled arc */}
          {fillPath && (
            <motion.path
              d={fillPath} fill="none" stroke="url(#arcGrad)"
              strokeWidth="14" strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            />
          )}

          {/* Needle dot */}
          {score > 0 && (
            <motion.circle
              cx={needle.x} cy={needle.y} r="8"
              fill={cfg.color}
              filter="url(#glow)"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
            />
          )}

          {/* Tick marks */}
          {[0, 20, 40, 60, 80, 100].map((v) => {
            const deg = START_DEG + (v / 100) * TOTAL_DEG;
            const outer = polarToCartesian(CX, CY, R + 16, deg);
            const inner = polarToCartesian(CX, CY, R + 8,  deg);
            return (
              <g key={v}>
                <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                  stroke="currentColor" strokeWidth="1.5"
                  className="text-slate-300 dark:text-slate-600" />
                <text x={outer.x} y={outer.y + 4}
                  textAnchor="middle" fontSize="9"
                  className="fill-slate-400 dark:fill-slate-500 font-medium">
                  {v}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Centre score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <motion.span
            className="text-5xl font-black tabular-nums"
            style={{ color: cfg.color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          >
            {displayed}
          </motion.span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-0.5">
            out of 100
          </span>
        </div>
      </div>

      {/* Label badge */}
      <motion.div
        className={`mt-3 px-5 py-1.5 rounded-full text-sm font-bold text-white bg-gradient-to-r ${cfg.ring} shadow-lg`}
        style={{ boxShadow: `0 4px 20px ${cfg.glow}` }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {cfg.label}
      </motion.div>
    </div>
  );
}
