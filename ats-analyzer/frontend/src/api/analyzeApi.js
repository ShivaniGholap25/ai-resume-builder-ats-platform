// ============================================================
// api/analyzeApi.js — ATS Analyzer API calls
// ============================================================

import axios from 'axios';

const BASE = 'http://localhost:5000/api';

/**
 * Upload resume file + optional JD for full ATS analysis.
 * Uses POST /api/analyze (multipart/form-data).
 */
export const analyzeResume = async (file, jobDescription = '') => {
  const form = new FormData();
  form.append('resume', file);
  form.append('jobDescription', jobDescription);
  const res = await axios.post(`${BASE}/analyze`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * Score raw resume text (no file needed).
 * Uses POST /api/ats-score.
 * Returns: { score, scoreLabel, strengths, weaknesses,
 *            suggestions, sectionScores,
 *            matchedKeywords, missingKeywords }
 */
export const getATSScore = async (resumeText, jobDescription = '') => {
  const res = await axios.post(`${BASE}/ats-score`, { resumeText, jobDescription });
  return res.data;
};

/** Fetch last 20 analysis records (history). */
export const fetchHistory = async () => {
  const res = await axios.get(`${BASE}/history`);
  return res.data;
};

/** Delete a history record by ID. */
export const deleteAnalysis = async (id) => {
  const res = await axios.delete(`${BASE}/history/${id}`);
  return res.data;
};
