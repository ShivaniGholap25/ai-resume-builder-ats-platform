// ============================================================
// ResultsDashboard.jsx — Professional Recruiter-Style ATS Dashboard
//
// Single-page layout showing all analysis results at once:
//   • Score hero with arc gauge + quality badge
//   • Resume summary card
//   • 7-category breakdown with animated bars
//   • Strengths & weaknesses panels
//   • Sections checklist
//   • Issues panels
//   • Keywords cloud
//   • Actionable suggestions
//
// Data shape from backend (atsScorer.js):
//   { score, scoreLabel, sectionScores, breakdown, strengths,
//     weaknesses, suggestions, sectionsFound, contactIssues,
//     formattingIssues, skillsIssues, matchedKeywords,
//     missingKeywords, keywordMatch, wordCount }
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import ScoreMeter          from '../ui/ScoreMeter';
import SectionsChecklist   from '../ui/SectionsChecklist';
import IssueCard           from '../ui/IssueCard';
import KeywordCloud        from '../ui/KeywordCloud';
import SuggestionsPanel    from '../ui/SuggestionsPanel';

// ── Score colour helpers ──────────────────────────────────────
const scoreColor = (score) =>
  score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
  score >= 60 ? 'text-amber-600 dark:text-amber-400'     : 'text-rose-600 dark:text-rose-400';

const scoreBadge = (score) =>
  score >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' :
  score >= 60 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700' :
                'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700';

const scoreGradient = (score) =>
  score >= 80 ? 'from-emerald-500 to-teal-600' :
  score >= 60 ? 'from-amber-500 to-orange-600' : 'from-rose-500 to-red-600';

