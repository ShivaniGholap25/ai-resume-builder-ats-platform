// ============================================================
// services/jdAnalyzer.js — Job Description NLP analysis engine
// ============================================================

const natural = require('natural');
const { removeStopwords } = require('stopword');

const tokenizer = new natural.WordTokenizer();
const stemmer   = natural.PorterStemmer;

// ── Curated skill dictionaries (shared with ATS scorer) ──────

const TECHNICAL_SKILLS = new Set([
  // Languages
  'python','java','javascript','typescript','c++','c#','golang','go','rust',
  'kotlin','swift','ruby','php','scala','r','matlab','perl','bash','shell',
  'powershell','sql','nosql','html','css','sass','less',
  // Frameworks
  'react','angular','vue','nodejs','express','fastapi','flask','django',
  'spring','laravel','rails','asp.net','.net','nextjs','nuxt','svelte',
  'gatsby','redux','graphql','rest','grpc','tailwind','bootstrap',
  // Databases
  'mysql','postgresql','postgres','mongodb','redis','elasticsearch',
  'cassandra','dynamodb','sqlite','oracle','firebase','supabase','neo4j',
  // Cloud / DevOps
  'aws','azure','gcp','docker','kubernetes','k8s','terraform','ansible',
  'jenkins','github actions','gitlab ci','helm','prometheus','grafana',
  'nginx','apache','linux','unix',
  // ML / AI
  'machine learning','deep learning','nlp','computer vision','tensorflow',
  'pytorch','keras','scikit-learn','pandas','numpy','spark','hadoop',
  'hugging face','transformers','bert','gpt','llm','langchain','openai',
  // Tools
  'git','github','gitlab','jira','confluence','postman','swagger','figma',
  'webpack','vite','jest','pytest','selenium','cypress','playwright',
  // Concepts
  'microservices','api','ci/cd','devops','agile','scrum','tdd','oop',
  'design patterns','solid','data structures','algorithms','system design',
]);

const SOFT_SKILLS = new Set([
  'communication','leadership','teamwork','problem solving','critical thinking',
  'time management','adaptability','creativity','collaboration','project management',
  'analytical','attention to detail','multitasking','presentation','negotiation',
  'mentoring','coaching','decision making','conflict resolution','self-motivated',
  'proactive','organized','detail-oriented','fast learner','quick learner',
  'interpersonal','written communication','verbal communication','stakeholder management',
]);

const TOOLS_KEYWORDS = new Set([
  'vs code','visual studio','intellij','pycharm','eclipse','xcode',
  'android studio','jupyter','colab','tableau','power bi','excel',
  'notion','trello','asana','monday','salesforce','hubspot','zendesk',
  'servicenow','slack','teams','zoom','confluence','sharepoint',
]);

// ── Experience level patterns ─────────────────────────────────

const EXP_PATTERNS = [
  { pattern: /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/gi,       type: 'years' },
  { pattern: /(?:minimum|min|at least)\s+(\d+)\s*years?/gi,              type: 'min_years' },
  { pattern: /(\d+)\s*[-–]\s*(\d+)\s*years?\s+(?:of\s+)?experience/gi,  type: 'range' },
  { pattern: /\b(entry.?level|junior|mid.?level|senior|lead|principal|staff|director)\b/gi, type: 'level' },
  { pattern: /\b(fresher|graduate|intern|internship)\b/gi,               type: 'entry' },
];

// ── Education patterns ────────────────────────────────────────

