// ============================================================
// components/ui/KeywordCloud.jsx — Matched / missing keywords
// ============================================================

/**
 * KeywordCloud — shows matched and missing keywords as pill badges.
 *
 * Props:
 *   matchedKeywords {string[]}
 *   missingKeywords {string[]}
 *   matchPercent    {number}
 */
const KeywordCloud = ({ matchedKeywords = [], missingKeywords = [], matchPercent = 0 }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">🔑 Keyword Match</h3>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
          matchPercent >= 70 ? 'bg-green-100 text-green-700' :
          matchPercent >= 40 ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {matchPercent}% match
        </span>
      </div>

      {/* Matched keywords */}
      {matchedKeywords.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
            ✅ Found in Resume ({matchedKeywords.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing keywords */}
      {missingKeywords.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
            ❌ Missing from Resume ({missingKeywords.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordCloud;
