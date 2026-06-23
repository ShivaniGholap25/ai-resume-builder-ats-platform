// ============================================================
// components/ats-analyzer/UploadProgress.jsx
//
// Animated progress bar shown while the file is being uploaded.
//
// Props:
//   progress  {number}  — 0 to 100
//   fileName  {string}  — Name of the file being uploaded
//   status    {string}  — 'uploading' | 'extracting' | 'done' | 'error'
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';

// Status → label + colour config
const STATUS_CONFIG = {
  uploading:  { label: 'Uploading file…',       bar: 'from-indigo-500 to-violet-500',  icon: '⬆️' },
  extracting: { label: 'Extracting text…',      bar: 'from-violet-500 to-purple-600',  icon: '🔍' },
  done:       { label: 'Extraction complete!',  bar: 'from-emerald-400 to-green-500',  icon: '✅' },
  error:      { label: 'Upload failed',         bar: 'from-rose-400 to-red-500',       icon: '❌' },
};

export default function UploadProgress({ progress = 0, fileName = '', status = 'uploading' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.uploading;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{cfg.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {fileName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{cfg.label}</p>
            </div>
          </div>

          {/* Percentage badge */}
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${cfg.bar} shrink-0 ml-3`}>
            {status === 'done' ? '100%' : status === 'error' ? 'Error' : `${progress}%`}
          </span>
        </div>

        {/* Progress track */}
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
            initial={{ width: 0 }}
            animate={{
              width: status === 'done'  ? '100%' :
                     status === 'error' ? '100%' :
                     `${progress}%`
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Animated dots for "in progress" states */}
        {(status === 'uploading' || status === 'extracting') && (
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
