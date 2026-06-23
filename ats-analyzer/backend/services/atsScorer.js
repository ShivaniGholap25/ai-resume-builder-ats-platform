// ============================================================
// services/atsScorer.js  — Unified ATS Scoring Engine
//
// SCORING RUBRIC  (total = 100 pts):
//   Contact Information  = 10
//   Skills Section       = 20
//   Education Section    = 15
//   Experience Section   = 20
//   Projects Section     = 15
//   Resume Structure     = 10
//   Keyword Coverage     = 10
//
// Export:  analyzeResume(resumeText, jobDescription?)
// Returns: { score, scoreLabel, sectionScores, breakdown,
//            strengths, weaknesses, suggestions,
//            matchedKeywords, missingKeywords, meta }
// ============================================================

'use strict';

const natural = require('natural');
const { removeStopwords } = require('stopword');

const tokenizer = new natural.WordTokenizer();
const stemmer   = natural.PorterStemmer;

// ── Scoring weights ── edit these to change the rubric ───────
const WEIGHTS = {
  contact:    { max: 10, label: 'Contact Information' },
  skills:     { max: 20, label: 'Skills Section'      },
  education:  { max: 15, label: 'Education Section'   },
  experience: { max: 20, label: 'Experience Section'  },
  projects:   { max: 15, label: 'Projects Section'    },
  structure:  { max: 10, label: 'Resume Structure'    },
  keywords:   { max: 10, label: 'Keyword Coverage'    },
};

// ── Contact field detectors ───────────────────────────────────
const CONTACT_FIELDS = {
  email:    { re: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/, pts: 4, label: 'Email address'  },
  phone:    { re: /(\+?\d[\d\s\-().]{7,}\d)/,                           pts: 3, label: 'Phone number'   },
  linkedin: { re: /linkedin\.com\/in\/[a-zA-Z0-9_\-]+/i,               pts: 2, label: 'LinkedIn URL'   },
  location: { re: /\b([A-Z][a-z]+,\s*[A-Z]{2}|Remote|Hybrid)\b/,      pts: 1, label: 'Location'       },
};

// ── Section heading patterns ──────────────────────────────────
const SECTION_RE = {
  contact:        /\b(contact|email|phone|address)\b/i,
  summary:        /\b(summary|objective|profile|about me|overview)\b/i,
  experience:     /\b(experience|work history|employment|career|internship|professional)\b/i,
  education:      /\b(education|degree|university|college|school|academic|qualification)\b/i,
  skills:         /\b(skills?|technologies|tools|competencies|expertise|tech stack)\b/i,
  projects:       /\b(projects?|portfolio|work samples?|open.?source|side project)\b/i,
  certifications: /\b(certif|certificates?|courses?|training|licenses?|credentials?)\b/i,
  achievements:   /\b(achievements?|awards?|honors?|recognition|accomplishments?)\b/i,
};

// ── Technical skills dictionary ───────────────────────────────
const TECH_SKILLS = new Set([
  'python','java','javascript','typescript','c++','c#','golang','rust','kotlin',
  'swift','ruby','php','scala','sql','html','css','react','angular','vue','node',
  'nodejs','express','fastapi','flask','django','spring','graphql','rest','grpc',
  'mysql','postgresql','mongodb','redis','elasticsearch','dynamodb','firebase',
  'aws','azure','gcp','docker','kubernetes','terraform','ansible','jenkins',
  'machine learning','deep learning','tensorflow','pytorch','scikit-learn','pandas',
  'numpy','git','github','gitlab','linux','bash','ci/cd','devops','agile','scrum',
]);

// ── Generic / weak skills (penalty triggers) ─────────────────
const WEAK_SKILLS = new Set([
  'ms office','microsoft office','excel','word','powerpoint','typing',
  'internet browsing','basic computer','email','good communication',
  'team player','hard working','fast learner','detail oriented',
]);

// ── Strong action verbs ───────────────────────────────────────
const ACTION_VERBS = [
  'achieved','architected','automated','built','collaborated','created',
  'delivered','deployed','designed','developed','drove','engineered',
  'established','implemented','improved','increased','initiated','launched',
  'led','managed','mentored','migrated','optimized','reduced','resolved',
  'scaled','shipped','spearheaded','streamlined','transformed',
];

