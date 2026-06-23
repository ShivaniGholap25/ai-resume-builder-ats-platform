// ============================================================
// routes/jdRoutes.js — Job Description analysis endpoints
// ============================================================

const express = require('express');
const router  = express.Router();
const { analyzeJobDescription } = require('../services/jdAnalyzer');

// ── Input size guard ──────────────────────────────────────────
const MAX_JD_CHARS     = 15_000;
const MAX_RESUME_CHARS = 20_000;

// ============================================================
// POST /api/jd/analyze
// Analyze a job description (standalone, no resume)
// Body: { jobDescription: string }
// ============================================================
router.post('/analyze', (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription || jobDescription.trim().length < 50) {
    return res.status(400).json({ error: 'Job description must be at least 50 characters.' });
  }

  const jdText = jobDescription.slice(0, MAX_JD_CHARS);

  try {
    const result = analyzeJobDescription(jdText);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('JD analyze error:', err);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// ============================================================
// POST /api/jd/compare
// Compare a job description against a resume text
// Body: { jobDescription: string, resumeText: string }
// ============================================================
router.post('/compare', (req, res) => {
  const { jobDescription, resumeText } = req.body;

  if (!jobDescription || jobDescription.trim().length < 50) {
    return res.status(400).json({ error: 'Job description must be at least 50 characters.' });
  }
  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({ error: 'Resume text must be at least 50 characters.' });
  }

  const jdText  = jobDescription.slice(0, MAX_JD_CHARS);
  const resText = resumeText.slice(0, MAX_RESUME_CHARS);

  try {
    const result = analyzeJobDescription(jdText, resText);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('JD compare error:', err);
    res.status(500).json({ error: 'Comparison failed. Please try again.' });
  }
});

// ============================================================
// POST /api/jd/extract-skills
// Extract only skills from a JD (lightweight endpoint)
// Body: { jobDescription: string }
// ============================================================
router.post('/extract-skills', (req, res) => {
  const { jobDescription } = req.body;

  if (!jobDescription || jobDescription.trim().length < 20) {
    return res.status(400).json({ error: 'Job description too short.' });
  }

  try {
    const result = analyzeJobDescription(jobDescription.slice(0, MAX_JD_CHARS));
    res.json({
      success: true,
      technicalSkills: result.technicalSkills,
      softSkills:      result.softSkills,
      tools:           result.tools,
      keywords:        result.keywords.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ error: 'Skill extraction failed.' });
  }
});

module.exports = router;
