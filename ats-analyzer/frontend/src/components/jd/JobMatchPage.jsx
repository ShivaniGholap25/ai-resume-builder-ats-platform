// ============================================================
// components/jd/JobMatchPage.jsx — Full-page Job Match tab
// Wraps existing JD components without duplicating logic.
// ============================================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import JDInputPanel    from './JDInputPanel';
import JDOverviewCards from './JDOverviewCards';
import MatchScorePanel from './MatchScorePanel';
import SkillsExtracted from './SkillsExtracted';
import { analyzeJD, compareJDWithResume } from '../../api/jdApi';

const FEATURES = [
  { icon: '🔍', title: 'JD Analysis',  desc: 'Extract skills & requirements' },
  { icon: '⚖️', title: 'Resume Match', desc: 'See alignment or gaps' },
  { icon: '📊', title: 'Skill Radar',  desc: 'Multi-dimension match chart' },
  { icon: '🏷️', title: 'Keyword Gap',  desc: 'Matched vs missing keywords' },
];

export default function JobMatchPage({ uploadedFile, extractedResumeText }) {
  const [isLoading, setIsLoading]   = useState(false);
  const [jdResult, setJdResult]     = useState(null);
  const [comparison, setComparison] = useState(null);
  const [hasResume, setHasResume]   = useState(false);
  const [usedResumeText, setUsedResumeText] = useState('');

  const handleAnalyze = useCallback(async (jdText) => {
    setIsLoading(true); setJdResult(null); setComparison(null);
    try {
      const data = await analyzeJD(jdText);
      setJdResult(data); setHasResume(false);
      toast.success('Job description analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed.');
    } finally { setIsLoading(false); }
  }, []);

  const handleCompare = useCallback(async (jdText, resumeText) => {
    setIsLoading(true); setComparison(null);
    try {
      const data = await compareJDWithResume(jdText, resumeText);
      setJdResult(data.jdAnalysis || data);
      setComparison(data.comparison || data);
      setHasResume(true);
      setUsedResumeText(resumeText);
      toast.success('Comparison complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Comparison failed.');
    } finally { setIsLoading(false); }
  }, []);

  const handleReset = () => {
    setJdResult(null);
    setComparison(null);
    setHasResume(false);
    setUsedResumeText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white text-2xl mb-4 shadow-lg shadow-violet-200 dark:shadow-violet-900/40">⚖️</div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Job Description Matcher</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-base max-w-md mx-auto">
          Paste a job description to extract skills, or compare it against your resume.
        </p>
      </motion.div>

      <AnimatePresence>
        {!jdResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center shadow-sm">
                <p className="text-2xl mb-2">{f.icon}</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{f.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!jdResult ? (
          <motion.div key="input" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
            <JDInputPanel
              onAnalyze={handleAnalyze}
              onCompare={handleCompare}
              isLoading={isLoading}
              hasResume={hasResume}
              uploadedFile={uploadedFile}
              extractedResumeText={extractedResumeText}
            />
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <button onClick={handleReset} className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-800 transition-colors">
              ← Analyze Another Job Description
            </button>
            {comparison && <MatchScorePanel comparison={comparison} jdResult={jdResult} resumeText={usedResumeText} />}
            <JDOverviewCards result={jdResult} />
            <SkillsExtracted result={jdResult} comparison={comparison} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