const EDU_PATTERNS = [
  /\b(bachelor'?s?|b\.?s\.?|b\.?e\.?|b\.?tech\.?|b\.?sc\.?|b\.?a\.?)\b/gi,
  /\b(master'?s?|m\.?s\.?|m\.?tech\.?|m\.?b\.?a\.?|m\.?sc\.?|m\.?a\.?)\b/gi,
  /\b(ph\.?d\.?|doctorate|doctoral)\b/gi,
  /\b(computer science|information technology|software engineering|data science|electrical engineering)\b/gi,
];

// ── Stopwords for keyword extraction ─────────────────────────

const STOPWORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','are','was','were','be','been','have','has','had',
  'do','does','did','will','would','could','should','may','might',
  'i','we','you','he','she','it','they','this','that','these','those',
  'not','no','so','as','if','also','well','just','very','more','most',
  'some','any','all','each','both','few','other','such','than','too',
  'our','your','their','its','my','his','her','who','what','which',
  'when','where','how','why','can','need','must','shall','able',
  'including','based','across','within','between','among','responsible',
  'ability','strong','experience','knowledge','understanding','skills',
  'skill','years','year','team','company','role','position','job',
  'candidate','required','preferred','plus','bonus','etc','eg','ie',
  'work','working','looking','seeking','join','help','support','ensure',
  'provide','develop','manage','build','create','design','implement',
  'using','used','use','make','made','making','good','great','excellent',
]);

// ============================================================
// MAIN JD ANALYSIS FUNCTION
// ============================================================

/**
 * Deeply analyze a job description to extract structured requirements.
 *
 * @param {string} jdText       - Raw job description text
 * @param {string} resumeText   - Optional resume text for comparison
 * @returns {object}            - Structured JD analysis + optional match
 */
const analyzeJobDescription = (jdText, resumeText = '') => {
  const jdLower = jdText.toLowerCase();

  // ── 1. Extract required skills ────────────────────────────
  const requiredSkills   = extractSkills(jdLower, 'required');
  const preferredSkills  = extractSkills(jdLower, 'preferred');
  const technicalSkills  = matchSkillSet(jdLower, TECHNICAL_SKILLS);
  const softSkills       = matchSkillSet(jdLower, SOFT_SKILLS);
  const tools            = matchSkillSet(jdLower, TOOLS_KEYWORDS);

  // ── 2. Extract experience requirements ───────────────────
  const experienceReqs = extractExperience(jdText);

  // ── 3. Extract education requirements ────────────────────
  const educationReqs = extractEducation(jdText);

  // ── 4. Extract keywords (TF-IDF style) ───────────────────
  const keywords = extractKeywords(jdText, 40);

  // ── 5. Detect job role / title ────────────────────────────
  const jobTitle = detectJobTitle(jdText);

  // ── 6. Detect industry / domain ──────────────────────────
  const industry = detectIndustry(jdLower);

  // ── 7. Detect seniority level ─────────────────────────────
  const seniorityLevel = detectSeniority(jdLower);

  // ── 8. Extract responsibilities ───────────────────────────
  const responsibilities = extractResponsibilities(jdText);

  // ── 9. Resume comparison (if provided) ───────────────────
  let comparison = null;
  if (resumeText && resumeText.trim().length > 50) {
    comparison = compareWithResume(jdText, resumeText, {
      technicalSkills,
      softSkills,
      tools,
      keywords,
    });
  }

  return {
    jobTitle,
    industry,
    seniorityLevel,
    requiredSkills,
    preferredSkills,
    technicalSkills,
    softSkills,
    tools,
    experienceReqs,
    educationReqs,
    responsibilities,
    keywords: keywords.slice(0, 30),
    comparison,
    stats: {
      wordCount: jdText.split(/\s+/).length,
      sentenceCount: jdText.split(/[.!?]+/).filter(Boolean).length,
      totalSkillsFound: technicalSkills.length + softSkills.length + tools.length,
    },
  };
};

// ── Skill extraction helpers ──────────────────────────────────

function extractSkills(jdLower, type) {
  // Find "required" or "preferred" sections and extract skills from them
  const sectionPattern = type === 'required'
    ? /(?:required|must.have|requirements?|qualifications?)[:\s\n]+(.*?)(?:\n\n|\n(?:preferred|nice.to.have|bonus)|\Z)/is
    : /(?:preferred|nice.to.have|bonus|plus)[:\s\n]+(.*?)(?:\n\n|\Z)/is;

  const match = jdLower.match(sectionPattern);
  if (!match) return [];

  const section = match[1];
  const found = new Set();

  for (const skill of TECHNICAL_SKILLS) {
    if (section.includes(skill)) found.add(skill);
  }
  for (const skill of SOFT_SKILLS) {
    if (section.includes(skill)) found.add(skill);
  }

  return [...found].slice(0, 20);
}

