// ============================================================
// models/Analysis.js — MongoDB schema for ATS analysis results
// Supports 7-category scoring:
//   contact(10) + skills(20) + education(15) + experience(20)
//   + projects(15) + structure(10) + keywords(10) = 100
// ============================================================

const mongoose = require('mongoose');

// Reusable sub-schema for a scored category
const CategoryScore = {
  score: { type: Number, default: 0 },
  max:   { type: Number, default: 0 },
};

const AnalysisSchema = new mongoose.Schema(
  {
    // ── File metadata ───────────────────────────────────────
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    resumeText:     { type: String, required: true },  // excluded from list queries
    jobDescription: { type: String, default: '' },

    // ── Overall score ───────────────────────────────────────
    score:      { type: Number, required: true, min: 0, max: 100 },
    scoreLabel: { type: String }, // Excellent / Good / Needs Improvement / Poor

    // ── Flat section scores for quick dashboards ────────────
    sectionScores: {
      contact:    { type: Number, default: 0 },
      skills:     { type: Number, default: 0 },
      education:  { type: Number, default: 0 },
      experience: { type: Number, default: 0 },
      projects:   { type: Number, default: 0 },
      structure:  { type: Number, default: 0 },
      keywords:   { type: Number, default: 0 },
    },

    // ── Full breakdown (score + max + label per category) ───
    breakdown: {
      contact:    { ...CategoryScore },
      skills:     { ...CategoryScore },
      education:  { ...CategoryScore },
      experience: { ...CategoryScore },
      projects:   { ...CategoryScore },
      structure:  { ...CategoryScore },
      keywords:   { ...CategoryScore },
    },

    // ── Strengths and weaknesses arrays ────────────────────
    strengths: [{
      category: String,
      score: Number,
      max: Number,
      detail: String,
    }],
    weaknesses: [{
      category: String,
      score: Number,
      max: Number,
      detail: String,
    }],

    // ── Improvement suggestions ─────────────────────────────
    suggestions: [{
      category: String,
      priority: String,   // High | Medium | Low
      message:  String,
    }],

    // ── Keyword analysis ────────────────────────────────────
    matchedKeywords: [String],
    missingKeywords: [String],
    keywordMatch: {
      matchPercent:    Number,
      matchedKeywords: [String],
      missingKeywords: [String],
      totalJdKeywords: Number,
    },

    // ── Meta / detection results ────────────────────────────
    wordCount: Number,
    sectionsFound:   { type: Map, of: Boolean },
    missingSections: [String],
    contactInfo: {
      email:    Boolean,
      phone:    Boolean,
      linkedin: Boolean,
      location: Boolean,
    },

    // ── Backward-compat fields (kept for history display) ───
    contactIssues:   [String],
    formattingIssues:[String],
    skillsIssues:    [String],
    weakSkillsFound: [String],
    actionVerbsFound:[String],
  },
  { timestamps: true }
);

// Index for fast history queries
AnalysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Analysis', AnalysisSchema);
