// ============================================================
// components/jd/MatchScorePanel.jsx — Resume vs JD match results
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { checkExperienceGap, checkEducationGap } from '../../utils/gapAnalysis';

const getMatchConfig = (pct) => {
  if (pct >= 80) return {
    label: 'Excellent',
    text: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500',
    ring: 'from-green-400 to-emerald-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60',
    glow: 'rgba(34,197,94,0.3)',
    desc: 'Your profile is an exceptional match for this position. You meet almost all core requirements!'
  };
  if (pct >= 60) return {
    label: 'Good',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500',
    ring: 'from-amber-400 to-yellow-500',
    lightBg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60',
    glow: 'rgba(245,158,11,0.3)',
    desc: 'Your profile has solid alignment. Addressing the missing skills/keywords can significantly boost your standing.'
  };
  return {
    label: 'Needs Improvement',
    text: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500',
    ring: 'from-rose-400 to-red-500',
    lightBg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60',
    glow: 'rgba(239,68,68,0.3)',
    desc: 'Your profile has key gaps for this position. Follow the recommendations below to improve compatibility.'
  };
};

function LargeScoreGauge({ value }) {
  const cfg = getMatchConfig(value);
  const size = 160;
  const strokeWidth = 12;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm w-full md:w-auto shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-700" />
          <motion.circle
            cx={size/2} cy={size/2} r={r}
            fill="none" strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke={value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444'}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-black text-slate-800 dark:text-slate-100"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          >
            {value}%
          </motion.span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Match Score
          </span>
        </div>
      </div>
      <div className={`mt-4 px-4 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${cfg.lightBg} ${cfg.text}`}>
        {cfg.label}
      </div>
    </div>
  );
}

