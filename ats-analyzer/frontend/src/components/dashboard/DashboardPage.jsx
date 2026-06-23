// ============================================================
// components/dashboard/DashboardPage.jsx — Landing page
// Hero section + Quick Access Cards + Feature Overview
// ============================================================

import { motion } from 'framer-motion';

// ── Quick access cards ─────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    id: 'builder',
    icon: '📄',
    title: 'Resume Builder',
    desc: 'Create ATS-optimized resumes with professional templates and live preview.',
    gradient: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    border: 'hover:border-indigo-300 dark:hover:border-indigo-600',
  },
  {
    id: 'analyze',
    title: 'ATS Analysis',
    icon: '🎯',
    desc: 'Score your resume out of 100 with section-by-section breakdown and tips.',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-600',
  },
  {
    id: 'jd-match',
    title: 'Job Match',
    icon: '⚖️',
    desc: 'Compare your resume against any job description for skill and keyword gaps.',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    border: 'hover:border-violet-300 dark:hover:border-violet-600',
  },
  {
    id: 'ai-optimizer',
    title: 'AI Optimizer',
    icon: '🤖',
    desc: 'Get AI-powered rewrites for bullets, summaries, and missing skill suggestions.',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    border: 'hover:border-amber-300 dark:hover:border-amber-600',
  },
  {
    id: 'history',
    title: 'History',
    icon: '📜',
    desc: 'View and manage all your past resume analyses and optimization results.',
    gradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    border: 'hover:border-rose-300 dark:hover:border-rose-600',
  },
];

// ── Feature overview cards ─────────────────────────────────────
const FEATURES = [
  {
    icon: '🎯',
    title: 'ATS Scoring',
    desc: 'Get a comprehensive score out of 100 with detailed breakdown across 5 scoring categories.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
  },
  {
    icon: '📤',
    title: 'Resume Parsing',
    desc: 'Extract text from PDF and DOCX resumes with word count, page stats, and keyword search.',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
  },
  {
    icon: '⚖️',
    title: 'JD Matching',
    desc: 'Match your skills and keywords against any job description with radar chart visualization.',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/40',
  },
  {
    icon: '🤖',
    title: 'AI Suggestions',
    desc: 'AI-rewritten bullet points, improved summaries, missing skills, and ATS optimization tips.',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
  },
  {
    icon: '⬇️',
    title: 'PDF Export',
    desc: 'Download professional, ATS-friendly resumes as PDF with multiple templates and themes.',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
];

// ── Stats ──────────────────────────────────────────────────────
const STATS = [
  { value: '5+', label: 'Resume Templates' },
  { value: '5', label: 'Scoring Categories' },
  { value: '100', label: 'Max ATS Score' },
  { value: '6', label: 'AI Endpoints' },
];

// ── Stagger animation config ──────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function DashboardPage({ onNavigate }) {
  return (
    <div className="min-h-screen">

      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="relative overflow-hidden hero-mesh">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl animate-float-delay pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/40 border border-brand-200 dark:border-brand-700 mb-6"
            >
              <span className="pulse-dot" />
              <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">
                AI-Powered Career Platform
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4">
              AI Resume Builder &{' '}
              <span className="text-gradient">ATS Optimization</span>{' '}
              Platform
            </h1>

            {/* Tagline */}
            <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Build, Analyze, Match, and Optimize Resumes with AI
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => onNavigate('builder')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-600 text-white font-bold text-base shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-shadow"
              >
                📄 Build Your Resume
              </motion.button>
              <motion.button
                onClick={() => onNavigate('analyze')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-base border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-600 transition-all"
              >
                🎯 Analyze Resume
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="border-y border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {STATS.map((stat) => (
              <motion.div key={stat.label} variants={item} className="text-center">
                <p className="text-3xl sm:text-4xl font-black text-gradient stat-number">{stat.value}</p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Quick Access Cards ────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Quick Access
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Jump into any tool to start optimizing your career documents.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {QUICK_ACTIONS.map((action) => (
            <motion.button
              key={action.id}
              variants={item}
              onClick={() => onNavigate(action.id)}
              className={`card-lift group text-left bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 ${action.border} transition-all`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1.5 flex items-center gap-2">
                {action.title}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-500">→</span>
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {action.desc}
              </p>

              {/* Bottom gradient line */}
              <div className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${action.gradient} opacity-60 group-hover:w-full group-hover:opacity-100 transition-all duration-500`} />
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* ── Feature Overview ──────────────────────────────────── */}
      <section className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Platform Features
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Everything you need to land your dream job, in one unified platform.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 text-center card-lift"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center text-2xl mx-auto mb-3`}>
                  {feature.icon}
                </div>
                <h3 className={`text-sm font-bold ${feature.color} mb-1.5`}>
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-accent-600 to-brand-700 p-10 sm:p-14 text-center"
        >
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Optimize Your Resume?
            </h2>
            <p className="text-base text-white/70 mb-8 max-w-lg mx-auto">
              Start building an ATS-friendly resume that gets past automated screening systems and into the hands of real recruiters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => onNavigate('builder')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-2xl bg-white text-brand-700 font-bold text-sm shadow-xl hover:shadow-2xl transition-shadow"
              >
                Get Started — It's Free
              </motion.button>
              <motion.button
                onClick={() => onNavigate('analyze')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-2xl bg-white/15 text-white font-bold text-sm border border-white/25 hover:bg-white/25 transition-colors"
              >
                Analyze Existing Resume
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
