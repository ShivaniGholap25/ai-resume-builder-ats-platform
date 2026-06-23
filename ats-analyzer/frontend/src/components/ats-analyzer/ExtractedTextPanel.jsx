// ============================================================
// components/ats-analyzer/ExtractedTextPanel.jsx
//
// Shows the raw text extracted from the uploaded resume.
// Includes:
//   - File metadata (name, type, word count, page count)
//   - Scrollable text preview with copy-to-clipboard
//   - Line highlighting
//
// Props:
//   result  {object}  — Response from POST /api/resume/upload
//   onClear {function} — Reset the page to upload another file
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Metadata stat card ────────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${color} text-center`}>
    <span className="text-xl mb-1">{icon}</span>
    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{value}</p>
    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

// ── Bytes → readable string ───────────────────────────────────
const formatBytes = (b) => {
  if (b < 1024)        return `${b} B`;
  if (b < 1048576)     return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

export default function ExtractedTextPanel({ result, onClear }) {
  const [searchTerm,    setSearchTerm]    = useState('');
  const [copyLabel,     setCopyLabel]     = useState('📋 Copy Text');
  const [showFullText,  setShowFullText]  = useState(false);

  const {
    fileName, fileType, fileSize,
    text, pageCount, wordCount, charCount,
    extractedAt,
  } = result;

  // ── Copy text to clipboard ────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel('✅ Copied!');
      toast.success('Text copied to clipboard');
      setTimeout(() => setCopyLabel('📋 Copy Text'), 2000);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  // ── Highlight search term in text ─────────────────────────
  const getHighlightedText = (raw) => {
    if (!searchTerm.trim()) return raw;
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return raw.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800/60 rounded px-0.5">$1</mark>');
  };

  // ── Preview: show first 3000 chars unless expanded ────────
  const MAX_PREVIEW = 3000;
  const previewText = showFullText ? text : text.slice(0, MAX_PREVIEW);
  const isTruncated = !showFullText && text.length > MAX_PREVIEW;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* ── Top: file info + action buttons ──────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {/* File type icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-md ${
            fileType === 'PDF' ? 'bg-rose-500' : 'bg-blue-500'
          }`}>
            {fileType === 'PDF' ? 'P' : 'W'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm">{fileName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {fileType} · {formatBytes(fileSize)} ·{' '}
              {new Date(extractedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            {copyLabel}
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            🗑️ Upload New
          </button>
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="📄" label="Pages"      value={pageCount}                      color="border-indigo-100 dark:border-indigo-900/40 bg-indigo-50 dark:bg-indigo-900/20"  />
        <StatCard icon="📝" label="Words"      value={wordCount.toLocaleString()}     color="border-violet-100 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-900/20"  />
        <StatCard icon="🔤" label="Characters" value={charCount.toLocaleString()}     color="border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard icon="📊" label="File Type"  value={fileType}                       color="border-amber-100 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20"  />
      </div>

      {/* ── Success notice ────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <span className="text-emerald-500 text-lg shrink-0">✅</span>
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Text extracted successfully from <strong>{fileName}</strong>.
          {wordCount < 150 && (
            <span className="text-amber-600 dark:text-amber-400 ml-1">
              ⚠️ Resume seems short — consider adding more detail.
            </span>
          )}
        </p>
      </div>

      {/* ── Extracted text preview ───────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        {/* Panel header + search */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Extracted Text Preview
          </h3>
          {/* Inline search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search text…"
              className="w-44 pl-8 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
          </div>
        </div>

        {/* Scrollable text area */}
        <div className="relative">
          <pre
            className="px-5 py-4 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed
                       whitespace-pre-wrap break-words overflow-y-auto max-h-[500px] min-h-[200px]"
            // dangerouslySetInnerHTML is safe here — we only inject our own
            // <mark> highlight tags, never user-controlled HTML.
            dangerouslySetInnerHTML={{ __html: getHighlightedText(previewText) }}
          />

          {/* Fade-out gradient at bottom when truncated */}
          {isTruncated && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Show more / show less toggle */}
        {text.length > MAX_PREVIEW && (
          <div className="flex justify-center px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setShowFullText(v => !v)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              {showFullText
                ? '▲ Show less'
                : `▼ Show full text (${(text.length - MAX_PREVIEW).toLocaleString()} more chars)`}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
