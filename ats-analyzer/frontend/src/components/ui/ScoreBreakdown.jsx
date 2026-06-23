// ============================================================
// components/ui/ScoreBreakdown.jsx — Category score bars
// ============================================================

const categoryIcons = {
  sections:   '📋',
  contact:    '📞',
  formatting: '🎨',
  skills:     '⚡',
  keywords:   '🔑',
};

const categoryLabels = {
  sections:   'Sections',
  contact:    'Contact Info',
  formatting: 'Formatting',
  skills:     'Skills Quality',
  keywords:   'Keyword Match',
};

const getBarColor = (percent) => {
  if (percent >= 80) return 'bg-green-500';
  if (percent >= 60) return 'bg-amber-400';
  if (percent >= 40) return 'bg-orange-400';
  return 'bg-red-400';
};

const ScoreBreakdown = ({ breakdown }) => {
  if (!breakdown) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-slide-up">
      <h3 className="text-lg font-semibold text-slate-800 mb-5">Score Breakdown</h3>
      <div className="space-y-4">
        {Object.entries(breakdown).map(([key, value]) => {
          const percent = Math.round((value.score / value.max) * 100);
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">
                  {categoryIcons[key]} {categoryLabels[key] || key}
                </span>
                <span className="text-sm font-bold text-slate-600">
                  {value.score}/{value.max}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-700 ${getBarColor(percent)}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              {value.note && (
                <p className="text-xs text-slate-400 mt-1">{value.note}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdown;