function SmallScoreRing({ value, label, size = 90, strokeWidth = 8 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const strokeColor = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-700" />
          <motion.circle
            cx={size/2} cy={size/2} r={r}
            fill="none" strokeWidth={strokeWidth}
            strokeLinecap="round"
            stroke={strokeColor}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold text-slate-800 dark:text-slate-100">
            {value}%
          </span>
        </div>
      </div>
      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function MatchScorePanel({ comparison, jdResult, resumeText }) {
  const [activeSkillsTab, setActiveSkillsTab] = useState('matched');
  const [activeKeywordsTab, setActiveKeywordsTab] = useState('matched');

  if (!comparison) return null;

  const {
    overallMatch, skillMatchPct, keywordMatchPct, semanticScore,
    matchedSkills = [], missingSkills = [], extraSkills = [],
    matchedKeywords = [], missingKeywords = [], atsTips = []
  } = comparison;

  const jdSkills = [...matchedSkills, ...missingSkills];
  const resumeSkills = [...matchedSkills, ...extraSkills];
  const atsRelevantKeywords = (jdResult?.keywords || []).map(k => typeof k === 'object' ? k.keyword : k);

  // Perform gap checks
  const expGap = checkExperienceGap(jdResult?.experienceReqs || [], resumeText);
  const eduGap = checkEducationGap(jdResult?.educationReqs || [], resumeText);

  // Calculate status indicators for gap cards
  const skillGapStatus = missingSkills.length === 0 ? 'match' : missingSkills.length > 4 ? 'missing' : 'warning';
  const keywordGapStatus = keywordMatchPct >= 80 ? 'match' : keywordMatchPct >= 50 ? 'warning' : 'missing';

  const gapStyles = {
    match: { bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500', icon: '✅' },
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500', icon: '⚠️' },
    missing: { bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40', text: 'text-rose-800 dark:text-rose-300', dot: 'bg-rose-500', icon: '❌' }
  };

  const cfg = getMatchConfig(overallMatch);

  // Compile recommendations
  const recommendations = [];
  if (missingSkills.length > 0) {
    recommendations.push({
      id: 'rec-skills',
      priority: 'High',
      category: 'Skills Gap',
      title: 'Add Missing Skills',
      text: `Incorporate these crucial skills required by the job: ${missingSkills.slice(0, 6).join(', ')}.`,
      impact: `Addressing these will increase your Skill Match score from ${skillMatchPct}%.`
    });
  }
  if (missingKeywords.length > 0) {
    recommendations.push({
      id: 'rec-keywords',
      priority: 'High',
      category: 'Keyword Gap',
      title: 'Integrate Core Keywords',
      text: `Add these exact terms from the description: ${missingKeywords.slice(0, 8).join(', ')}.`,
      impact: 'ATS parsers match exact phrases. Incorporating these can boost keyword coverage by up to 25%.'
    });
  }
  if (expGap.status !== 'match') {
    recommendations.push({
      id: 'rec-experience',
      priority: expGap.status === 'missing' ? 'High' : 'Medium',
      category: 'Experience Gap',
      title: 'Address Experience Requirement',
      text: expGap.status === 'missing'
        ? `The job requires ${expGap.required}, but no clear years of experience were detected. Add a professional history section detailing years.`
        : `Highlight matching project timelines and roles to emphasize your experience against the required ${expGap.required}.`,
      impact: 'Helps bypass recruiter experience filters.'
    });
  }
  if (eduGap.status !== 'match') {
    recommendations.push({
      id: 'rec-education',
      priority: 'Medium',
      category: 'Education Gap',
      title: 'Clarify Academic Credentials',
      text: `Clearly list your highest degree. The job mentions: ${eduGap.required}. Make sure your degree level matches this requirement explicitly.`,
      impact: 'Avoids automatic rejection on basic qualification checklists.'
    });
  }
  if (extraSkills.length > 5) {
    recommendations.push({
      id: 'rec-extra',
      priority: 'Low',
      category: 'Resume Alignment',
      title: 'Trim Unrelated Skills',
      text: `Your resume lists ${extraSkills.length} skills not requested by this JD (e.g. ${extraSkills.slice(0, 4).join(', ')}). Consider trimming these to save space.`,
      impact: 'Improves document focus and readability for hiring managers.'
    });
  }

  return (
    <div className="space-y-6">
      
      {/* 1. OVERALL MATCH SCORE HERO */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <LargeScoreGauge value={overallMatch} />
        
        <div className="flex-1 min-w-0 text-center md:text-left">
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Recruiter Match Report
          </span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">
            Job Description Compatibility
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            {cfg.desc}
          </p>

          {/* Stat row */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <SmallScoreRing value={skillMatchPct} label="Skills Match" />
            <SmallScoreRing value={keywordMatchPct} label="Keywords Match" />
            <SmallScoreRing value={semanticScore} label="Semantic Match" />
          </div>
        </div>
      </div>

      {/* 2. GAP ANALYSIS DASHBOARD */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          📊 Gap Analysis Dashboard
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Skill Gaps Card */}
          <div className={`p-4 rounded-xl border ${gapStyles[skillGapStatus].bg} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Skill Gaps</span>
                <span className="text-sm">{gapStyles[skillGapStatus].icon}</span>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {missingSkills.length === 0 ? 'Fully Aligned' : `${missingSkills.length} Missing Skills`}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {missingSkills.length > 0
                  ? `Missing core skills like: ${missingSkills.slice(0, 3).join(', ')}.`
                  : 'Your resume contains all skills extracted from this job description.'}
              </p>
            </div>
          </div>

          {/* Keyword Gaps Card */}
          <div className={`p-4 rounded-xl border ${gapStyles[keywordGapStatus].bg} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Keyword Gaps</span>
                <span className="text-sm">{gapStyles[keywordGapStatus].icon}</span>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {keywordMatchPct}% Match Rate
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {missingKeywords.length > 0
                  ? `Resume misses ${missingKeywords.length} key phrases. Top missing: ${missingKeywords.slice(0, 3).join(', ')}.`
                  : 'Excellent keyword coverage across all job description topics.'}
              </p>
            </div>
          </div>

          {/* Experience Gaps Card */}
          <div className={`p-4 rounded-xl border ${gapStyles[expGap.status].bg} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Experience Gaps</span>
                <span className="text-sm">{gapStyles[expGap.status].icon}</span>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Req: {expGap.required} • Got: {expGap.candidate}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {expGap.details}
              </p>
            </div>
          </div>

          {/* Education Gaps Card */}
          <div className={`p-4 rounded-xl border ${gapStyles[eduGap.status].bg} flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Education Gaps</span>
                <span className="text-sm">{gapStyles[eduGap.status].icon}</span>
              </div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Req: {eduGap.required.length > 30 ? eduGap.required.slice(0, 30) + '...' : eduGap.required}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {eduGap.details}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. SKILLS ANALYSIS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            ⚡ Skills Analysis
          </h3>
          {/* Tab selector */}
          <div className="flex bg-slate-100 dark:bg-slate-700/50 p-0.5 rounded-lg text-xs self-start sm:self-auto">
            {[
              { id: 'matched', label: `Matched (${matchedSkills.length})` },
              { id: 'missing', label: `Missing (${missingSkills.length})` },
              { id: 'jd', label: `JD Skills (${jdSkills.length})` },
              { id: 'resume', label: `Resume Skills (${resumeSkills.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSkillsTab(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeSkillsTab === tab.id
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skill pill renderer */}
        <div className="min-h-[60px] flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
          {activeSkillsTab === 'matched' && (
            matchedSkills.length > 0 ? (
              matchedSkills.map(s => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/40 capitalize">
                  ✓ {s}
                </span>
              ))
            ) : <p className="text-xs text-slate-400 py-3 pl-2">No matched skills detected.</p>
          )}

          {activeSkillsTab === 'missing' && (
            missingSkills.length > 0 ? (
              missingSkills.map(s => (
                <span key={s} className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/40 capitalize">
                  ✗ {s}
                </span>
              ))
            ) : <p className="text-xs text-green-600 dark:text-green-400 py-3 pl-2">Great job! All JD skills are present. 🎉</p>
          )}

          {activeSkillsTab === 'jd' && (
            jdSkills.length > 0 ? (
              jdSkills.map(s => {
                const isMatched = matchedSkills.includes(s);
                return (
                  <span key={s} className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${
                    isMatched
                      ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/40'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                  }`}>
                    {isMatched ? '✓' : '•'} {s}
                  </span>
                );
              })
            ) : <p className="text-xs text-slate-400 py-3 pl-2">No skills detected in Job Description.</p>
          )}

          {activeSkillsTab === 'resume' && (
            resumeSkills.length > 0 ? (
              resumeSkills.map(s => {
                const isMatched = matchedSkills.includes(s);
                return (
                  <span key={s} className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${
                    isMatched
                      ? 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/40'
                      : 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40'
                  }`}>
                    {isMatched ? '✓' : '✏️'} {s}
                  </span>
                );
              })
            ) : <p className="text-xs text-slate-400 py-3 pl-2">No skills detected in your resume.</p>
          )}
        </div>
      </div>

      {/* 4. KEYWORD ANALYSIS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            🔑 Keyword Analysis
          </h3>
          <div className="flex bg-slate-100 dark:bg-slate-700/50 p-0.5 rounded-lg text-xs self-start sm:self-auto">
            {[
              { id: 'matched', label: `Matched (${matchedKeywords.length})` },
              { id: 'missing', label: `Missing (${missingKeywords.length})` },
              { id: 'relevant', label: `ATS-Relevant (${atsRelevantKeywords.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveKeywordsTab(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeKeywordsTab === tab.id
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[60px] flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
          {activeKeywordsTab === 'matched' && (
            matchedKeywords.length > 0 ? (
              matchedKeywords.map(kw => (
                <span key={kw} className="px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800/40">
                  ✓ {kw}
                </span>
              ))
            ) : <p className="text-xs text-slate-400 py-3 pl-2">No matched keywords found.</p>
          )}

          {activeKeywordsTab === 'missing' && (
            missingKeywords.length > 0 ? (
              missingKeywords.map(kw => (
                <span key={kw} className="px-3 py-1 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full border border-red-200 dark:border-red-800/40">
                  ✗ {kw}
                </span>
              ))
            ) : <p className="text-xs text-green-600 dark:text-green-400 py-3 pl-2">All relevant keywords matched!</p>
          )}

          {activeKeywordsTab === 'relevant' && (
            atsRelevantKeywords.length > 0 ? (
              atsRelevantKeywords.map(kw => {
                const isMatched = matchedKeywords.includes(kw);
                return (
                  <span key={kw} className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    isMatched
                      ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/40'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                  }`}>
                    {isMatched ? '✓' : '•'} {kw}
                  </span>
                );
              })
            ) : <p className="text-xs text-slate-400 py-3 pl-2">No keywords identified in the JD.</p>
          )}
        </div>
      </div>

      {/* 5. RECOMMENDATIONS PANEL */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
          💡 Actions & Recommendations
        </h3>
        
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const borderStyles = {
                High: 'border-l-4 border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/10',
                Medium: 'border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/10',
                Low: 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10'
              };

              const badgeStyles = {
                High: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
                Medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
              };

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-r-xl border border-slate-200 dark:border-slate-700 ${borderStyles[rec.priority]} transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {rec.category}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeStyles[rec.priority]}`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {rec.text}
                  </p>
                  <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1">
                    <span>⚡ Impact:</span> {rec.impact}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-6 text-center">
            <p className="text-3xl mb-2">🏆</p>
            <p className="text-emerald-800 dark:text-emerald-300 font-bold">Outstanding Compatibility!</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              Your resume perfectly matches all required skills, experience levels, and keywords.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
