// ============================================================
// components/ai/AIOptimizerPage.jsx — Full-page AI Optimizer tab
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import {
  checkAIStatus,
  improveSummary,
  rewriteBullets,
  getMissingSkills,
  optimizeATS,
} from '../../api/aiApi';

// Helper: Extract professional summary from resume text
const extractSummaryText = (text = '') => {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const summaryIndex = lines.findIndex(l => /\b(summary|objective|profile|about me|overview)\b/i.test(l));
  if (summaryIndex !== -1 && lines[summaryIndex + 1]) {
    let summaryLines = [];
    for (let i = summaryIndex + 1; i < Math.min(lines.length, summaryIndex + 5); i++) {
      if (lines[i].endsWith(':') || (lines[i].length < 30 && lines[i].match(/^[A-Z]/) && !lines[i].endsWith('.'))) {
        break;
      }
      summaryLines.push(lines[i]);
    }
    return summaryLines.join(' ');
  }
  return lines.slice(0, 3).join(' ');
};

// Helper: Extract experience bullet points from resume text
const extractBulletPoints = (text = '') => {
  if (!text) return [];
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('•') || l.startsWith('-') || l.startsWith('*') || l.startsWith('–'))
    .map(l => l.replace(/^[•\-*–]\s*/, '').trim())
    .filter(Boolean);
};

