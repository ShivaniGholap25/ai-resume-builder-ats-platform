// ============================================================
// components/jd/JDOverviewCards.jsx — Top-level JD summary cards
// ============================================================

import { motion } from 'framer-motion';

const Card = ({ icon, label, value, sub, color, delay, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
    className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm h-full flex flex-col justify-between ${className}`}
  >
    <div>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p 
        className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 leading-tight truncate" 
        title={value || '—'}
      >
        {value || '—'}
      </p>
    </div>
    {sub && (
      <p 
        className="text-xs text-slate-400 dark:text-slate-500 mt-2 truncate" 
        title={sub}
      >
        {sub}
      </p>
    )}
  </motion.div>
);

export default function JDOverviewCards({ result }) {
  const {
    jobTitle, industry, seniorityLevel,
    technicalSkills = [], softSkills = [], tools = [],
    experienceReqs = [], stats = {},
  } = result;

  // Derive min experience from requirements
  const yearsReq = experienceReqs.find(r => r.type === 'years' || r.type === 'min_years');
  const expText  = yearsReq ? `${yearsReq.value}+ years` : (experienceReqs[0]?.raw || 'Not specified');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 lg:grid-cols-12 gap-3">
      <div className="col-span-2 sm:col-span-3 lg:col-span-4">
        <Card icon="💼" label="Job Title" value={jobTitle || 'Not detected'} color="bg-indigo-50 dark:bg-indigo-900/30" delay={0} />
      </div>
      <div className="col-span-2 sm:col-span-3 lg:col-span-2">
        <Card icon="🏭" label="Industry" value={industry} color="bg-blue-50 dark:bg-blue-900/30" delay={0.05} />
      </div>
      <div className="col-span-1 sm:col-span-2 lg:col-span-2">
        <Card icon="📊" label="Seniority" value={seniorityLevel} color="bg-violet-50 dark:bg-violet-900/30" delay={0.1} />
      </div>
      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
        <Card icon="⏱️" label="Experience" value={expText} color="bg-amber-50 dark:bg-amber-900/30" delay={0.15} />
      </div>
      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
        <Card
          icon="⚡" label="Tech Skills"
          value={technicalSkills.length}
          sub={`+ ${tools.length} tools`}
          color="bg-emerald-50 dark:bg-emerald-900/30"
          delay={0.2}
        />
      </div>
      <div className="col-span-1 sm:col-span-2 lg:col-span-2">
        <Card
          icon="🤝" label="Soft Skills"
          value={softSkills.length}
          sub={`${stats.wordCount || 0} words`}
          color="bg-rose-50 dark:bg-rose-900/30"
          delay={0.25}
        />
      </div>
    </div>
  );
}
