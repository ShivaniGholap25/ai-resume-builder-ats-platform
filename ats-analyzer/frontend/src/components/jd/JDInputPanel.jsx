// ============================================================
// components/jd/JDInputPanel.jsx — JD paste + resume text input
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';

const SAMPLE_JD = `Senior Frontend Engineer

We are looking for a Senior Frontend Engineer to join our growing team.

Requirements:
• 5+ years of experience with React and TypeScript
• Strong proficiency in JavaScript, HTML5, CSS3
• Experience with state management (Redux, Zustand)
• Familiarity with REST APIs and GraphQL
• Experience with testing frameworks (Jest, Cypress)
• Knowledge of CI/CD pipelines and Git workflows
• Strong communication and collaboration skills

Nice to have:
• Experience with Next.js or Remix
• Knowledge of Docker and Kubernetes
• Contributions to open source projects

Responsibilities:
• Build and maintain high-performance web applications
• Collaborate with designers and backend engineers
• Write clean, testable, and well-documented code
• Mentor junior developers`;

export default function JDInputPanel({ onAnalyze, onCompare, isLoading, hasResume, uploadedFile, extractedResumeText }) {
  const [jdText, setJdText]         = useState('');
  const [resumeText, setResumeText] = useState('');
  const [mode, setMode]             = useState(uploadedFile ? 'compare' : 'analyze');
  const [useConnected, setUseConnected] = useState(!!uploadedFile);
  const [charCount, setCharCount]   = useState(0);

  const handleJDChange = (e) => {
    setJdText(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jdText.trim() || jdText.trim().length < 50) return;

    if (mode === 'compare') {
      const activeResumeText = useConnected ? extractedResumeText : resumeText;
      if (activeResumeText.trim().length > 50) {
        onCompare(jdText, activeResumeText);
      }
    } else {
      onAnalyze(jdText);
    }
  };

  const loadSample = () => {
    setJdText(SAMPLE_JD);
    setCharCount(SAMPLE_JD.length);
  };

  const isValid = jdText.trim().length >= 50;
  const activeResumeText = useConnected ? extractedResumeText : resumeText;
  const canCompare = mode === 'compare' && activeResumeText.trim().length >= 50;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {[
          { id: 'analyze', label: '🔍 Analyze JD', desc: 'Extract requirements' },
          { id: 'compare', label: '⚖️ Compare with Resume', desc: 'Match against your resume' },
        ].map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === m.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Connected Resume Info */}
      {mode === 'compare' && uploadedFile && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">📄</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Connected Resume: {uploadedFile.name}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Parsed from ATS dashboard ({extractedResumeText.split(/\s+/).length} words)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useConnected"
              checked={useConnected}
              onChange={(e) => setUseConnected(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="useConnected" className="text-xs font-medium text-emerald-700 dark:text-emerald-300 cursor-pointer">
              Use for Match
            </label>
          </div>
        </div>
      )}

      {/* JD textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Job Description <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${charCount > 12000 ? 'text-rose-500' : 'text-slate-400'}`}>
              {charCount.toLocaleString()} / 15,000
            </span>
            <button
              type="button"
              onClick={loadSample}
              className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 font-medium underline underline-offset-2"
            >
              Load sample
            </button>
          </div>
        </div>
        <textarea
          value={jdText}
          onChange={handleJDChange}
          placeholder="Paste the full job description here — include requirements, responsibilities, and qualifications for best results..."
          rows={10}
          maxLength={15000}
          className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl resize-y
                     bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200
                     placeholder-slate-400 dark:placeholder-slate-500
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                     transition-colors"
        />
        {jdText.length > 0 && jdText.trim().length < 50 && (
          <p className="text-xs text-rose-500 mt-1">Please paste a more complete job description (min 50 characters)</p>
        )}
      </div>

      {/* Resume text (compare mode) */}
      {mode === 'compare' && !useConnected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Resume Text
              <span className="ml-2 text-xs font-normal text-slate-400">(paste your resume content)</span>
            </label>
          </div>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste your resume text here for comparison analysis..."
            rows={7}
            maxLength={20000}
            className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl resize-y
                       bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200
                       placeholder-slate-400 dark:placeholder-slate-500
                       focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent
                       transition-colors"
          />
          {!hasResume && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
              <span>💡</span>
              Tip: You can also analyze a resume first, then use the JD Analyzer from the results page for automatic comparison.
            </p>
          )}
        </motion.div>
      )}

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isLoading || !isValid || (mode === 'compare' && !canCompare)}
        whileHover={!isLoading && isValid && (!mode === 'compare' || canCompare) ? { scale: 1.01 } : {}}
        whileTap={!isLoading && isValid && (!mode === 'compare' || canCompare) ? { scale: 0.99 } : {}}
        className={`w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all
          ${isLoading || !isValid || (mode === 'compare' && !canCompare)
            ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500'
            : mode === 'compare'
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-200 dark:shadow-violet-900/30'
              : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Analyzing...
          </span>
        ) : mode === 'compare' ? (
          canCompare ? '⚖️ Compare JD with Resume' : '⚖️ Compare (paste resume above)'
        ) : (
          '🔍 Analyze Job Description'
        )}
      </motion.button>
    </form>
  );
}