// ── Per-category metadata ─────────────────────────────────────
const CATEGORY_META = {
  contact:    { icon: '📞', label: 'Contact Information', max: 10, color: 'bg-blue-500',    lightBg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-800' },
  skills:     { icon: '⚡', label: 'Skills',             max: 20, color: 'bg-indigo-500',  lightBg: 'bg-indigo-50 dark:bg-indigo-900/20',  border: 'border-indigo-200 dark:border-indigo-800' },
  education:  { icon: '🎓', label: 'Education',          max: 15, color: 'bg-violet-500',  lightBg: 'bg-violet-50 dark:bg-violet-900/20',  border: 'border-violet-200 dark:border-violet-800' },
  experience: { icon: '💼', label: 'Experience',         max: 20, color: 'bg-amber-500',   lightBg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800' },
  projects:   { icon: '🚀', label: 'Projects',           max: 15, color: 'bg-teal-500',    lightBg: 'bg-teal-50 dark:bg-teal-900/20',    border: 'border-teal-200 dark:border-teal-800' },
  structure:  { icon: '🏗️', label: 'Structure',         max: 10, color: 'bg-slate-500',   lightBg: 'bg-slate-50 dark:bg-slate-800/40',   border: 'border-slate-200 dark:border-slate-700' },
  keywords:   { icon: '🔑', label: 'Keywords',           max: 10, color: 'bg-rose-500',    lightBg: 'bg-rose-50 dark:bg-rose-900/20',    border: 'border-rose-200 dark:border-rose-800' },
};

// ── Stagger animation ─────────────────────────────────────────
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ── Category Score Card ───────────────────────────────────────
function CategoryCard({ catKey, cat, delay }) {
  const meta = CATEGORY_META[catKey] || { icon: '📊', label: catKey, max: 10, color: 'bg-slate-400', lightBg: 'bg-slate-50', border: 'border-slate-200' };
  const pct = Math.round((cat.score / cat.max) * 100);
  const status = pct >= 80 ? '✅' : pct >= 60 ? '⚡' : '⚠️';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`${meta.lightBg} border ${meta.border} rounded-2xl p-4 transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{meta.icon}</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{meta.label}</span>
        </div>
        <span className="text-xs">{status}</span>
      </div>

      {/* Score */}
      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{cat.score}</span>
        <span className="text-sm text-slate-400 dark:text-slate-500 font-medium mb-0.5">/ {cat.max}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-700/60 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${meta.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.15, ease: 'easeOut' }}
        />
      </div>

      {/* Percentage label */}
      <p className={`text-xs font-semibold mt-1.5 ${
        pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
        pct >= 60 ? 'text-amber-600 dark:text-amber-400' :
                    'text-rose-600 dark:text-rose-400'
      }`}>
        {pct}%
      </p>
    </motion.div>
  );
}

// ── Strength / Weakness Card ──────────────────────────────────
function InsightCard({ item, type, index }) {
  const isStrength = type === 'strength';
  return (
    <motion.div
      initial={{ opacity: 0, x: isStrength ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 + 0.2 }}
      className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm ${
        isStrength
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
      }`}
    >
      <span className="text-base mt-0.5 shrink-0">{isStrength ? '✅' : '⚠️'}</span>
      <div className="min-w-0">
        <p className="font-bold text-sm">{item.category}
          <span className="ml-2 text-xs font-normal opacity-70">{item.score}/{item.max} pts</span>
        </p>
        <p className="mt-0.5 text-xs opacity-80 leading-snug">{item.detail}</p>
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ResultsDashboard({ result, fileName, onReset }) {
  const {
    score, scoreLabel,
    breakdown,
    strengths  = [],
    weaknesses = [],
    suggestions = [],
    sectionsFound = {},
    contactIssues = [],
    formattingIssues = [],
    skillsIssues = [],
    matchedKeywords = [],
    missingKeywords = [],
    keywordMatch,
    wordCount,
  } = result;

  // Derive issues from breakdown if not provided directly
  const allContactIssues    = contactIssues.length    ? contactIssues    : (breakdown?.contact?.missing  || []).map(m => `Missing: ${m}`);
  const allFormattingIssues = formattingIssues.length ? formattingIssues : (breakdown?.structure?.issues || []);

  // Count totals for summary
  const totalIssues = allContactIssues.length + allFormattingIssues.length + skillsIssues.length;
  const categoriesAbove80 = breakdown ? Object.values(breakdown).filter(c => (c.score / c.max) >= 0.8).length : 0;

  return (
    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto pb-12">

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">ATS Analysis Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            📄 {fileName}&nbsp;&nbsp;·&nbsp;&nbsp;{wordCount?.toLocaleString()} words
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-5 py-2.5 text-sm font-semibold text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-700 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
        >
          ← Analyze Another
        </button>
      </div>

      {/* ── Score Hero Section ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Score Gauge */}
          <div className="flex flex-col items-center justify-center p-8 lg:border-r border-slate-200 dark:border-slate-700">
            <ScoreMeter score={score} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className={`mt-4 px-4 py-1.5 rounded-full text-xs font-bold border ${scoreBadge(score)}`}
            >
              {scoreLabel}
            </motion.div>
          </div>

          {/* Resume Summary Card */}
          <div className="lg:col-span-2 p-6 lg:p-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              📊 Resume Quality Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <SummaryStatCard
                icon="🎯" label="ATS Score" value={`${score}/100`}
                color={scoreColor(score)} delay={0.3}
              />
              <SummaryStatCard
                icon="✅" label="Strong Areas" value={`${categoriesAbove80}/7`}
                color="text-emerald-600 dark:text-emerald-400" delay={0.4}
              />
              <SummaryStatCard
                icon="⚠️" label="Issues Found" value={totalIssues}
                color={totalIssues > 3 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'} delay={0.5}
              />
              <SummaryStatCard
                icon="💡" label="Suggestions" value={suggestions.length}
                color="text-blue-600 dark:text-blue-400" delay={0.6}
              />
            </div>

            {/* Quality level description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className={`p-4 rounded-xl bg-gradient-to-r ${scoreGradient(score)} bg-opacity-10`}
            >
              <div className={`p-3 rounded-lg ${
                score >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/30' :
                score >= 60 ? 'bg-amber-50 dark:bg-amber-900/30' :
                              'bg-rose-50 dark:bg-rose-900/30'
              }`}>
                <p className={`text-sm font-bold mb-1 ${scoreColor(score)}`}>
                  {score >= 80 ? '🏆 Excellent Resume' : score >= 60 ? '⚡ Good Resume — Room for Improvement' : '🔧 Needs Improvement'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {score >= 80
                    ? 'Your resume is well-optimized for ATS systems. Strong sections, good keyword coverage, and professional formatting.'
                    : score >= 60
                    ? `Your resume has solid foundations but ${weaknesses.length} area(s) need attention. Focus on the suggestions below to boost your score.`
                    : `Your resume needs significant improvements in ${weaknesses.length} area(s). Follow the high-priority suggestions below to improve ATS compatibility.`
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Category Breakdown Grid ───────────────────────────── */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          📋 Category Breakdown
          <span className="text-xs font-normal text-slate-400">(7 scoring categories)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {breakdown && Object.entries(breakdown).map(([k, cat], i) => (
            <CategoryCard key={k} catKey={k} cat={cat} delay={i * 0.06} />
          ))}
        </div>
      </section>

      {/* ── Strengths & Weaknesses ─────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-5 shadow-sm">
          <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
            ✅ Strengths
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              {strengths.length} found
            </span>
          </h3>
          <div className="space-y-2.5">
            {strengths.length > 0
              ? strengths.map((s, i) => <InsightCard key={i} item={s} type="strength" index={i} />)
              : <p className="text-xs text-slate-400 py-4 text-center">No major strengths detected — improve your resume to see positive signals</p>
            }
          </div>
        </div>

        {/* Weaknesses */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-rose-200 dark:border-rose-800 p-5 shadow-sm">
          <h3 className="text-base font-bold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2">
            ⚠️ Weaknesses
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              {weaknesses.length} found
            </span>
          </h3>
          <div className="space-y-2.5">
            {weaknesses.length > 0
              ? weaknesses.map((w, i) => <InsightCard key={i} item={w} type="weakness" index={i} />)
              : <p className="text-xs text-emerald-600 dark:text-emerald-400 py-4 text-center font-medium">No major weaknesses — great job! 🎉</p>
            }
          </div>
        </div>
      </section>

      {/* ── Sections Detection ─────────────────────────────────── */}
      <section>
        <SectionsChecklist sectionsFound={sectionsFound} />
      </section>

      {/* ── Issues Panel ───────────────────────────────────────── */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          🔍 Detected Issues
          <span className="text-xs font-normal text-slate-400">({totalIssues} total)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IssueCard
            title="Contact Info"
            items={allContactIssues}
            severity="error"
            emptyMsg="Contact information complete ✅"
          />
          <IssueCard
            title="Formatting"
            items={allFormattingIssues}
            severity="warning"
            emptyMsg="No formatting issues detected ✅"
          />
          <IssueCard
            title="Skills Quality"
            items={skillsIssues}
            severity="warning"
            emptyMsg="Skills section looks strong ✅"
          />
        </div>
      </section>

      {/* ── Keywords ───────────────────────────────────────────── */}
      <section>
        {keywordMatch ? (
          <KeywordCloud
            matchedKeywords={matchedKeywords}
            missingKeywords={missingKeywords}
            matchPercent={keywordMatch.matchPercent}
          />
        ) : (
          <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center shadow-sm">
            <p className="text-4xl mb-3">🔑</p>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-1">No job description provided</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Go back and paste a job description to get keyword gap analysis.
            </p>
            <button
              onClick={onReset}
              className="mt-4 px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Analyze with JD →
            </button>
          </div>
        )}
      </section>

      {/* ── Suggestions ────────────────────────────────────────── */}
      <section>
        <SuggestionsPanel suggestions={suggestions} />
      </section>

    </div>
  );
}

// ── Summary Stat Card (used in the hero section) ───────────────
function SummaryStatCard({ icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-700"
    >
      <p className="text-lg mb-0.5">{icon}</p>
      <p className={`text-xl font-black ${color} stat-number`}>{value}</p>
      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">{label}</p>
    </motion.div>
  );
}
