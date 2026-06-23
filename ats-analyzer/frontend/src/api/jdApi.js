// ============================================================
// api/jdApi.js — Job Description analyzer API calls
// ============================================================

import axios from 'axios';

const BASE = 'http://localhost:5000/api/jd';

/** Analyze a job description standalone */
export const analyzeJD = (jobDescription) =>
  axios.post(`${BASE}/analyze`, { jobDescription }).then(r => r.data);

/** Compare JD against resume text */
export const compareJDWithResume = (jobDescription, resumeText) =>
  axios.post(`${BASE}/compare`, { jobDescription, resumeText }).then(r => r.data);

/** Extract only skills from a JD */
export const extractJDSkills = (jobDescription) =>
  axios.post(`${BASE}/extract-skills`, { jobDescription }).then(r => r.data);
