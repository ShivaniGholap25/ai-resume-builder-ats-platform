// ============================================================
// routes/analyzeRoutes.js
//
// POST /api/analyze      — upload file → extract → score → save
// POST /api/analyze/text — score raw text (no file upload)
// ============================================================

const express  = require('express');
const router   = express.Router();
const upload   = require('../middleware/upload');
const { extractText }   = require('../services/resumeParser');
const { analyzeResume } = require('../services/atsScorer');
const Analysis = require('../models/Analysis');

// ── Helper: persist analysis to MongoDB ──────────────────────
async function saveAnalysis(fileName, fileType, resumeText, jobDescription, result) {
  return Analysis.create({
    fileName, fileType, resumeText, jobDescription,
    score:          result.score,
    scoreLabel:     result.scoreLabel,
    sectionScores:  result.sectionScores,
    breakdown:      result.breakdown,
    strengths:      result.strengths,
    weaknesses:     result.weaknesses,
    suggestions:    result.suggestions,
    matchedKeywords:result.matchedKeywords,
    missingKeywords:result.missingKeywords,
    keywordMatch:   result.keywordMatch,
    wordCount:      result.wordCount,
    sectionsFound:  result.sectionsFound,
    missingSections:result.missingSections,
    contactInfo:    result.contactInfo,
    contactIssues:  result.contactIssues,
    formattingIssues:result.formattingIssues,
    skillsIssues:   result.skillsIssues,
    weakSkillsFound:result.weakSkillsFound,
    actionVerbsFound:result.actionVerbsFound,
  });
}

// ============================================================
// POST /api/analyze
// multipart/form-data: resume (file) + jobDescription (text)
// ============================================================
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a resume file (PDF or DOCX).' });
    }

    const { buffer, mimetype, originalname } = req.file;
    const jobDescription = (req.body.jobDescription || '').trim();

    // Extract text from PDF or DOCX
    let resumeText;
    try {
      resumeText = await extractText(buffer, mimetype);
    } catch (e) {
      return res.status(422).json({ error: `Could not parse file: ${e.message}` });
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return res.status(422).json({
        error: 'Could not extract readable text. Ensure the file is not a scanned image.',
      });
    }

    // Run the 7-category ATS engine
    const result   = analyzeResume(resumeText, jobDescription);
    const fileType = mimetype === 'application/pdf' ? 'pdf' : 'docx';

    // Persist to MongoDB
    const saved = await saveAnalysis(originalname, fileType, resumeText, jobDescription, result);

    res.status(200).json({ id: saved._id, fileName: originalname, ...result });

  } catch (err) {
    console.error('[/api/analyze] error:', err.message);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// ============================================================
// POST /api/analyze/text  (alias: POST /api/ats-score)
// JSON body: { resumeText, jobDescription? }
// Returns the structured ATS report without saving to DB.
// Useful for quick text-based scoring from the frontend.
// ============================================================
router.post('/text', (req, res) => {
  const { resumeText, jobDescription = '' } = req.body;

  if (!resumeText || resumeText.trim().length < 20) {
    return res.status(400).json({ error: 'resumeText must be at least 20 characters.' });
  }

  try {
    const result = analyzeResume(resumeText.trim(), jobDescription.trim());
    res.json(result);
  } catch (err) {
    console.error('[/api/analyze/text] error:', err.message);
    res.status(500).json({ error: 'Scoring failed. Please try again.' });
  }
});

module.exports = router;