export default function AIOptimizerPage({ uploadedFile, extractedResumeText = '', result }) {
  const [aiStatus, setAiStatus] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard' | 'summary' | 'bullets' | 'skills' | 'ats'

  // Input states
  const [resumeInput, setResumeInput] = useState(extractedResumeText || '');
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [jobDescInput, setJobDescInput] = useState('');

  // Loading states
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isBulletsLoading, setIsBulletsLoading] = useState(false);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);
  const [isAtsLoading, setIsAtsLoading] = useState(false);
  const [bulletLoadingState, setBulletLoadingState] = useState({}); // idx -> bool

  // AI Generated states
  const [optimizedSummary, setOptimizedSummary] = useState(null);
  const [optimizedBullets, setOptimizedBullets] = useState({}); // idx -> rewritten text
  const [skillsData, setSkillsData] = useState(null);
  const [atsData, setAtsData] = useState(null);

  // Sync with App level parsed text if it changes
  useEffect(() => {
    if (extractedResumeText) {
      setResumeInput(extractedResumeText);
    }
  }, [extractedResumeText]);

  // Check AI Status on mount
  useEffect(() => {
    checkAIStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ configured: false, message: 'Could not reach AI service' }));
  }, []);

  // Parse sections
  const originalSummary = extractSummaryText(resumeInput);
  const bullets = extractBulletPoints(resumeInput);

  // Calculate Resume Quality Scores
  const resumeStrength = result?.score || 45;
  
  // Calculate Content Quality (based on action verbs count and metrics)
  const verbsCount = result?.actionVerbsFound?.length || 0;
  const metricsCount = result?.breakdown?.experience?.metricsFound?.length || 0;
  const contentQuality = Math.min(100, Math.max(30, 45 + verbsCount * 8 + metricsCount * 12));

  // Calculate ATS Readiness (based on formatting issues and missing sections)
  const missingCount = result?.missingSections?.length || 0;
  const formattingCount = result?.formattingIssues?.length || 0;
  const atsReadiness = Math.max(25, 100 - (missingCount * 15) - (formattingCount * 10));

  // Helper: Copy text to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { icon: '📋' });
  };

  // ── 1. Summary Optimizer Action
  const handleOptimizeSummary = async () => {
    if (!originalSummary) {
      toast.error('No summary detected. Please write or paste your summary first.');
      return;
    }
    setIsSummaryLoading(true);
    try {
      const response = await improveSummary(originalSummary, jobTitleInput, [], jobDescInput);
      setOptimizedSummary(response);
      toast.success('Summary optimized successfully!');
    } catch (err) {
      // Fallback mock generation if OpenAI is unconfigured
      console.warn('AI summary failed, using smart fallback:', err.message);
      const title = jobTitleInput || 'Professional';
      setOptimizedSummary({
        improved: `Results-driven ${title} with a proven track record of designing high-performance applications and optimizing user experiences. Adept at leveraging modern methodologies and collaborating with cross-functional teams to deliver scalable solutions that drive measurable business growth.`,
        changes: [
          'Added strong action verbs (results-driven, designing, optimizing).',
          'Tailored summary language for a professional recruiter appeal.',
          'Spelled out business impact and scalability concepts.'
        ],
        keywords_added: [title, 'Scalable solutions', 'User experiences']
      });
      toast.success('Summary optimized (Demo Mode)!');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // ── 2. Bullet Optimizer Action (Single Bullet)
  const handleOptimizeBullet = async (index, bulletText) => {
    setBulletLoadingState(prev => ({ ...prev, [index]: true }));
    try {
      const response = await rewriteBullets([bulletText], jobTitleInput, jobDescInput);
      const rewritten = response.rewrites?.[0]?.improved || response.improved || bulletText;
      setOptimizedBullets(prev => ({ ...prev, [index]: rewritten }));
      toast.success('Bullet point optimized!');
    } catch (err) {
      // Fallback mock bullet rewrite
      console.warn('AI bullet failed, using smart fallback:', err.message);
      const verbs = ['Spearheaded', 'Optimized', 'Architected', 'Implemented', 'Engineered'];
      const verb = verbs[index % verbs.length];
      const improved = `${verb} development of key user interface modules, improving application responsiveness by 35% and increasing user engagement.`;
      setOptimizedBullets(prev => ({ ...prev, [index]: improved }));
      toast.success('Bullet optimized (Demo Mode)!');
    } finally {
      setBulletLoadingState(prev => ({ ...prev, [index]: false }));
    }
  };

  // ── 3. Skills Optimizer Action
  const handleFetchSkills = async () => {
    setIsSkillsLoading(true);
    const currentSkills = result?.breakdown?.skills?.techSkillsFound || [];
    try {
      const response = await getMissingSkills(currentSkills, jobTitleInput, jobDescInput);
      setSkillsData(response);
      toast.success('Skills recommendations loaded!');
    } catch (err) {
      // Fallback skills recommendations
      console.warn('AI skills failed, using fallback:', err.message);
      setSkillsData({
        missing_technical: [
          { skill: 'TypeScript', importance: 'high', reason: 'Critical for type-safety and modern React scaling.' },
          { skill: 'Docker', importance: 'medium', reason: 'Essential for devops containerization consistency.' },
          { skill: 'Next.js', importance: 'high', reason: 'Standard modern framework for SSR React applications.' }
        ],
        missing_soft: [
          { skill: 'Technical Mentorship', importance: 'medium', reason: 'Required for senior roles to guide juniors.' },
          { skill: 'Cross-functional Collaboration', importance: 'high', reason: 'Core collaboration attribute.' }
        ],
        missing_certifications: ['AWS Certified Developer', 'Certified ScrumMaster (CSM)'],
        priority_skills: ['TypeScript', 'Next.js', 'System Design']
      });
      toast.success('Skills recommendations loaded (Demo Mode)!');
    } finally {
      setIsSkillsLoading(false);
    }
  };

  // ── 4. ATS Optimizer Center Action
  const handleFetchAtsCenter = async () => {
    setIsAtsLoading(true);
    try {
      const response = await optimizeATS(resumeInput, resumeStrength, result?.formattingIssues || [], jobDescInput, result?.missingSections || []);
      setAtsData(response);
      toast.success('ATS Optimization Center suggestions updated!');
    } catch (err) {
      // Fallback ATS suggestions
      console.warn('AI ATS suggestions failed, using fallback:', err.message);
      setAtsData({
        quick_wins: [
          { action: 'Add measurable impact numbers (e.g. percentages, user counts) to your experience bullets.', impact: 'high', effort: 'medium' },
          { action: 'Sprout standard headings: change "Tech Stack" to "Skills" for parser indexing.', impact: 'high', effort: 'easy' }
        ],
        formatting_fixes: [
          'Replace decorative underlines or divider lines to prevent parsing breaks.',
          'Eliminate multi-column layout tabs for direct top-to-bottom parser compatibility.'
        ],
        keyword_recommendations: result?.missingKeywords?.slice(0, 5) || ['React', 'TypeScript', 'Agile', 'CI/CD'],
        section_improvements: [
          { section: 'Skills', current_issue: 'Contains generic terms like "team player".', recommendation: 'Focus on technical stacks and hard methodologies.' }
        ],
        estimated_score_gain: 15
      });
      toast.success('ATS Optimization suggestions loaded (Demo Mode)!');
    } finally {
      setIsAtsLoading(false);
    }
  };

  const handleRunAll = () => {
    handleFetchSkills();
    handleFetchAtsCenter();
  };

  // Setup Priority Cards for ATS Suggestions
  const highPriority = [];
  const mediumPriority = [];
  const lowPriority = [];

  // Parse missing sections as high priority
  if (result?.missingSections?.length > 0) {
    highPriority.push({
      title: 'Missing Section Headings',
      desc: `Your resume is missing standard sections: ${result.missingSections.join(', ')}. ATS systems will fail to index these.`,
      icon: '📋'
    });
  }

  // Parse formatting issues as high/medium
  if (result?.formattingIssues?.length > 0) {
    result.formattingIssues.forEach(issue => {
      highPriority.push({
        title: 'Formatting Warning',
        desc: issue,
        icon: '🎨'
      });
    });
  }

  // Parse AI ATS center quick wins into priority groups
  if (atsData?.quick_wins) {
    atsData.quick_wins.forEach(win => {
      const card = { title: 'ATS Quick Win', desc: win.action, icon: '🎯' };
      if (win.impact === 'high') highPriority.push(card);
      else if (win.impact === 'medium') mediumPriority.push(card);
      else lowPriority.push(card);
    });
  }

  if (atsData?.formatting_fixes) {
    atsData.formatting_fixes.forEach(fix => {
      mediumPriority.push({ title: 'Parser Layout Fix', desc: fix, icon: '🏗️' });
    });
  }

  // Fallbacks if lists are empty
  if (highPriority.length === 0) {
    highPriority.push({ title: 'No High Priority Issues', desc: 'No critical formatting or structural issues found. Great job!', icon: '✨' });
  }
  if (mediumPriority.length === 0) {
    mediumPriority.push({ title: 'Check Keyword Densities', desc: 'Add matching keywords from the job description to improve search rank.', icon: '🔑' });
  }
  if (lowPriority.length === 0) {
    lowPriority.push({ title: 'Review File Extension', desc: 'Ensure you submit in .docx or a clean, searchable PDF layout.', icon: '💾' });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* ── Page Header ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>🤖</span> AI Resume Optimizer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Optimize your professional summary, experience bullets, and skills alignment using AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAll}
            disabled={isSkillsLoading || isAtsLoading || !resumeInput.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 uppercase tracking-wider"
          >
            <span>⚡</span> Run Full AI Analysis
          </button>
        </div>
      </div>

      {/* AI Status Banner */}
      {aiStatus && !aiStatus.configured && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl">
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
            💡 <strong>API Status</strong>: {aiStatus.message}. Running in local Simulation Mode.
          </p>
        </div>
      )}

      {/* ── Resume Input Area ──────────────────────────────── */}
      {uploadedFile ? (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Connected Resume: {uploadedFile.name}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Automatically pre-filled and optimized from Dashboard data ({resumeInput.split(/\s+/).length} words).
              </p>
            </div>
          </div>
          <button
            onClick={() => handleCopy(resumeInput)}
            className="px-3.5 py-1.5 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-lg hover:bg-emerald-100/50 transition-colors"
          >
            Copy Text
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Resume Text Input <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={resumeInput}
              onChange={e => setResumeInput(e.target.value)}
              placeholder="Paste your plain resume text here to enable AI parsing..."
              rows={5}
              className="w-full px-4 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-xl resize-y bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
            />
          </div>
        </div>
      )}

      {/* Target Job Optimization Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            Target Job Title
          </label>
          <input
            value={jobTitleInput}
            onChange={e => setJobTitleInput(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
            className="w-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            Target Job Description (JD)
          </label>
          <input
            value={jobDescInput}
            onChange={e => setJobDescInput(e.target.value)}
            placeholder="Paste description snippets or key keywords..."
            className="w-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* ── Tabs navigation ────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none gap-2">
        {[
          { id: 'dashboard', label: '🏠 Quality Dashboard' },
          { id: 'summary', label: '📝 Summary Optimizer' },
          { id: 'bullets', label: '✍️ Experience Optimizer' },
          { id: 'skills', label: '⚡ Skills Recommend' },
          { id: 'ats', label: '🎯 ATS Optimization Center' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all uppercase tracking-wider ${
              activeSection === tab.id
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Contents ────────────────────────────────────── */}
      <div className="space-y-6">
        
        {/* TAB 1: QUALITY DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Resume Strength */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  Resume Strength Score
                </p>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-8 border-slate-100 dark:border-slate-700 relative">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{resumeStrength}%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  Overall rating computed from structure, contact information, and tech skill depth.
                </p>
              </div>

              {/* Content Quality */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  Content Quality Score
                </p>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-8 border-slate-100 dark:border-slate-700 relative">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{contentQuality}%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  Reflects verb choices, action statements, and usage of quantifiable metrics in job bullets.
                </p>
              </div>

              {/* ATS Readiness */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  ATS Readiness Score
                </p>
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-8 border-slate-100 dark:border-slate-700 relative">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{atsReadiness}%</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                  Evaluates formatting complexity, tab counts, and layout friendliness for parser engines.
                </p>
              </div>

            </div>

            {/* Quick summary tips */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-wider">
                Overview Quality Assessment
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Your resume shows {resumeStrength >= 80 ? 'exceptional structure and depth' : resumeStrength >= 60 ? 'solid foundations but with areas that require updates' : 'multiple gaps and formatting warnings'}.
                Your experience section uses <strong>{verbsCount}</strong> strong verbs and <strong>{metricsCount}</strong> quantifiable achievements. 
                Switch to the other tabs above to optimize summaries, rewrite bullets, and examine missing skills lists.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: SUMMARY OPTIMIZER */}
        {activeSection === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Original Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-wider flex items-center gap-1">
                  <span>📄</span> Original Summary
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl min-h-[120px]">
                  {originalSummary || 'No professional summary detected in your resume text.'}
                </p>
              </div>
              <button
                onClick={handleOptimizeSummary}
                disabled={isSummaryLoading || !originalSummary}
                className="mt-4 w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {isSummaryLoading ? 'Optimizing Summary...' : '✨ Optimize Summary with AI'}
              </button>
            </div>

            {/* AI Optimized Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-wider flex items-center gap-1">
                  <span>🤖</span> AI Optimized Summary
                </h3>
                {optimizedSummary ? (
                  <div className="space-y-4">
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 rounded-xl min-h-[120px]">
                      {optimizedSummary.improved}
                    </p>
                    
                    {/* Added Keywords */}
                    {optimizedSummary.keywords_added?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Keywords Incorporated</p>
                        <div className="flex flex-wrap gap-1.5">
                          {optimizedSummary.keywords_added.map(kw => (
                            <span key={kw} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-600">
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl min-h-[120px] text-center">
                    <p className="text-xs text-slate-400">Optimized summary will generate here.</p>
                  </div>
                )}
              </div>
              
              {optimizedSummary && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleCopy(optimizedSummary.improved)}
                    className="py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Copy Summary
                  </button>
                  <button
                    onClick={handleOptimizeSummary}
                    className="py-2 bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-900 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: EXPERIENCE OPTIMIZER */}
        {activeSection === 'bullets' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Experience & Project Bullets
            </h3>
            
            {bullets.length > 0 ? (
              <div className="space-y-4">
                {bullets.slice(0, 8).map((bullet, idx) => {
                  const isRewriting = bulletLoadingState[idx];
                  const improved = optimizedBullets[idx];

                  return (
                    <div key={idx} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/20">
                      {/* Original */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Original Bullet
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                          • {bullet}
                        </p>
                      </div>

                      {/* AI Rewritten */}
                      {improved ? (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                            ATS-Optimized Version
                          </span>
                          <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                            • {improved}
                          </p>
                        </div>
                      ) : null}

                      {/* Actions */}
                      <div className="flex gap-2 justify-end pt-1">
                        {improved ? (
                          <>
                            <button
                              onClick={() => handleCopy(improved)}
                              className="px-3 py-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => handleOptimizeBullet(idx, bullet)}
                              className="px-3 py-1 bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg hover:bg-slate-900"
                            >
                              Regenerate
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOptimizeBullet(idx, bullet)}
                            disabled={isRewriting}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold uppercase rounded-lg transition-colors disabled:bg-slate-300"
                          >
                            {isRewriting ? 'Rewriting...' : '✨ Rewrite Bullet'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                <p className="text-xs text-slate-400">
                  No experience bullet points detected (lines starting with •, -, or *).
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SKILLS RECOMMENDATIONS */}
        {activeSection === 'skills' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Technical & Soft Skills Recommendations
                </h3>
                <button
                  onClick={handleFetchSkills}
                  disabled={isSkillsLoading}
                  className="px-4 py-1.5 border border-amber-500 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 uppercase tracking-wider"
                >
                  {isSkillsLoading ? 'Fetching Skills...' : '🔄 Retrieve Skills Advice'}
                </button>
              </div>

              {skillsData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recommended Tech Skills */}
                  <div className="p-4 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Suggested Technical Skills
                    </h4>
                    <div className="space-y-2">
                      {skillsData.missing_technical?.map(item => (
                        <div key={item.skill} className="text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {item.skill}
                            <span className={`ml-2 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase ${
                              item.importance === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.importance}
                            </span>
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Soft Skills */}
                  <div className="p-4 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Suggested Soft Skills
                    </h4>
                    <div className="space-y-2">
                      {skillsData.missing_soft?.map(item => (
                        <div key={item.skill} className="text-xs">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {item.skill}
                            <span className="ml-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                              {item.importance}
                            </span>
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Industry Relevant */}
                  {skillsData.missing_certifications?.length > 0 && (
                    <div className="p-4 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-3 md:col-span-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        Industry-Relevant Credentials
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {skillsData.missing_certifications.map(cert => (
                          <span key={cert} className="px-3 py-1 bg-violet-50 dark:bg-violet-950/20 text-violet-800 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 text-xs rounded-lg font-medium">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                  <p className="text-xs text-slate-400">
                    Click "Retrieve Skills Advice" to fetch AI recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ATS OPTIMIZATION CENTER */}
        {activeSection === 'ats' && (
          <div className="space-y-6">
            
            {/* Action buttons */}
            <div className="flex bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  ATS Layout & Keyword Gaps
                </h3>
              </div>
              <button
                onClick={handleFetchAtsCenter}
                disabled={isAtsLoading}
                className="px-4 py-1.5 border border-amber-500 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/20 uppercase tracking-wider"
              >
                {isAtsLoading ? 'Analyzing...' : '🔄 Update suggestions'}
              </button>
            </div>

            {/* Gap lists */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* High Priority */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-800 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  High Priority
                </h3>
                <div className="space-y-3">
                  {highPriority.map((item, idx) => (
                    <div key={idx} className="p-3 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-rose-800 dark:text-rose-300">{item.icon} {item.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medium Priority */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-amber-800 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Medium Priority
                </h3>
                <div className="space-y-3">
                  {mediumPriority.map((item, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-amber-800 dark:text-amber-300">{item.icon} {item.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Priority */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-blue-200 dark:border-blue-800 p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Low Priority
                </h3>
                <div className="space-y-3">
                  {lowPriority.map((item, idx) => (
                    <div key={idx} className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-blue-800 dark:text-blue-300">{item.icon} {item.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      
    </div>
  );
}
