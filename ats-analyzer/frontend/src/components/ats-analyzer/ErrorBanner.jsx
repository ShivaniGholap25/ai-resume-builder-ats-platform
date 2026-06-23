// ============================================================
// components/ats-analyzer/ErrorBanner.jsx
//
// Displays upload / extraction errors with a helpful message
// and a retry button.
//
// Props:
//   message  {string}    — Main error message
//   details  {string}    — Optional technical detail
//   onRetry  {function}  — Called when user clicks "Try Again"
// ============================================================

import { motion } from 'framer-motion';

// ── Map common error patterns to friendlier messages ─────────
const FRIENDLY_MESSAGES = {
  'scanned image':   'This appears to be a scanned PDF. Please use a text-based PDF or convert to DOCX.',
  'file-too-large':  'The file exceeds the 10 MB limit. Try compressing or converting your resume.',
  'unsupported':     'Only PDF and DOCX files are supported.',
  'no file':         'No file was received by the server. Please try uploading again.',
  'network':         'Could not reach the server. Make sure the backend is running on port 5000.',
  'timeout':         'The request timed out. Check your connection and try again.',
};

const getFriendlyMessage = (raw = '') => {
  const lower = raw.toLowerCase();
  for (const [key, msg] of Object.entries(FRIENDLY_MESSAGES)) {
    if (lower.includes(key)) return msg;
  }
  return raw;
};

export default function ErrorBanner({ message = 'An error occurred.', details = '', onRetry }) {
  const friendly = getFriendlyMessage(message);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="w-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-5"
    >
      <div className="flex items-start gap-3">
        {/* Error icon */}
        <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-rose-500 text-base">❌</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Main message */}
          <h4 className="text-sm font-semibold text-rose-800 dark:text-rose-300 mb-1">
            Upload Failed
          </h4>
          <p className="text-sm text-rose-700 dark:text-rose-400 leading-relaxed">
            {friendly}
          </p>

          {/* Technical detail (collapsible) */}
          {details && details !== message && (
            <p className="text-xs text-rose-500 dark:text-rose-500 mt-2 font-mono bg-rose-100 dark:bg-rose-900/40 rounded-lg px-3 py-2 break-all">
              {details}
            </p>
          )}

          {/* Checklist of common causes */}
          <div className="mt-3 space-y-1">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">Common causes:</p>
            {[
              'File is a scanned image PDF (not machine-readable text)',
              'File is password-protected or corrupted',
              'File type is not PDF or DOCX',
              'File exceeds the 10 MB size limit',
              'Backend server is not running',
            ].map((cause, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                <span className="shrink-0 mt-0.5">•</span>
                <span>{cause}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 w-full py-2.5 text-sm font-semibold text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
        >
          ↺ Try Again
        </button>
      )}
    </motion.div>
  );
}