// ── Quantifiable metric pattern ───────────────────────────────
const METRIC_RE = /\b\d+\s*(%|percent|x|times|users?|clients?|customers?|k\b|million|billion|hours?|days?|weeks?|months?|years?)\b/gi;

// ============================================================
// PUBLIC API
// ============================================================

/**
 * analyzeResume — main export, backward-compatible name.
 *
 * @param {string} resumeText
 * @param {string} [jobDescription='']
 * @returns {ATSReport}
 */
function analyzeResume(resumeText, jobDescription = '') {
  if (!resumeText || typeof resumeText !== 'string') {
    throw new Error('resumeText must be a non-empty string');
  }

  const text      = resumeText.toLowerCase();
  const lines     = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
  const wordCount = (tokenizer.tokenize(resumeText) || []).length;

  // ── Run all 7 category scorers ────────────────────────────
  const contactResult    = _scoreContact(resumeText);
  const skillsResult     = _scoreSkills(text);
  const educationResult  = _scoreEducation(text);
  const experienceResult = _scoreExperience(resumeText, text);
  const projectsResult   = _scoreProjects(text, lines);
  const structureResult  = _scoreStructure(resumeText, text, lines, wordCount);
  const keywordsResult   = _scoreKeywords(resumeText, jobDescription);

  // ── Assemble section scores (flat map for API) ────────────
  const sectionScores = {
    contact:    contactResult.score,
    skills:     skillsResult.score,
    education:  educationResult.score,
    experience: experienceResult.score,
    projects:   projectsResult.score,
    structure:  structureResult.score,
    keywords:   keywordsResult.score,
  };

  // ── Full breakdown (score + max + detail) ─────────────────
  const breakdown = {
    contact:    { ...WEIGHTS.contact,    ...contactResult    },
    skills:     { ...WEIGHTS.skills,     ...skillsResult     },
    education:  { ...WEIGHTS.education,  ...educationResult  },
    experience: { ...WEIGHTS.experience, ...experienceResult },
    projects:   { ...WEIGHTS.projects,   ...projectsResult   },
    structure:  { ...WEIGHTS.structure,  ...structureResult  },
    keywords:   { ...WEIGHTS.keywords,   ...keywordsResult   },
  };

  // ── Total score ───────────────────────────────────────────
  const score = Math.min(100, Math.max(0,
    Object.values(sectionScores).reduce((s, v) => s + v, 0)
  ));

  // ── Strengths & Weaknesses (≥80% = strength, <60% = weak) ─
  const strengths  = [];
  const weaknesses = [];

  for (const [, cat] of Object.entries(breakdown)) {
    const pct = (cat.score / cat.max) * 100;
    if (pct >= 80 && cat.strength) {
      strengths.push({ category: cat.label, score: cat.score, max: cat.max, detail: cat.strength });
    } else if (pct < 60 && cat.weakness) {
      weaknesses.push({ category: cat.label, score: cat.score, max: cat.max, detail: cat.weakness });
    }
  }
  weaknesses.sort((a, b) => (a.score / a.max) - (b.score / b.max));

  // ── Score label ───────────────────────────────────────────
  const scoreLabel =
    score >= 85 ? 'Excellent'         :
    score >= 70 ? 'Good'              :
    score >= 50 ? 'Needs Improvement' :
                  'Poor';

  // ── Suggestions ───────────────────────────────────────────
  const suggestions = _buildSuggestions(breakdown, wordCount, jobDescription);

  // ── Keyword arrays for direct API access ─────────────────
  const km = keywordsResult.keywordMatch;
  const matchedKeywords = km ? km.matchedKeywords : [];
  const missingKeywords = km ? km.missingKeywords : [];

  // ── Backward-compat fields (used by existing frontend) ────
  // These are derived from the new data so existing components still work.
  const sectionsFound    = Object.fromEntries(
    Object.entries(SECTION_RE).map(([k, re]) => [k, re.test(text)])
  );
  const missingSections  = Object.entries(sectionsFound)
    .filter(([, v]) => !v).map(([k]) => k);
  const contactInfo      = Object.fromEntries(
    Object.entries(CONTACT_FIELDS).map(([k, { re }]) => [k, re.test(resumeText)])
  );
  const contactIssues    = contactResult.missing.map(l => `Missing: ${l}`);
  const formattingIssues = structureResult.issues || [];
  const skillsIssues     = skillsResult.details
    .filter(d => d.includes('—') || d.includes('No ') || d.includes('Too few') || d.includes('Generic'));
  const keywordMatch     = km ? { ...km, matchPercent: km.matchPercent } : null;

  return {
    // ── New standard shape ────────────────────────────────
    score,
    scoreLabel,
    sectionScores,
    breakdown,
    strengths,
    weaknesses,
    suggestions,
    matchedKeywords,
    missingKeywords,
    // ── Meta (section detection, contact, keyword raw data) ─
    meta: {
      wordCount,
      sectionsDetected: sectionsFound,
      contactInfo,
      keywordMatch: km,
    },
    // ── Backward-compat fields ────────────────────────────
    wordCount,
    sectionsFound,
    missingSections,
    contactInfo,
    contactIssues,
    formattingIssues,
    skillsIssues,
    weakSkillsFound: skillsResult.weakSkillsFound || [],
    actionVerbsFound: skillsResult.actionVerbsFound || [],
    keywordMatch,
  };
}