function matchSkillSet(jdLower, skillSet) {
  const found = [];
  for (const skill of skillSet) {
    // Word-boundary match for single words, substring for phrases
    if (skill.includes(' ')) {
      if (jdLower.includes(skill)) found.push(skill);
    } else {
      const re = new RegExp(`\\b${skill.replace(/[+#.]/g, '\\$&')}\\b`);
      if (re.test(jdLower)) found.push(skill);
    }
  }
  return found;
}

function extractExperience(jdText) {
  const results = [];
  for (const { pattern, type } of EXP_PATTERNS) {
    const matches = [...jdText.matchAll(pattern)];
    for (const m of matches) {
      if (type === 'years')     results.push({ type, value: parseInt(m[1]), raw: m[0].trim() });
      if (type === 'min_years') results.push({ type, value: parseInt(m[1]), raw: m[0].trim() });
      if (type === 'range')     results.push({ type, min: parseInt(m[1]), max: parseInt(m[2]), raw: m[0].trim() });
      if (type === 'level')     results.push({ type, value: m[1].toLowerCase(), raw: m[0].trim() });
      if (type === 'entry')     results.push({ type, value: m[1].toLowerCase(), raw: m[0].trim() });
    }
  }
  // Deduplicate by raw text
  const seen = new Set();
  return results.filter(r => {
    if (seen.has(r.raw)) return false;
    seen.add(r.raw);
    return true;
  }).slice(0, 8);
}

function extractEducation(jdText) {
  const found = [];
  for (const pattern of EDU_PATTERNS) {
    const matches = [...jdText.matchAll(pattern)];
    for (const m of matches) {
      const val = m[0].trim();
      if (!found.includes(val)) found.push(val);
    }
  }
  return found.slice(0, 6);
}

function extractKeywords(text, topN = 30) {
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  const clean  = removeStopwords(tokens).filter(t => t.length > 2 && !STOPWORDS.has(t));

  // Count frequencies
  const freq = {};
  for (const t of clean) {
    const stem = stemmer.stem(t);
    freq[stem] = (freq[stem] || { word: t, count: 0 });
    freq[stem].count++;
  }

  return Object.values(freq)
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
    .map(({ word, count }) => ({ keyword: word, frequency: count }));
}

function detectJobTitle(jdText) {
  // Look for common title patterns in first 3 lines
  const firstLines = jdText.split('\n').slice(0, 5).join(' ');
  const titlePatterns = [
    /(?:position|role|title|job)[:\s]+([^\n,]{5,60})/i,
    /(?:we(?:'re| are) (?:hiring|looking for|seeking))[:\s]+(?:a\s+)?([^\n,]{5,60})/i,
    /^([A-Z][a-zA-Z\s]{4,50})(?:\s*[-–|]|\s*\n)/m,
  ];
  for (const p of titlePatterns) {
    const m = firstLines.match(p);
    if (m) return m[1].trim().slice(0, 60);
  }
  return null;
}

function detectIndustry(jdLower) {
  const industries = {
    'Technology / Software': ['software','saas','tech','startup','platform','api','cloud'],
    'Finance / Fintech':     ['fintech','banking','finance','trading','payments','blockchain'],
    'Healthcare':            ['healthcare','medical','clinical','hospital','pharma','biotech'],
    'E-commerce / Retail':   ['ecommerce','retail','marketplace','shopify','commerce'],
    'Data / AI':             ['data science','machine learning','ai','analytics','big data'],
    'Cybersecurity':         ['security','cybersecurity','infosec','soc','penetration'],
    'Gaming':                ['gaming','game','unity','unreal','mobile game'],
    'Education / EdTech':    ['edtech','education','learning','lms','curriculum'],
  };
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(k => jdLower.includes(k))) return industry;
  }
  return 'General';
}

