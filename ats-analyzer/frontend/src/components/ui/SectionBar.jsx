import { motion } from 'framer-motion';

const SECTION_META = {
  sections:   { icon: '📋', label: 'Sections',       color: 'from-violet-500 to-purple-600' },
  contact:    { icon: '📞', label: 'Contact Info',    color: 'from-blue-500 to-cyan-500' },
  formatting: { icon: '🎨', label: 'Formatting',      color: 'from-pink-500 to-rose-500' },
  skills:     { icon: '⚡', label: 'Skills Quality',  color: 'from-amber-500 to-orange-500' },
  keywords:   { icon: '🔑', label: 'Keyword Match',   color: 'from-emerald-500 to-green-500' },
};

export default function SectionBar({ breakdown = {} }) {
  return (
    <div className="space-y-3">
      {Object.entries(breakdown).map(([key, val], i) => {
        const meta = SECTION_META[key] || { icon: '📊', label: key, color: 'from-slate-400 to-slate-500' };
        const pct = Math.round((val.score / val.max) * 100);
        return (
          <motion.div key={key}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 + 0.2 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>{meta.icon}</span>{meta.label}
              </span>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                {val.score}<span className="text-slate-400 dark:text-slate-600 font-normal">/{val.max}</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${meta.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.07 + 0.3, ease: 'easeOut' }}
              />
            </div>
            {val.note && (
              <p className="text-xs text-slate-400 mt-0.5">{val.note}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