module.exports = { analyzeResume, WEIGHTS };

// ============================================================
// CATEGORY SCORERS  (private, prefix _)
// ============================================================

// ── 1. Contact Information  (max 10) ─────────────────────────
function _scoreContact(rawText) {
  let score = 0;
  const found   = {};
  const missing = [];

  for (const [key, { re, pts, label }] of Object.entries(CONTACT_FIELDS)) {
    if (re.test(rawText)) { found[key] = true;  score += pts; }
    else                  { found[key] = false; missing.push(label); }
  }

  return {
    score: Math.min(10, score),
    found, missing,
    details: missing.length === 0
      ? ['All contact fields present']
      : [`Missing: ${missing.join(', ')}`],
    strength: score >= 8  ? 'Complete contact information provided'    : null,
    weakness: score < 7   ? `Contact info incomplete — missing: ${missing.join(', ')}` : null,
  };
}

// ── 2. Skills Section  (max 20) ──────────────────────────────
function _scoreSkills(text) {
  let score = 0;
  const details = [];

  // (a) Dedicated section heading  ➜  4 pts
  if (SECTION_RE.skills.test(text)) {
    score += 4;
    details.push('Dedicated skills section present');
  } else {
    details.push('No skills section heading found');
  }

  // (b) Technical skill count  ➜  up to 8 pts
  const techFound = [...TECH_SKILLS].filter(s =>
    new RegExp(`\\b${s.replace(/[+#.]/g, '\\$&')}\\b`).test(text)
  );
  score += Math.min(8, techFound.length);
  details.push(techFound.length >= 6
    ? `${techFound.length} technical skills identified`
    : `Only ${techFound.length} tech skills found — add more`);

  // (c) Action verbs  ➜  up to 4 pts
  const verbsFound = ACTION_VERBS.filter(v => text.includes(v));
  score += Math.min(4, verbsFound.length);
  details.push(verbsFound.length >= 3
    ? `${verbsFound.length} action verbs used`
    : 'Too few action verbs — use stronger language');

  // (d) Penalty: −1 per generic skill
  const weakFound = [...WEAK_SKILLS].filter(s => text.includes(s));
  score = Math.max(0, score - weakFound.length);
  if (weakFound.length > 0)
    details.push(`Generic skills detected: ${weakFound.join(', ')}`);

  const s = Math.min(20, score);
  return {
    score: s,
    techSkillsFound: techFound,
    actionVerbsFound: verbsFound,
    weakSkillsFound: weakFound,
    details,
    strength: s >= 16 ? 'Strong, specific skills section with technical depth'   : null,
    weakness: s < 10  ? 'Skills section too thin — add more relevant tech skills' : null,
  };
}

