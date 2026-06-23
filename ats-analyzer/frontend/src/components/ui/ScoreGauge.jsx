// ============================================================
// components/ui/ScoreGauge.jsx — Circular ATS score display
// ============================================================

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// Returns a color based on the score value
const getScoreColor = (score) => {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#f59e0b'; // amber
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444';                  // red
};

const getScoreBg = (score) => {
  if (score >= 80) return 'bg-green-50 border-green-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  if (score >= 40) return 'bg-orange-50 border-orange-200';
  return 'bg-red-50 border-red-200';
};

const ScoreGauge = ({ score, label }) => {
  const color = getScoreColor(score);
  const bgClass = getScoreBg(score);

  return (
    <div className={`flex flex-col items-center p-6 rounded-2xl border-2 ${bgClass} animate-fade-in`}>
      <div className="w-40 h-40">
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            textSize: '22px',
            pathColor: color,
            textColor: color,
            trailColor: '#e2e8f0',
            pathTransitionDuration: 1.2,
          })}
        />
      </div>
      <p className="mt-4 text-2xl font-bold" style={{ color }}>
        {label}
      </p>
      <p className="text-slate-500 text-sm mt-1">ATS Score out of 100</p>
    </div>
  );
};

export default ScoreGauge;
