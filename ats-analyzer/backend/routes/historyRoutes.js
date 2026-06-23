// ============================================================
// routes/historyRoutes.js — GET /api/history
// ============================================================

const express = require('express');
const router = express.Router();
const Analysis = require('../models/Analysis');

/**
 * GET /api/history
 * Returns the last 20 analyses (newest first), without full resume text
 */
router.get('/', async (req, res) => {
  try {
    const analyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-resumeText'); // Exclude large text field

    res.json(analyses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

/**
 * GET /api/history/:id
 * Returns a single analysis by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).select('-resumeText');
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

/**
 * DELETE /api/history/:id
 * Delete a single analysis record
 */
router.delete('/:id', async (req, res) => {
  try {
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

module.exports = router;