// ── 3. Education Section  (max 15) ───────────────────────────
function _scoreEducation(text) {
  let score = 0;
  const details = [];

  if (!SECTION_RE.education.test(text)) {
    return { score: 0, details: ['No education section found'],
             weakness: 'Missing education section — add degree and institution' };
  }
  score += 4; details.push('Education section present');

  if (/\b(bachelor|master|phd|doctorate|b\.?s|m\.?s|b\.?e|m\.?b\.?a|b\.?tech|m\.?tech|associate|diploma)\b/i.test(text)) {
    score += 5; details.push('Degree type identified');
  } else { details.push('No specific degree mentioned'); }

  if (/\b(university|college|institute|school|polytechnic|academy)\b/i.test(text)) {
    score += 3; details.push('Institution name present');
  } else { details.push('Institution name not detected'); }

  if (/\b(19|20)\d{2}\b/.test(text)) {
    score += 3; details.push('Graduation year included');
  } else { details.push('No graduation year found'); }

  const s = Math.min(15, score);
  return {
    score: s, details,
    strength: s >= 12 ? 'Complete education details'        : null,
    weakness: s < 8   ? 'Education section is incomplete'   : null,
  };
}

// ── 4. Experience Section  (max 20) ──────────────────────────
function _scoreExperience(rawText, text) {
  let score = 0;
  const details = [];

  if (!SECTION_RE.experience.test(text)) {
    return { score: 0, details: ['No work experience section detected'],
             weakness: 'No experience section found' };
  }
  score += 4; details.push('Work experience section present');

  if (/\b(engineer|developer|manager|analyst|designer|architect|lead|director|consultant|specialist|coordinator|intern)\b/i.test(rawText)) {
    score += 3; details.push('Job title(s) detected');
  } else { details.push('No clear job titles found'); }

  if (/\b(inc\.?|llc\.?|ltd\.?|corp\.?|company|technologies|solutions|services|systems)\b/i.test(rawText)) {
    score += 3; details.push('Company names identified');
  } else { details.push('Company names not clearly identified'); }

  if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present|current)\b/i.test(rawText) ||
      /\b(20\d{2}|19\d{2})\s*[-–]\s*(20\d{2}|present|current)\b/i.test(rawText)) {
    score += 3; details.push('Employment dates present');
  } else { details.push('No employment date ranges detected'); }

  const verbs = ACTION_VERBS.filter(v => text.includes(v));
  score += verbs.length >= 5 ? 4 : verbs.length >= 2 ? 2 : 0;
  details.push(verbs.length >= 5
    ? `${verbs.length} action verbs — excellent`
    : `${verbs.length} action verbs — aim for 5+`);

  const metrics = rawText.match(METRIC_RE) || [];
  score += metrics.length >= 3 ? 3 : metrics.length >= 1 ? 1 : 0;
  details.push(metrics.length >= 3
    ? `${metrics.length} quantifiable metrics — great`
    : metrics.length > 0
      ? `${metrics.length} metric(s) — add more numbers`
      : 'No quantifiable achievements detected');

  const s = Math.min(20, score);
  return {
    score: s,
    metricsFound: metrics.slice(0, 5),
    verbsFound: verbs,
    details,
    strength: s >= 16 ? 'Strong experience with measurable achievements'        : null,
    weakness: s < 10  ? 'Experience section needs more detail and impact metrics': null,
  };
}

// ── 5. Projects Section  (max 15) ────────────────────────────
function _scoreProjects(text, lines) {
  let score = 0;
  const details = [];

  if (!SECTION_RE.projects.test(text)) {
    const hasGH = /github\.com\/[a-z0-9_\-]+\/[a-z0-9_\-]+/i.test(text);
    if (hasGH) { score += 2; details.push('GitHub links found (no section heading)'); }
    else        { details.push('No projects section found'); }
    return { score, details, weakness: score === 0 ? 'Add a projects section with descriptions' : null };
  }
  score += 4; details.push('Projects section present');

  const pLines = lines.filter(l => l.length > 5 && l.length < 80 && !l.endsWith('.') && !/^\s*[-•*]/.test(l));
  score += pLines.length >= 2 ? 3 : 1;
  details.push(pLines.length >= 2 ? 'Multiple project entries' : 'Only one project entry');

  const techCount = [...TECH_SKILLS].filter(s =>
    new RegExp(`\\b${s.replace(/[+#.]/g, '\\$&')}\\b`).test(text)
  ).length;
  score += techCount >= 4 ? 4 : techCount >= 2 ? 2 : 0;
  details.push(techCount >= 4 ? `${techCount} technologies mentioned` : 'Add more technology names');

  if (/github\.com|gitlab\.com|vercel\.app|netlify\.app|herokuapp/i.test(text)) {
    score += 2; details.push('Project URLs included');
  } else { details.push('No project URLs — add GitHub/demo links'); }

  if ((text.match(METRIC_RE) || []).length >= 1) {
    score += 2; details.push('Project impact/metrics present');
  } else { details.push('Add measurable outcomes to projects'); }

  const s = Math.min(15, score);
  return {
    score: s, details,
    strength: s >= 12 ? 'Well-documented projects section'        : null,
    weakness: s < 8   ? 'Projects section needs more detail/links' : null,
  };
}

