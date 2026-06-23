// ============================================================
// components/jd/SkillsExtracted.jsx — Categorized skill pills
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_CONFIG = {
  technical: {
    label: 'Technical Skills',
    icon: '⚡',
    pill: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
    header: 'text-indigo-600 dark:text-indigo-400',
  },
  soft: {
    label: 'Soft Skills',
    icon: '🤝',
    pill: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
    header: 'text-emerald-600 dark:text-emerald-400',
  },
  tools: {
    label: 'Tools & Platforms',
    icon: '🛠️',
    pill: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    header: 'text-amber-600 dark:text-amber-400',
  },
  required: {
    label: 'Required Skills',
    icon: '✅',
    pill: 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700',
    header: 'text-rose-600 dark:text-rose-400',
  },
  preferred: {
    label: 'Preferred Skills',
    icon: '⭐',
    pill: 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-300 border-violet-200 dark:border-violet-700',
    header: 'text-violet-600 dark:text-violet-400',
  },
};

function SkillPill({ skill, config, delay = 0, matched, missing }) {
  const extraClass = matched
    ? 'ring-2 ring-emerald-400 dark:ring-emerald-500'
    : missing
    ? 'ring-2 ring-rose-400 dark:ring-rose-500 opacity-60'
    : '';

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.2 }}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.pill} ${extraClass} capitalize`}
      title={matched ? '✅ Found in resume' : missing ? '❌ Missing from resume' : ''}
    >
      {matched && <span className="text-emerald-500">✓</span>}
      {missing && <span className="text-rose-400">✗</span>}
      {skill}
    </motion.span>
  );
}

function SkillGroup({ category, skills, config, matchedSet, missingSet, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (!skills || skills.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{config.icon}</span>
          <span className={`text-sm font-semibold ${config.header}`}>{config.label}</span>
          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
            {skills.length}
          </span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 text-sm"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <SkillPill
                  key={skill}
                  skill={skill}
                  config={config}
                  delay={i * 0.02}
                  matched={matchedSet?.has(skill)}
                  missing={missingSet?.has(skill)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SkillsExtracted({ result, comparison }) {
  const {
    technicalSkills = [],
    softSkills = [],
    tools = [],
    requiredSkills = [],
    preferredSkills = [],
  } = result;

  const matchedSet = comparison ? new Set(comparison.matchedSkills) : null;
  const missingSet = comparison ? new Set(comparison.missingSkills) : null;

  const groups = [
    { key: 'technical', skills: technicalSkills },
    { key: 'soft',      skills: softSkills },
    { key: 'tools',     skills: tools },
    { key: 'required',  skills: requiredSkills },
    { key: 'preferred', skills: preferredSkills },
  ].filter(g => g.skills.length > 0);

  if (groups.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
        No skills detected. Try pasting a more detailed job description.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comparison && (
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 px-1 mb-1">
          <span className="flex items-center gap-1"><span className="text-emerald-500 font-bold">✓</span> Found in resume</span>
          <span className="flex items-center gap-1"><span className="text-rose-400 font-bold">✗</span> Missing from resume</span>
        </div>
      )}
      {groups.map(({ key, skills }) => (
        <SkillGroup
          key={key}
          category={key}
          skills={skills}
          config={CATEGORY_CONFIG[key]}
          matchedSet={matchedSet}
          missingSet={missingSet}
          defaultExpanded={key === 'technical' || key === 'required'}
        />
      ))}
    </div>
  );
}
