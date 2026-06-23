// ============================================================
// components/ai/AIOptimizerPage.jsx — Full-page AI Optimizer tab
// Reuses existing aiApi.js endpoints and SuggestionCard component.
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import SuggestionCard from './SuggestionCard';
import {
  checkAIStatus,
  improveSummary,
  rewriteBullets,
  getMissingSkills,
  optimizeATS,
} from '../../api/aiApi';

const TOOLS = [
  { id: 'summary',  icon: '📝', title: 'Improve Summary',          desc: 'Rewrite your professional summary for maximum impact' },
  { id: 'bullets',  icon: '✍️', title: 'Rewrite Experience Bullets', desc: 'Transform weak bullets into powerful achievement statements' },
  { id: 'skills',   icon: '⚡', title: 'Missing Skills',            desc: 'Discover skills you should add based on your target role' },
  { id: 'ats',      icon: '🎯', title: 'ATS Optimization',          desc: 'Get specific tips to improve your ATS compatibility score' },
];

export default function AIOptimizerPage() {
  const [aiStatus, setAiStatus]       = useState(null);
  const [activeTool, setActiveTool]   = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Form fields
  const [resumeText, setResumeText]   = useState('');
  const [jobTitle, setJobTitle]       = useState('');
  const [jobDesc, setJobDesc]         = useState('');

  // Check AI status on mount
  useEffect(() => {
    checkAIStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ configured: false, message: 'Could not reach AI service' }));
  }, []);

  const handleRun = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 30) {
      toast.error('Please paste your resume text (at least 30 characters).');
      return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      let result;

      switch (activeTool) {
        case 'summary':
          result = await improveSummary(resumeText, jobTitle, [], jobDesc);
          setSuggestions([{
            type: 'summary',
            original: resumeText.slice(0, 300),
            improved: result.improved || result.text || JSON.stringify(result),
            reason: 'AI-enhanced professional summary with stronger impact.',
            priority: 'high',
          }]);
          break;

        case 'bullets': {
          const bullets = resumeText.split('\n').filter(l => l.trim().startsWith('•') || l.trim().startsWith('-') || l.trim().startsWith('–'));
          const input = bullets.length > 0 ? bullets.map(b => b.replace(/^[•\-–]\s*/, '').trim()) : [resumeText.slice(0, 200)];
          result = await rewriteBullets(input.slice(0, 8), jobTitle, jobDesc);
          const rewritten = result.rewritten || result.bullets || [];
          setSuggestions(
            (Array.isArray(rewritten) ? rewritten : [rewritten]).map((item, i) => ({
              type: 'bullet',
              original: input[i] || '',
              improved: typeof item === 'string' ? item : item.improved || item.rewritten || JSON.stringify(item),
              reason: typeof item === 'object' ? item.reason : 'Stronger action verb and quantified impact.',
              priority: i < 2 ? 'high' : 'medium',
            }))
          );
          break;
        }

        case 'skills': {
          const currentSkills = resumeText.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g)?.slice(0, 15) || [];
          result = await getMissingSkills(currentSkills, jobTitle, jobDesc);
          const skills = result.missingSkills || result.skills || [];
          setSuggestions(
            (Array.isArray(skills) ? skills : [skills]).map((s, i) => ({
              type: 'skills',
              improved: typeof s === 'string' ? s : s.skill || JSON.stringify(s),
              reason: typeof s === 'object' ? s.reason : 'Frequently required skill for this role.',
              priority: i < 3 ? 'high' : 'medium',
            }))
          );
          break;
        }

        case 'ats':
          result = await optimizeATS(resumeText, 50, [], jobDesc);
          const tips = result.suggestions || result.tips || [];
          setSuggestions(
            (Array.isArray(tips) ? tips : [tips]).map((tip, i) => ({
              type: 'ats',
              improved: typeof tip === 'string' ? tip : tip.suggestion || tip.text || JSON.stringify(tip),
              reason: typeof tip === 'object' ? tip.reason : 'Improves ATS parsing compatibility.',
              priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
            }))
          );
          break;

        default:
          break;
      }

      toast.success('AI suggestions ready!');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'AI request failed.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl mb-4 shadow-lg shadow-amber-200 dark:shadow-amber-900/40">🤖</div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">AI Resume Optimizer</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base max-w-md mx-auto">
          Use AI to rewrite, enhance, and optimize every section of your resume.
        </p>
      </motion.div>

      {/* AI Status Banner */}
      {aiStatus && !aiStatus.configured && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">⚠️ {aiStatus.message}</p>
        </motion.div>
      )}

      {/* Tool Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {TOOLS.map((tool) => (
          <button key={tool.id} onClick={() => { setActiveTool(tool.id); setSuggestions([]); }}
            className={`text-left p-4 rounded-2xl border transition-all card-lift ${
              activeTool === tool.id
                ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-600 shadow-glow-brand'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}>
            <p className="text-2xl mb-2">{tool.icon}</p>
            <p className={`text-xs font-bold mb-0.5 ${activeTool === tool.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'}`}>{tool.title}</p>
            <p className="text-[11px] text-slate-400 leading-snug">{tool.desc}</p>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <AnimatePresence>
        {activeTool && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4 mb-8">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                {activeTool === 'summary' ? 'Professional Summary' : activeTool === 'bullets' ? 'Experience Bullets (one per line, starting with • or -)' : 'Resume Text'} <span className="text-rose-500">*</span>
              </label>
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={6} placeholder="Paste your resume text here..."
                className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl resize-y bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Job Title (optional)</label>
                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Job Description (optional)</label>
                <input value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Paste key requirements..."
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-colors" />
              </div>
            </div>
            <motion.button onClick={handleRun} disabled={isLoading || !resumeText.trim()}
              whileHover={!isLoading ? { scale: 1.01 } : {}} whileTap={!isLoading ? { scale: 0.99 } : {}}
              className={`w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all ${
                isLoading || !resumeText.trim()
                  ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-200 dark:shadow-amber-900/30'
              }`}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Generating AI Suggestions...
                </span>
              ) : (
                `🤖 Run ${TOOLS.find(t => t.id === activeTool)?.title || 'AI Tool'}`
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              🤖 AI Suggestions ({suggestions.length})
            </h3>
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} index={i} type={s.type} original={s.original} improved={s.improved} reason={s.reason} priority={s.priority} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