// ── 6. Resume Structure  (max 10) ────────────────────────────
function _scoreStructure(rawText, text, lines, wordCount) {
  let score = 0;
  const issues = [];
  const details = [];

  // Word count ideally 300–800
  if      (wordCount >= 300 && wordCount <= 800) { score += 3; details.push(`Good length: ${wordCount} words`); }
  else if (wordCount >= 150)                     { score += 1; issues.push(`Resume short (${wordCount} words) — aim for 300–800`); }
  else if (wordCount >  800)                     { score += 2; issues.push(`Resume long (${wordCount} words) — consider trimming`); }
  else                                           {             issues.push(`Resume very short (${wordCount} words)`); }

  // ATS format checks — each issue costs 1 pt from a pool of 3
  let fmtPool = 3;
  if (/[^\x00-\x7F]{5,}/.test(rawText))               { fmtPool--; issues.push('Non-ASCII characters may confuse ATS'); }
  if (/\t{3,}/.test(rawText))                           { fmtPool--; issues.push('Excessive tabs — possible table layout'); }
  if (/_{5,}/.test(rawText))                            { fmtPool--; issues.push('Decorative underscores detected'); }
  if (lines.filter(l => l.length > 180).length > 3)     { fmtPool--; issues.push('Very long lines — possible multi-column layout'); }
  score += Math.max(0, fmtPool);

  // Core sections present (1 pt each, max 4)
  const core    = ['summary', 'experience', 'education', 'skills'];
  const present = core.filter(s => SECTION_RE[s].test(text));
  score += Math.min(4, present.length);
  if (present.length === 4) { details.push('All 4 core sections present'); }
  else { issues.push(`Missing: ${core.filter(s => !SECTION_RE[s].test(text)).join(', ')}`); }

  const s = Math.min(10, Math.max(0, score));
  return {
    score: s, issues, details, wordCount,
    coreSectionsFound: present,
    strength: s >= 8 ? 'Well-structured, ATS-friendly format' : null,
    weakness: issues.length > 2 ? 'Multiple structure/format issues'  : null,
  };
}

// ── 7. Keyword Coverage  (max 10) ────────────────────────────
function _scoreKeywords(resumeText, jobDescription) {
  if (!jobDescription || !jobDescription.trim()) {
    // No JD — score on tech keyword density
    const t        = resumeText.toLowerCase();
    const techCnt  = [...TECH_SKILLS].filter(s => t.includes(s)).length;
    const score    = Math.min(10, Math.round((techCnt / 8) * 10));
    return {
      score, keywordMatch: null,
      details: [`${techCnt} industry keywords found (no JD provided)`],
      note: 'Paste a JD for precise keyword match scoring',
      strength: score >= 8 ? 'Good keyword density'                             : null,
      weakness: score < 5  ? 'Low keyword density — add more technical terms'   : null,
    };
  }

  const rt = removeStopwords(tokenizer.tokenize(resumeText.toLowerCase()) || []);
  const jt = removeStopwords(tokenizer.tokenize(jobDescription.toLowerCase()) || []);

  const resumeStems   = new Set(rt.map(t => stemmer.stem(t)));
  const uniqueJdStems = [...new Set(jt.map(t => stemmer.stem(t)))];

  const stemToWord = {};
  jt.forEach(w => { stemToWord[stemmer.stem(w)] = w; });

  const matched = uniqueJdStems.filter(s => resumeStems.has(s));
  const missing = uniqueJdStems.filter(s => !resumeStems.has(s));
  const pct     = uniqueJdStems.length > 0
    ? Math.round((matched.length / uniqueJdStems.length) * 100) : 0;

  const score = Math.round((pct / 100) * 10);
  return {
    score,
    keywordMatch: {
      matchPercent:    pct,
      matchedKeywords: matched.map(s => stemToWord[s] || s).slice(0, 25),
      missingKeywords: missing.map(s => stemToWord[s] || s).slice(0, 15),
      totalJdKeywords: uniqueJdStems.length,
    },
    details: [`${pct}% keyword match (${matched.length}/${uniqueJdStems.length} JD keywords)`],
    strength: pct >= 70 ? `Strong keyword match: ${pct}%`                : null,
    weakness: pct < 40  ? `Low match: ${pct}% — incorporate more JD terms` : null,
  };
}

