// ============================================================
// TemplatePicker.jsx — Template + theme + font selector panel
// ============================================================

import { motion } from 'framer-motion';
import { TEMPLATES, THEMES, FONTS } from '../../data/resumeDefaults';

// ── ATS score colour ──────────────────────────────────────────
const atsColor = (s) =>
  s >= 98 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400'
: s >= 96 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400'
:           'text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400';

export default function TemplatePicker({
  selectedTemplate,
  selectedTheme,
  selectedFont,
  fontSize,
  onTemplate,
  onTheme,
  onFont,
  onFontSize,
}) {
  return (
    <div className="space-y-5">
      {/* ── Templates ───────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Template</h3>
        <div className="space-y-2">
          {TEMPLATES.map((t, i) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => onTemplate(t.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                selectedTemplate === t.id
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-600 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
              }`}
            >
              <span className="text-xl shrink-0">{t.preview}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${selectedTemplate === t.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {t.name}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{t.description}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${atsColor(t.atsScore)}`}>
                ATS {t.atsScore}%
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Themes ──────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Accent Color</h3>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTheme(t.id)}
              title={t.name}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                selectedTheme === t.id
                  ? 'border-indigo-400 shadow-md scale-105'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <span
                className="w-6 h-6 rounded-full shadow-sm border border-white/50 ring-1 ring-slate-200"
                style={{ background: t.accent }}
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Font ────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Font</h3>
        <div className="space-y-1">
          {FONTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFont(f.id)}
              style={{ fontFamily: f.css }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all ${
                selectedFont === f.id
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 bg-white dark:bg-slate-800'
              }`}
            >
              <span>{f.name}</span>
              <span className="text-xs text-slate-400">Aa</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Font Size ────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
          Font Size — <span className="text-indigo-600 dark:text-indigo-400">{fontSize}pt</span>
        </h3>
        <input
          type="range"
          min={9}
          max={12}
          step={0.5}
          value={fontSize}
          onChange={e => onFontSize(parseFloat(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>9pt</span><span>10.5pt</span><span>12pt</span>
        </div>
      </div>

      {/* ── ATS tip ─────────────────────────────────────────── */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
          ✅ All templates are ATS-safe: single-column, standard fonts, no graphics or tables in critical sections.
        </p>
      </div>
    </div>
  );
}