function detectSeniority(jdLower) {
  if (/\b(vp|vice president|director|head of|chief)\b/.test(jdLower)) return 'Executive';
  if (/\b(principal|staff|architect)\b/.test(jdLower))                 return 'Principal';
  if (/\b(senior|sr\.?|lead)\b/.test(jdLower))                         return 'Senior';
  if (/\b(mid.?level|intermediate)\b/.test(jdLower))                   return 'Mid-Level';
  if (/\b(junior|jr\.?|entry.?level|associate)\b/.test(jdLower))       return 'Junior';
  if (/\b(intern|internship|fresher|graduate)\b/.test(jdLower))        return 'Intern';
  return 'Not specified';
}

function extractResponsibilities(jdText) {
  // Find bullet points or numbered items in responsibilities section
  const sectionMatch = jdText.match(
    /(?:responsibilities|duties|what you.ll do|role|you will)[:\s\n]+(.*?)(?:\n\n|\n(?:requirements?|qualifications?|skills?)|\Z)/is
  );
  const section = sectionMatch ? sectionMatch[1] : jdText;

  const bullets = section
    .split('\n')
    .map(l => l.replace(/^[\s•\-*\d.]+/, '').trim())
    .filter(l => l.length > 15 && l.length < 200);

  return bullets.slice(0, 8);
}

// ============================================================
// RESUME vs JD COMPARISON
// ============================================================

function compareWithResume(jdText, resumeText, jdData) {
  const resumeLower = resumeText.toLowerCase();
  const jdLower     = jdText.toLowerCase();

  // ── Skill gap analysis ────────────────────────────────────
  const resumeTechSkills = matchSkillSet(resumeLower, TECHNICAL_SKILLS);
  const resumeSoftSkills = matchSkillSet(resumeLower, SOFT_SKILLS);
  const resumeTools      = matchSkillSet(resumeLower, TOOLS_KEYWORDS);

  const resumeAllSkills = new Set([...resumeTechSkills, ...resumeSoftSkills, ...resumeTools]);
  const jdAllSkills     = new Set([...jdData.technicalSkills, ...jdData.softSkills, ...jdData.tools]);

  const matchedSkills  = [...jdAllSkills].filter(s => resumeAllSkills.has(s));
  const missingSkills  = [...jdAllSkills].filter(s => !resumeAllSkills.has(s));
  const extraSkills    = [...resumeAllSkills].filter(s => !jdAllSkills.has(s));

  // ── Keyword gap analysis (stemmed) ───────────────────────
  const resumeTokens = removeStopwords(tokenizer.tokenize(resumeLower) || [])
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
  const jdTokens = removeStopwords(tokenizer.tokenize(jdLower) || [])
    .filter(t => t.length > 2 && !STOPWORDS.has(t));

  const resumeStems = new Set(resumeTokens.map(t => stemmer.stem(t)));
  const jdStems     = [...new Set(jdTokens.map(t => stemmer.stem(t)))];

  const stemToWord = {};
  jdTokens.forEach(w => { stemToWord[stemmer.stem(w)] = w; });

  const matchedKeywords = jdStems.filter(s => resumeStems.has(s)).map(s => stemToWord[s] || s);
  const missingKeywords = jdStems.filter(s => !resumeStems.has(s)).map(s => stemToWord[s] || s);

  // ── Match percentages ─────────────────────────────────────
  const skillMatchPct = jdAllSkills.size > 0
    ? Math.round((matchedSkills.length / jdAllSkills.size) * 100)
    : 0;

  const keywordMatchPct = jdStems.length > 0
    ? Math.round((matchedKeywords.length / jdStems.length) * 100)
    : 0;

  // ── Semantic similarity (cosine on TF vectors) ────────────
  const semanticScore = cosineSimilarity(resumeTokens, jdTokens);

  // ── Combined match score ──────────────────────────────────
  // 40% skill match + 35% keyword match + 25% semantic
  const overallMatch = Math.round(
    skillMatchPct * 0.40 +
    keywordMatchPct * 0.35 +
    semanticScore * 100 * 0.25
  );

  // ── ATS optimization tips ─────────────────────────────────
  const atsTips = generateATSTips({
    missingSkills,
    missingKeywords: missingKeywords.slice(0, 15),
    skillMatchPct,
    keywordMatchPct,
    overallMatch,
  });

  return {
    overallMatch: Math.min(100, overallMatch),
    skillMatchPct,
    keywordMatchPct,
    semanticScore: Math.round(semanticScore * 100),
    matchedSkills:  matchedSkills.slice(0, 25),
    missingSkills:  missingSkills.slice(0, 20),
    extraSkills:    extraSkills.slice(0, 15),
    matchedKeywords: matchedKeywords.slice(0, 25),
    missingKeywords: missingKeywords.slice(0, 20),
    atsTips,
    matchLabel: overallMatch >= 75 ? 'Strong Match' :
                overallMatch >= 55 ? 'Good Match'   :
                overallMatch >= 35 ? 'Partial Match' : 'Weak Match',
  };
}