// ============================================================
// SUGGESTION BUILDER
// ============================================================

function _buildSuggestions(breakdown, wordCount, jobDescription) {
  const list = [];

  const add = (category, priority, message) => list.push({ category, priority, message });

  // Contact
  if (breakdown.contact.score < 7) {
    const m = breakdown.contact.missing || [];
    if (m.includes('Email address')) add('Contact', 'High', 'Add your email address — required for recruiters to contact you.');
    if (m.includes('Phone number'))  add('Contact', 'High', 'Add your phone number for recruiter follow-ups.');
    if (m.includes('LinkedIn URL'))  add('Contact', 'Medium', 'Add your LinkedIn profile URL — 87% of recruiters use LinkedIn.');
    if (m.includes('Location'))      add('Contact', 'Low', 'Add your city/state or "Remote" to clarify work location.');
  }

  // Skills
  if (breakdown.skills.score < 16) {
    if (!breakdown.skills.details?.some(d => d.includes('Dedicated')))
      add('Skills', 'High', 'Add a dedicated "Skills" or "Technical Skills" section.');
    if ((breakdown.skills.techSkillsFound?.length || 0) < 6)
      add('Skills', 'High', 'List at least 8–10 specific technical skills (e.g., Python, React, Docker).');
    if ((breakdown.skills.actionVerbsFound?.length || 0) < 3)
      add('Skills', 'Medium', 'Use strong action verbs: built, developed, optimized, architected, led.');
    if ((breakdown.skills.weakSkillsFound?.length || 0) > 0)
      add('Skills', 'Medium', `Replace generic skills (${breakdown.skills.weakSkillsFound.join(', ')}) with specific technologies.`);
  }

  // Education
  if (breakdown.education.score < 8) {
    add('Education', 'Medium', 'Add an Education section with degree, institution name, and graduation year.');
  }

  // Experience
  if (breakdown.experience.score < 10) {
    add('Experience', 'High', 'Add a Work Experience section with job titles, company names, and date ranges.');
    if ((breakdown.experience.metricsFound?.length || 0) === 0)
      add('Experience', 'High', 'Quantify achievements — add numbers: "Improved performance by 40%", "Led team of 5".');
    if ((breakdown.experience.verbsFound?.length || 0) < 3)
      add('Experience', 'Medium', 'Start each bullet with an action verb: Developed, Deployed, Led, Reduced, Built.');
  }

  // Projects
  if (breakdown.projects.score < 8) {
    add('Projects', 'Medium', 'Add a Projects section with 2–3 projects, technologies used, and GitHub links.');
  }

  // Structure
  if (breakdown.structure.score < 7) {
    for (const issue of (breakdown.structure.issues || [])) {
      add('Structure', 'Medium', issue);
    }
    if (wordCount < 200)
      add('Structure', 'High', 'Resume too sparse — expand experience and skills to 300+ words.');
  }

  // Keywords
  if (breakdown.keywords.score < 5 && breakdown.keywords.keywordMatch) {
    const missing = breakdown.keywords.keywordMatch.missingKeywords?.slice(0, 8).join(', ');
    add('Keywords', 'High', `Add these missing job keywords: ${missing}.`);
  } else if (breakdown.keywords.score < 5) {
    add('Keywords', 'Medium', 'Paste a job description to get precise keyword gap analysis.');
  }

  // Sort High → Medium → Low
  const order = { High: 0, Medium: 1, Low: 2 };
  return list.sort((a, b) => order[a.priority] - order[b.priority]);
}
