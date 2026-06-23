// ============================================================
// components/ai/SuggestionCard.jsx
// Editable card with original → improved diff + one-click replace
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const priorityColors = {
  high:   'border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/20',
  medium: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
  low:    'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
};

const typeIcons = {
  bullet:  '•',
  summary: '📝',
  skills:  '⚡',
  section: '📋',
  ats:     '🎯',
  verb:    '✍️',
};

/**
 * SuggestionCard
 *
 * Props:
 *   type       {string}   — 'bullet' | 'summary' | 'skills' | 'ats'
 *   original   {string}   — Original text (optional)
 *   improved   {string}   — AI-suggested text
 *   reason     {string}   — Why this change helps
 *   priority   {string}   — 'high' | 'medium' | 'low'
 *   onAccept   {function} — Called with the final text when user accepts
 *   index      {number}
 */
export default function SuggestionCard({
  type = 'bullet',
  original = '',
  improved = '',
  reason = '',
  priority = 'medium',
  onAccept,
  index = 0,
}) {
  const [editedText, setEditedText] = useState(improved);
  const [isEditing, setIsEditing]   = useState(false);
  const [accepted, setAccepted]     = useState(false);
  const [dismissed, setDismissed]   = useState(false);

  if (dismissed) return null;

  const handleAccept = () => {
    setAccepted(true);
    onAccept?.(editedText);
    toast.success('Suggestion applied!', { icon: '✅', duration: 2000 });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedText);
    toast.success('Copied to clipboard', { icon: '📋', duration: 1500 });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border p-4 ${priorityColors[priority]} transition-all`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-base">{typeIcons[type] || '💡'}</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {type}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            priority === 'high'   ? 'bg-rose-500 text-white' :
            priority === 'medium' ? 'bg-amber-500 text-white' :
                                    'bg-blue-500 text-white'
          }`}>
            {priority}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {!accepted && (
            <>
              <button
                onClick={() => setIsEditing(e => !e)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
                title="Edit suggestion"
              >
                <EditIcon />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
                title="Copy to clipboard"
              >
                <CopyIcon />
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-colors"
                title="Dismiss"
              >
                <XIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Original text (if provided) */}
      {original && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Original</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-through leading-relaxed bg-white/40 dark:bg-slate-800/40 rounded-lg px-3 py-2">
            {original}
          </p>
        </div>
      )}

      {/* Improved text — editable or display */}
      <div className="mb-3">
        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">
          {accepted ? '✅ Applied' : 'AI Suggestion'}
        </p>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.textarea
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              value={editedText}
              onChange={e => setEditedText(e.target.value)}
              rows={3}
              className="w-full text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          ) : (
            <motion.p
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-sm leading-relaxed rounded-xl px-3 py-2 ${
                accepted
                  ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/30'
                  : 'text-slate-800 dark:text-slate-200 bg-white/60 dark:bg-slate-800/60'
              }`}
            >
              {editedText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Reason */}
      {reason && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-3 leading-relaxed">
          💡 {reason}
        </p>
      )}

      {/* Accept button */}
      {!accepted && (
        <motion.button
          onClick={handleAccept}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-sm transition-all"
        >
          {isEditing ? '✅ Apply Edited Version' : '⚡ Apply Suggestion'}
        </motion.button>
      )}
    </motion.div>
  );
}

// ── Tiny inline SVG icons ─────────────────────────────────────
const EditIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