// ── Cosine similarity on token bags ──────────────────────────

function cosineSimilarity(tokens1, tokens2) {
  const freq1 = buildFreqMap(tokens1);
  const freq2 = buildFreqMap(tokens2);
  const vocab  = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);

  let dot = 0, norm1 = 0, norm2 = 0;
  for (const w of vocab) {
    const v1 = freq1[w] || 0;
    const v2 = freq2[w] || 0;
    dot   += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }
  const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
  return denom > 0 ? Math.min(1, dot / denom) : 0;
}

function buildFreqMap(tokens) {
  const map = {};
  for (const t of tokens) {
    const stem = stemmer.stem(t);
    map[stem] = (map[stem] || 0) + 1;
  }
  return map;
}

// ── ATS tip generator ─────────────────────────────────────────

function generateATSTips({ missingSkills, missingKeywords, skillMatchPct, keywordMatchPct, overallMatch }) {
  const tips = [];

  if (missingSkills.length > 0) {
    tips.push({
      priority: 'high',
      category: 'Skills Gap',
      tip: `Add these missing skills to your resume: ${missingSkills.slice(0, 6).join(', ')}`,
      impact: `Could improve skill match from ${skillMatchPct}% to ~${Math.min(100, skillMatchPct + 15)}%`,
    });
  }

  if (missingKeywords.length > 0) {
    tips.push({
      priority: 'high',
      category: 'Keyword Gaps',
      tip: `Incorporate these JD keywords naturally: ${missingKeywords.slice(0, 8).join(', ')}`,
      impact: `Keyword match is ${keywordMatchPct}% — adding these could push it above 70%`,
    });
  }

  if (skillMatchPct < 50) {
    tips.push({
      priority: 'high',
      category: 'Skill Alignment',
      tip: 'Your skill set has low overlap with this JD. Tailor your skills section to mirror the job requirements.',
      impact: 'Low skill match is the #1 reason ATS systems reject resumes',
    });
  }

  if (keywordMatchPct < 40) {
    tips.push({
      priority: 'medium',
      category: 'Keyword Density',
      tip: 'Use the exact terminology from the job description — ATS systems match exact phrases.',
      impact: 'Exact keyword matching can increase ATS pass rate by 30-40%',
    });
  }

  if (overallMatch >= 70) {
    tips.push({
      priority: 'low',
      category: 'Strong Match',
      tip: 'Your resume is a strong match. Focus on quantifying achievements and tailoring your summary.',
      impact: 'A tailored summary can increase recruiter callback rate by 40%',
    });
  }

  tips.push({
    priority: 'medium',
    category: 'Formatting',
    tip: 'Use standard section headings (Experience, Education, Skills) — ATS parsers rely on these.',
    impact: 'Proper headings ensure 100% of your content is parsed correctly',
  });

  tips.push({
    priority: 'low',
    category: 'File Format',
    tip: 'Submit as a clean .docx or single-column PDF. Avoid tables, headers/footers, and graphics.',
    impact: 'Multi-column layouts cause ATS to misread up to 40% of content',
  });

  return tips;
}

module.exports = { analyzeJobDescription };
