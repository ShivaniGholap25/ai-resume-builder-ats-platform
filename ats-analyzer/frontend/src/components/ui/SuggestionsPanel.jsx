// ============================================================
// components/ui/SuggestionsPanel.jsx — Improvement suggestions
// ============================================================

const priorityConfig = {
  High:   { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-500 text-white',    dot: 'bg-red-500' },
  Medium: { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-500 text-white',  dot: 'bg-amber-500' },
  Low:    { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-500 text-white',   dot: 'bg-blue-500' },
};

const categoryIcons = {
  'Sections':     '📋',
  'Contact Info': '📞',
  'Formatting':   '🎨',
  'Skills':       '⚡',
  'Keywords':     '🔑',
  'Content':      '📝',
  'General':      '💡',
};

const SuggestionsPanel = ({ suggestions = [] }) => {
  if (suggestions.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-fade-in">
        <p className="text-4xl mb-2">🎉</p>
        <p className="text-green-700 font-semibold">Great job! No major improvements needed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-slide-up">
      <h3 className="text-lg font-semibold text-slate-800 mb-5">
        💡 Improvement Suggestions
        <span className="ml-2 text-sm font-normal text-slate-500">({suggestions.length} tips)</span>
      </h3>

      <div className="space-y-3">
        {suggestions.map((s, i) => {
          const config = priorityConfig[s.priority] || priorityConfig.Low;
          const icon = categoryIcons[s.category] || '💡';

          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-xl border ${config.border} ${config.bg}`}
            >
              {/* Priority dot */}
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${config.dot}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-slate-600">
                    {icon} {s.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                    {s.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{s.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestionsPanel;
