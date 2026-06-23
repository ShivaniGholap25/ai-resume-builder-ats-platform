// ============================================================
// api/aiApi.js — All AI improvement API calls
// ============================================================

import axios from 'axios';

const BASE = 'http://localhost:5000/api/ai';

const ai = axios.create({ baseURL: BASE, timeout: 30_000 });

/** Check if AI is configured on the backend */
export const checkAIStatus = () =>
  ai.get('/status').then(r => r.data);

/** Rewrite weak bullet points */
export const rewriteBullets = (bullets, jobTitle = '', jobDescription = '') =>
  ai.post('/rewrite-bullets', { bullets, jobTitle, jobDescription }).then(r => r.data);

/** Improve professional summary */
export const improveSummary = (summary, jobTitle = '', skills = [], jobDescription = '') =>
  ai.post('/improve-summary', { summary, jobTitle, skills, jobDescription }).then(r => r.data);

/** Get strong action verbs */
export const getActionVerbs = (jobTitle = '', currentVerbs = [], category = 'general') =>
  ai.post('/action-verbs', { jobTitle, currentVerbs, category }).then(r => r.data);

/** Suggest missing skills */
export const getMissingSkills = (currentSkills = [], jobTitle = '', jobDescription = '', industry = '') =>
  ai.post('/missing-skills', { currentSkills, jobTitle, jobDescription, industry }).then(r => r.data);

/** Get ATS optimization tips */
export const optimizeATS = (resumeText, score, issues = [], jobDescription = '', missingSections = []) =>
  ai.post('/optimize-ats', { resumeText, score, issues, jobDescription, missingSections }).then(r => r.data);

/** Full AI improvement report */
export const getFullImprovement = (resumeText, score, jobTitle = '', jobDescription = '', issues = []) =>
  ai.post('/full-improvement', { resumeText, score, jobTitle, jobDescription, issues }).then(r => r.data);
