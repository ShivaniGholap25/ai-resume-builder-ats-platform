// ============================================================
// server.js — Entry point for the ATS Analyzer Express server
// ============================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./utils/db');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());                          // Allow cross-origin requests from React
app.use(express.json());                  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── Database Connection ─────────────────────────────────────
connectDB();

// ── Routes ──────────────────────────────────────────────────
app.use('/api/analyze',   require('./routes/analyzeRoutes'));
app.use('/api/history',   require('./routes/historyRoutes'));
app.use('/api/ai',        require('./routes/aiRoutes'));
app.use('/api/jd',        require('./routes/jdRoutes'));
app.use('/api/resume',    require('./routes/resumeRoutes')); // Upload & extract

// /api/ats-score — dedicated JSON-body scoring endpoint (no file upload)
app.post('/api/ats-score', (req, res) => {
  const { analyzeResume } = require('./services/atsScorer');
  const { resumeText, jobDescription = '' } = req.body;
  if (!resumeText || resumeText.trim().length < 20) {
    return res.status(400).json({ error: 'resumeText must be at least 20 characters.' });
  }
  try {
    const result = analyzeResume(resumeText.trim(), jobDescription.trim());
    res.json({
      score:          result.score,
      scoreLabel:     result.scoreLabel,
      strengths:      result.strengths,
      weaknesses:     result.weaknesses,
      suggestions:    result.suggestions,
      sectionScores:  result.sectionScores,
      matchedKeywords:result.matchedKeywords,
      missingKeywords:result.missingKeywords,
    });
  } catch (err) {
    console.error('[/api/ats-score] error:', err.message);
    res.status(500).json({ error: 'Scoring failed.' });
  }
});

// ── Health Check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'AI Resume Builder & ATS Optimization API is running ✅' });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// ── Start Server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
