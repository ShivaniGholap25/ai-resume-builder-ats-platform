// ============================================================
// data/resumeDefaults.js — Default resume data + template configs
// ============================================================

/** Default resume form data — used to pre-fill the editor */
export const DEFAULT_RESUME = {
  // Personal info
  name:       'Alex Johnson',
  title:      'Senior Software Engineer',
  email:      'alex.johnson@email.com',
  phone:      '+1 (555) 234-5678',
  location:   'San Francisco, CA',
  linkedin:   'linkedin.com/in/alexjohnson',
  github:     'github.com/alexjohnson',
  website:    '',

  // Summary
  summary: 'Results-driven Software Engineer with 6+ years of experience building scalable web applications. Proven track record of delivering high-quality solutions using React, Node.js, and cloud technologies. Passionate about clean code, performance optimization, and mentoring junior developers.',

  // Experience
  experience: [
    {
      id: 'exp1',
      title:    'Senior Software Engineer',
      company:  'TechCorp Inc.',
      location: 'San Francisco, CA',
      start:    'Jan 2021',
      end:      'Present',
      bullets: [
        'Led development of microservices architecture serving 2M+ daily active users',
        'Reduced API response time by 40% through Redis caching and query optimization',
        'Mentored 4 junior engineers and conducted 50+ code reviews per quarter',
        'Implemented CI/CD pipelines using GitHub Actions, reducing deployment time by 60%',
      ],
    },
    {
      id: 'exp2',
      title:    'Software Engineer',
      company:  'StartupXYZ',
      location: 'Remote',
      start:    'Jun 2019',
      end:      'Dec 2020',
      bullets: [
        'Built React dashboard used by 500+ enterprise clients',
        'Designed and implemented RESTful APIs with Node.js and Express',
        'Collaborated with product team to ship 3 major features per quarter',
      ],
    },
  ],

  // Education
  education: [
    {
      id:          'edu1',
      degree:      'B.S. Computer Science',
      institution: 'University of California, Berkeley',
      location:    'Berkeley, CA',
      start:       '2015',
      end:         '2019',
      gpa:         '3.8',
      honors:      "Dean's List",
    },
  ],

  // Skills
  skills: {
    technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'GraphQL', 'REST APIs'],
    tools:     ['Git', 'Docker', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'GitHub Actions'],
    soft:      ['Leadership', 'Communication', 'Problem Solving', 'Agile/Scrum'],
  },

  // Projects
  projects: [
    {
      id:          'proj1',
      name:        'Open Source CLI Tool',
      url:         'github.com/alexjohnson/cli-tool',
      description: 'Built a developer productivity CLI tool with 2,000+ GitHub stars. Automated repetitive tasks saving teams 3+ hours/week.',
      tech:        ['Node.js', 'TypeScript', 'Jest'],
    },
  ],

  // Certifications
  certifications: [
    { id: 'cert1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' },
    { id: 'cert2', name: 'Google Cloud Professional',         issuer: 'Google',              year: '2022' },
  ],
};

// ============================================================
// TEMPLATE DEFINITIONS
// ============================================================

export const TEMPLATES = [
  {
    id:          'classic',
    name:        'Classic',
    description: 'Clean single-column layout. Maximum ATS compatibility.',
    badge:       'Most ATS-Safe',
    badgeColor:  'bg-emerald-100 text-emerald-700',
    preview:     '📄',
    atsScore:    99,
  },
  {
    id:          'modern',
    name:        'Modern',
    description: 'Contemporary design with subtle accent line. Still fully ATS-safe.',
    badge:       'Popular',
    badgeColor:  'bg-blue-100 text-blue-700',
    preview:     '📋',
    atsScore:    97,
  },
  {
    id:          'executive',
    name:        'Executive',
    description: 'Bold header with strong typography. Ideal for senior roles.',
    badge:       'Senior Roles',
    badgeColor:  'bg-violet-100 text-violet-700',
    preview:     '🏆',
    atsScore:    96,
  },
  {
    id:          'minimal',
    name:        'Minimal',
    description: 'Ultra-clean whitespace-focused design. Lets content shine.',
    badge:       'Clean',
    badgeColor:  'bg-slate-100 text-slate-600',
    preview:     '✨',
    atsScore:    98,
  },
  {
    id:          'technical',
    name:        'Technical',
    description: 'Skills-first layout optimized for engineering and tech roles.',
    badge:       'Tech Roles',
    badgeColor:  'bg-amber-100 text-amber-700',
    preview:     '💻',
    atsScore:    97,
  },
];

// ============================================================
// THEME PRESETS
// ============================================================

export const THEMES = [
  { id: 'slate',   name: 'Slate',    accent: '#1e293b', light: '#f8fafc', text: '#0f172a' },
  { id: 'blue',    name: 'Navy',     accent: '#1d4ed8', light: '#eff6ff', text: '#1e3a5f' },
  { id: 'indigo',  name: 'Indigo',   accent: '#4338ca', light: '#eef2ff', text: '#312e81' },
  { id: 'violet',  name: 'Violet',   accent: '#6d28d9', light: '#f5f3ff', text: '#4c1d95' },
  { id: 'emerald', name: 'Emerald',  accent: '#065f46', light: '#ecfdf5', text: '#064e3b' },
  { id: 'rose',    name: 'Rose',     accent: '#9f1239', light: '#fff1f2', text: '#881337' },
  { id: 'black',   name: 'Onyx',     accent: '#000000', light: '#f9fafb', text: '#111827' },
];

// ============================================================
// FONT OPTIONS (all ATS-safe)
// ============================================================

export const FONTS = [
  { id: 'arial',    name: 'Arial',          css: 'Arial, Helvetica, sans-serif' },
  { id: 'calibri',  name: 'Calibri',        css: "'Calibri', 'Gill Sans', sans-serif" },
  { id: 'georgia',  name: 'Georgia',        css: "Georgia, 'Times New Roman', serif" },
  { id: 'garamond', name: 'Garamond',       css: "Garamond, 'Times New Roman', serif" },
  { id: 'tahoma',   name: 'Tahoma',         css: 'Tahoma, Geneva, sans-serif' },
  { id: 'verdana',  name: 'Verdana',        css: 'Verdana, Geneva, sans-serif' },
  { id: 'trebuchet',name: 'Trebuchet MS',   css: "'Trebuchet MS', Helvetica, sans-serif" },
];
