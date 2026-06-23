// ============================================================
// routes/aiRoutes.js — All AI-powered improvement endpoints
// ============================================================

const express = require('express');
const router  = express.Router();
const { callAIWithRetry } = require('../services/aiService');
const {
  bulletRewritePrompt,
  summaryImprovePrompt,
  actionVerbsPrompt,
  missingSkillsPrompt,
  atsOptimizePrompt,
  fullImprovementPrompt,
} = require('../services/promptEngine');

// ── Input validation helper ───────────────────────────────────
const requireFields = (body, fields) => {
  const missing = fields.filter(f => !body[f]);
  return missing.length ? `Missing required fields: ${missing.join(', ')}` : null;
};

// ── Rate limit guard (simple in-memory, per-IP) ───────────────
const requestCounts = new Map();
const RATE_LIMIT = 20; // requests per minute per IP
const WINDOW_MS  = 60_000;

const rateLimit = (req, res, next) => {
  const ip  = req.ip || 'unknown';
  const now = Date.now();
  const entry = requestCounts.get(ip) || { count: 0, reset: now + WINDOW_MS };

  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + WINDOW_MS;
  }

  entry.count++;
  requestCounts.set(ip, entry);

  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many AI requests. Please wait a moment.' });
  }
  next();
};

router.use(rateLimit);

// ============================================================
// POST /api/ai/rewrite-bullets
// Body: { bullets: string[], jobTitle?, jobDescription? }
// ============================================================
router.post('/rewrite-bullets', async (req, res) => {
  const err = requireFields(req.body, ['bullets']);
  if (err) return res.status(400).json({ error: err });

  const { bullets, jobTitle, jobDescription } = req.body;

  if (!Array.isArray(bullets) || bullets.length === 0) {
    return res.status(400).json({ error: 'bullets must be a non-empty array' });
  }
  if (bullets.length > 10) {
    return res.status(400).json({ error: 'Maximum 10 bullets per request' });
  }

  try {
    const { system, user } = bulletRewritePrompt({ bullets, jobTitle, jobDescription });
    const result = await callAIWithRetry(system, user, 1000);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('rewrite-bullets error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// POST /api/ai/improve-summary
// Body: { summary: string, jobTitle?, skills?: string[], jobDescription? }
// ============================================================
router.post('/improve-summary', async (req, res) => {
  const err = requireFields(req.body, ['summary']);
  if (err) return res.status(400).json({ error: err });

  const { summary, jobTitle, skills, jobDescription } = req.body;

  if (summary.trim().length < 10) {
    return res.status(400).json({ error: 'Summary is too short to improve' });
  }

  try {
    const { system, user } = summaryImprovePrompt({ summary, jobTitle, skills, jobDescription });
    const result = await callAIWithRetry(system, user, 600);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('improve-summary error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// POST /api/ai/action-verbs
// Body: { jobTitle?, currentVerbs?: string[], category? }
// ============================================================
router.post('/action-verbs', async (req, res) => {
  const { jobTitle, currentVerbs, category } = req.body;

  try {
    const { system, user } = actionVerbsPrompt({ jobTitle, currentVerbs, category });
    const result = await callAIWithRetry(system, user, 600);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('action-verbs error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// POST /api/ai/missing-skills
// Body: { currentSkills: string[], jobTitle?, jobDescription?, industry? }
// ============================================================
router.post('/missing-skills', async (req, res) => {
  const { currentSkills, jobTitle, jobDescription, industry } = req.body;

  try {
    const { system, user } = missingSkillsPrompt({ currentSkills, jobTitle, jobDescription, industry });
    const result = await callAIWithRetry(system, user, 800);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('missing-skills error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// POST /api/ai/optimize-ats
// Body: { resumeText: string, score: number, issues?: string[], jobDescription?, missingSections? }
// ============================================================
router.post('/optimize-ats', async (req, res) => {
  const err = requireFields(req.body, ['resumeText', 'score']);
  if (err) return res.status(400).json({ error: err });

  const { resumeText, score, issues, jobDescription, missingSections } = req.body;

  try {
    const { system, user } = atsOptimizePrompt({ resumeText, score, issues, jobDescription, missingSections });
    const result = await callAIWithRetry(system, user, 1000);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('optimize-ats error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// POST /api/ai/full-improvement
// Body: { resumeText: string, score: number, jobTitle?, jobDescription?, issues? }
// ============================================================
router.post('/full-improvement', async (req, res) => {
  const err = requireFields(req.body, ['resumeText', 'score']);
  if (err) return res.status(400).json({ error: err });

  const { resumeText, score, jobTitle, jobDescription, issues } = req.body;

  try {
    const { system, user } = fullImprovementPrompt({ resumeText, score, jobTitle, jobDescription, issues });
    const result = await callAIWithRetry(system, user, 1400);
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('full-improvement error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ============================================================
// GET /api/ai/status — Check if AI is configured
// ============================================================
router.get('/status', (req, res) => {
  const configured = !!(
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
  );
  res.json({
    configured,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    message: configured
      ? 'AI features are ready'
      : 'Add OPENAI_API_KEY to backend/.env to enable AI features',
  });
});

module.exports = router;
