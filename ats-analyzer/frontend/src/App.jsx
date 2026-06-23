// ============================================================
// App.jsx — Root component with 6-tab professional navigation
// AI Resume Builder & ATS Optimization Platform
// ============================================================

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { analyzeResume }       from './api/analyzeApi';
import DashboardPage           from './components/dashboard/DashboardPage';
import UploadForm              from './components/dashboard/UploadForm';
import ResultsDashboard        from './components/dashboard/ResultsDashboard';
import HistoryPanel            from './components/dashboard/HistoryPanel';
import ResumeBuilderPage       from './components/templates/ResumeBuilderPage';
import ATSAnalyzerPage         from './components/ats-analyzer/ATSAnalyzerPage';
import JobMatchPage            from './components/jd/JobMatchPage';
import AIOptimizerPage         from './components/ai/AIOptimizerPage';

// ── Tab definitions ───────────────────────────────────────────
const TABS = [
  { id: 'dashboard',    label: 'Dashboard',       icon: '🏠' },
  { id: 'builder',      label: 'Resume Builder',  icon: '📄' },
  { id: 'analyze',      label: 'ATS Analysis',    icon: '🎯' },
  { id: 'jd-match',     label: 'Job Match',       icon: '⚖️' },
  { id: 'ai-optimizer', label: 'AI Optimizer',     icon: '🤖' },
  { id: 'history',      label: 'History',          icon: '📜' },
];

const BRAND_NAME = 'AI Resume Builder';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [result,    setResult]    = useState(null);
  const [fileName,  setFileName]  = useState('');

  const navigate = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'analyze') handleReset();
  };

  const handleAnalyze = async (file, jobDescription) => {
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
      setFileName(file.name);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => { setResult(null); setFileName(''); };

  // ── Resume Builder gets its own full-bleed layout ────────
  if (activeTab === 'builder') {
    return (
      <div className="min-h-screen">
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
        <NavBar activeTab={activeTab} onNavigate={navigate} />
        <div className="pt-[56px]">
          <ResumeBuilderPage />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />

      {/* ── Global Navbar ─────────────────────────────────────── */}
      <NavBar activeTab={activeTab} onNavigate={navigate} />

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className={activeTab === 'dashboard' ? '' : 'pt-[56px]'}>
        <AnimatePresence mode="wait">

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="pt-[56px]">
                <DashboardPage onNavigate={navigate} />
              </div>
            </motion.div>
          )}

          {/* ATS Analysis */}
          {activeTab === 'analyze' && (
            <motion.div key="analyze" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {!result ? (
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl mb-4 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">🎯</div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">ATS Resume Analysis</h2>
                    <p className="text-slate-500 dark:text-slate-400">Upload your resume for an instant ATS score, keyword analysis, and improvement tips.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                      { icon: '🎯', label: 'ATS Score',   sub: 'Out of 100'      },
                      { icon: '🔑', label: 'Keywords',    sub: 'Matched vs JD'   },
                      { icon: '💡', label: 'Suggestions', sub: 'Actionable tips' },
                    ].map(s => (
                      <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center shadow-sm">
                        <p className="text-2xl mb-1">{s.icon}</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{s.label}</p>
                        <p className="text-xs text-slate-400">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                    <UploadForm onSubmit={handleAnalyze} isLoading={isLoading} />
                  </div>
                  <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-700 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">Need a new ATS-optimized resume?</p>
                      <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5">Use our Resume Builder with professional templates.</p>
                    </div>
                    <button onClick={() => navigate('builder')}
                      className="shrink-0 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
                      Open Builder →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                  <ResultsDashboard result={result} fileName={fileName} onReset={handleReset} />
                </div>
              )}
            </motion.div>
          )}

          {/* Upload & Extract (now within ATS Analysis as a sub-feature) */}
          {activeTab === 'extract' && (
            <motion.div key="extract" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ATSAnalyzerPage />
            </motion.div>
          )}

          {/* Job Match */}
          {activeTab === 'jd-match' && (
            <motion.div key="jd-match" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <JobMatchPage />
            </motion.div>
          )}

          {/* AI Optimizer */}
          {activeTab === 'ai-optimizer' && (
            <motion.div key="ai-optimizer" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AIOptimizerPage />
            </motion.div>
          )}

          {/* History */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white text-2xl mb-4 shadow-lg shadow-rose-200 dark:shadow-rose-900/40">📜</div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Analysis History</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">View and manage your past resume analyses.</p>
              </motion.div>
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <HistoryPanel />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-accent-600 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">AI</div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{BRAND_NAME}</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Resume Builder · ATS Analysis · Job Match · AI Optimizer
          </p>
        </div>
      </footer>
    </div>
  );
};

// ── Global Navbar Component ─────────────────────────────────────
function NavBar({ activeTab, onNavigate }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[56px] flex items-center justify-between gap-4">
        {/* Logo + Brand */}
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-brand-200 dark:shadow-brand-900/40 group-hover:shadow-brand-300 transition-shadow">
            AI
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{BRAND_NAME}</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">ATS Optimization Platform</p>
          </div>
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default App;
