// ============================================================
// components/ui/IssueCard.jsx — Displays a list of issues
// ============================================================

const severityConfig = {
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: '❌',
    badge: 'bg-red-100 text-red-700',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: '⚠️',
    badge: 'bg-amber-100 text-amber-700',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'ℹ️',
    badge: 'bg-blue-100 text-blue-700',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: '✅',
    badge: 'bg-green-100 text-green-700',
  },
};

/**
 * IssueCard — shows a titled list of issues with a severity style.
 *
 * Props:
 *   title    {string}   — Card heading
 *   items    {string[]} — List of issue strings
 *   severity {string}   — 'error' | 'warning' | 'info' | 'success'
 *   emptyMsg {string}   — Message when items is empty (success state)
 */
const IssueCard = ({ title, items = [], severity = 'warning', emptyMsg = 'No issues found ✅' }) => {
  const config = severityConfig[items.length === 0 ? 'success' : severity];

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-5 animate-slide-up`}>
      <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
        <span>{config.icon}</span>
        {title}
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
          {items.length === 0 ? 'Clear' : `${items.length} issue${items.length > 1 ? 's' : ''}`}
        </span>
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-green-600">{emptyMsg}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
              <span className="mt-0.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IssueCard;
