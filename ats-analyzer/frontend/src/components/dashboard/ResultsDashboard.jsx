// ============================================================
// ResultsDashboard.jsx — Full ATS results page
// 7-category scoring: contact(10) skills(20) education(15)
//   experience(20) projects(15) structure(10) keywords(10)
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScoreGauge        from '../ui/ScoreGauge';
import ScoreBreakdown    from '../ui/ScoreBreakdown';
import SectionsChecklist from '../ui/SectionsChecklist';
import IssueCard         from '../ui/IssueCard';
import KeywordCloud      from '../ui/KeywordCloud';
import SuggestionsPanel  from '../ui/SuggestionsPanel';

// ── Section tabs ──────────────────────────────────────────────
const TABS = [
  { id: 'overview',    label: '📊 Overview'    },
  { id: 'sections',    label: '📋 Sections'    },
  { id: 'issues',      label: '⚠️ Issues'      },
  { id: 'keywords',    label: '🔑 Keywords'    },
  { id: 'suggestions', label: '💡 Suggestions' },
];

// ── Score colour helpers ──────────────────────────────────────
const scoreColor = (score) =>
  score >= 85 ? 'text-emerald-600' :
  score >= 70 ? 'text-blue-600'    :
  score >= 50 ? 'text-amber-600'   : 'text-rose-600';

const scoreBg = (score) =>
  score >= 85 ? 'bg-emerald-50 border-emerald-200' :
  score >= 70 ? 'bg-blue-50 border-blue-200'       :
  score >= 50 ? 'bg-amber-50 border-amber-200'     : 'bg-rose-50 border-rose-200';

// ── Per-category bar (used in Overview) ──────────────────────
const CATEGORY_META = {
  contact:    { icon: '📞', label: 'Contact Info',  color: 'bg-blue-500'    },
  skills:     { icon: '⚡', label: 'Skills',        color: 'bg-indigo-500'  },
  education:  { icon: '🎓', label: 'Education',     color: 'bg-violet-500'  },
  experience: { icon: '💼', label: 'Experience',    color: 'bg-amber-500'   },
  projects:   { icon: '🚀', label: 'Projects',      color: 'bg-teal-500'    },
  structure:  { icon: '🏗️', label: 'Structure',    color: 'bg-slate-500'   },
  keywords:   { icon: '🔑', label: 'Keywords',      color: 'bg-rose-500'    },
};

function CategoryBar({ key: k, cat, delay }) {
  const meta = CATEGORY_META[k] || { icon: '📊', label: k, color: 'bg-slate-400' };
  const pct  = Math.round((cat.score / cat.max) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-700 flex items-center gap-1.5">
          <span>{meta.icon}</span>
          <span className="font-medium">{meta.label}</span>
        </span>
        <span className="text-sm font-bold text-slate-600">
          {cat.score}<span className="text-slate-400 font-normal">/{cat.max}</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${meta.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

// ── Strength / Weakness card ──────────────────────────────────
function StrengthCard({ item, type }) {
  const isStrength = type === 'strength';
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
      isStrength
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-rose-50 border-rose-200 text-rose-800'
    }`}>
      <span className="text-base mt-0.5 shrink-0">{isStrength ? '✅' : '⚠️'}</span>
      <div className="min-w-0">
        <p className="font-semibold">{item.category}
          <span className="ml-2 text-xs font-normal opacity-70">{item.score}/{item.max} pts</span>
        </p>
        <p className="mt-0.5 text-xs opacity-80 leading-snug">{item.detail}</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ResultsDashboard({ result, fileName, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');

  const {
    score, scoreLabel,
    sectionScores, breakdown,
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

  // Build backward-compat breakdown for ScoreBreakdown component
  // (it expects { sections, contact, formatting, skills, keywords })
  const legacyBreakdown = breakdown
    ? Object.fromEntries(
        Object.entries(breakdown).map(([k, v]) => [k, { score: v.score, max: v.max }])
      )
    : {};

  // All issues combined for Issues tab
  const allContactIssues    = contactIssues.length    ? contactIssues    : (breakdown?.contact?.missing  || []).map(m => `Missing: ${m}`);
  const allFormattingIssues = formattingIssues.length ? formattingIssues : (breakdown?.structure?.issues || []);

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ATS Analysis Results</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            📄 {fileName}&nbsp;&nbsp;·&nbsp;&nbsp;{wordCount} words
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-5 py-2 text-sm font-semibold text-indigo-600 border border-indigo-300 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          ← Analyze Another
        </button>
      </div>

      {/* ── Score hero ───────────────────────────────────────── */}
      <div className={`rounded-2xl border-2 p-5 flex flex-col sm:flex-row items-center gap-6 ${scoreBg(score)}`}>
        {/* Circular gauge */}
        <div className="shrink-0">
          <ScoreGauge score={score} label={scoreLabel} />
        </div>

        {/* Strengths / Weaknesses quick view */}
        <div className="flex-1 min-w-0 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">
                ✅ Strengths ({strengths.length})
              </p>
              <div className="space-y-2">
                {strengths.length > 0
                  ? strengths.map((s, i) => <StrengthCard key={i} item={s} type="strength" />)
                  : <p className="text-xs text-slate-400">No major strengths detected yet</p>
                }
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wide mb-2">
                ⚠️ Weaknesses ({weaknesses.length})
              </p>
              <div className="space-y-2">
                {weaknesses.length > 0
                  ? weaknesses.map((w, i) => <StrengthCard key={i} item={w} type="weakness" />)
                  : <p className="text-xs text-emerald-600 font-medium">No major weaknesses! 🎉</p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ───────────────────────────────────── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div key="overview"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Category bars */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                {breakdown && Object.entries(breakdown).map(([k, cat], i) => (
                  <CategoryBar key={k} k={k} cat={cat} delay={i * 0.06} />
                ))}
              </div>
            </div>

            {/* Legacy ScoreBreakdown (progress bars) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Category Detail</h3>
              <ScoreBreakdown breakdown={legacyBreakdown} />
            </div>
          </motion.div>
        )}

        {/* SECTIONS */}
        {activeTab === 'sections' && (
          <motion.div key="sections"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <SectionsChecklist sectionsFound={sectionsFound} />
          </motion.div>
        )}

        {/* ISSUES */}
        {activeTab === 'issues' && (
          <motion.div key="issues"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
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
          </motion.div>
        )}

        {/* KEYWORDS */}
        {activeTab === 'keywords' && (
          <motion.div key="keywords"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            {keywordMatch ? (
              <KeywordCloud
                matchedKeywords={matchedKeywords}
                missingKeywords={missingKeywords}
                matchPercent={keywordMatch.matchPercent}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                <p className="text-4xl mb-3">🔑</p>
                <p className="text-slate-600 font-medium mb-1">No job description provided</p>
                <p className="text-sm text-slate-400">
                  Go back and paste a job description to get keyword gap analysis.
                </p>
                <button
                  onClick={onReset}
                  className="mt-4 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Analyze with JD →
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* SUGGESTIONS */}
        {activeTab === 'suggestions' && (
          <motion.div key="suggestions"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          >
            <SuggestionsPanel suggestions={suggestions} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
