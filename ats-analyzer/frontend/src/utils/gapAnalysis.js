// ============================================================
// utils/gapAnalysis.js — Frontend Resume vs JD Gap Analysis helper
// ============================================================

/**
 * Evaluates the experience gap between the job description and candidate resume.
 */
export const checkExperienceGap = (experienceReqs = [], resumeText = '') => {
  if (!resumeText) {
    return {
      required: 'Not specified',
      candidate: 'No resume text provided',
      status: 'warning',
      details: 'Please paste or upload your resume for comparison.',
    };
  }

  // Find min years required from experienceReqs
  let minYearsRequired = 0;
  let requiredText = '';
  let levelRequired = '';

  for (const req of experienceReqs) {
    if (req.type === 'years' || req.type === 'min_years') {
      if (req.value > minYearsRequired) {
        minYearsRequired = req.value;
        requiredText = `${req.value}+ years`;
      }
    } else if (req.type === 'range') {
      if (req.min > minYearsRequired) {
        minYearsRequired = req.min;
        requiredText = `${req.min}-${req.max} years`;
      }
    } else if (req.type === 'level') {
      levelRequired = req.value;
    }
  }

  if (!requiredText && levelRequired) {
    requiredText = `${levelRequired.charAt(0).toUpperCase() + levelRequired.slice(1)} level`;
  }

  if (!requiredText) {
    requiredText = 'Not explicitly specified';
  }

  // Extract years from candidate's resume
  let candidateYears = 0;
  const yearsMatches = [...resumeText.matchAll(/(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp|work)/gi)];
  for (const m of yearsMatches) {
    const val = parseInt(m[1]);
    if (val > candidateYears && val < 40) candidateYears = val;
  }

  const dateRanges = [...resumeText.matchAll(/\b(20\d{2}|19\d{2})\s*[-–]\s*(20\d{2}|present|current)\b/gi)];
  let calculatedYears = 0;
  const currentYear = new Date().getFullYear();
  for (const r of dateRanges) {
    const start = parseInt(r[1]);
    const end = r[2].toLowerCase().includes('pres') || r[2].toLowerCase().includes('curr') ? currentYear : parseInt(r[2]);
    if (end >= start) {
      calculatedYears += (end - start);
    }
  }

  candidateYears = Math.max(candidateYears, calculatedYears);

  // Check if seniority level matches
  let candidateLevel = '';
  const lowerResume = resumeText.toLowerCase();
  if (/\b(lead|principal|architect|director|manager)\b/i.test(lowerResume)) {
    candidateLevel = 'Senior/Lead';
  } else if (/\b(senior|sr\.?)\b/i.test(lowerResume)) {
    candidateLevel = 'Senior';
  } else if (/\b(junior|jr\.?|intern|entry)\b/i.test(lowerResume)) {
    candidateLevel = 'Junior/Entry';
  } else {
    candidateLevel = 'Mid-Level';
  }

  let status = 'match';
  let details = '';

  if (minYearsRequired > 0) {
    if (candidateYears >= minYearsRequired) {
      status = 'match';
      details = `You have ~${candidateYears} years of experience, which meets or exceeds the required ${requiredText}.`;
    } else if (candidateYears > 0) {
      status = 'warning';
      details = `The job requires ${requiredText}, but your resume indicates ~${candidateYears} years.`;
    } else {
      status = 'missing';
      details = `The job requires ${requiredText}, but no clear years of experience were detected. Consider adding explicit years of experience.`;
    }
  } else {
    status = 'match';
    details = `No specific years of experience required. Your profile suggests a ${candidateLevel} level.`;
  }

  return {
    required: requiredText,
    candidate: candidateYears > 0 ? `${candidateYears} years (${candidateLevel})` : `${candidateLevel} level`,
    status,
    details,
  };
};

/**
 * Evaluates the education gap between the job description and candidate resume.
 */
export const checkEducationGap = (educationReqs = [], resumeText = '') => {
  if (!resumeText) {
    return {
      required: 'Not specified',
      candidate: 'No resume text provided',
      status: 'warning',
      details: 'Please paste or upload your resume for comparison.',
    };
  }

  if (educationReqs.length === 0) {
    return {
      required: 'Not explicitly specified',
      candidate: 'Detected: ' + (extractResumeEducation(resumeText).join(', ') || 'None'),
      status: 'match',
      details: 'No specific educational degree required for this role.',
    };
  }

  // Required education degrees
  const reqLower = educationReqs.map(e => e.toLowerCase());

  let isPhDRequired = reqLower.some(e => e.includes('phd') || e.includes('ph.d') || e.includes('doctorate') || e.includes('doctoral'));
  let isMasterRequired = reqLower.some(e => e.includes('master') || e.includes('ms') || e.includes('m.tech') || e.includes('mba') || e.includes('m.sc'));
  let isBachelorRequired = reqLower.some(e => e.includes('bachelor') || e.includes('bs') || e.includes('b.e') || e.includes('b.tech') || e.includes('b.sc') || e.includes('degree'));

  const requiredText = educationReqs.join(', ');

  // Extract candidate's education
  const candidateDegrees = [];
  const lowerResume = resumeText.toLowerCase();
  if (/\b(ph\.?d|doctorate|doctoral)\b/i.test(lowerResume)) {
    candidateDegrees.push('PhD');
  }
  if (/\b(master|m\.?s\b|m\.?tech|m\.?b\.?a|m\.?sc|m\.?a\b)\b/i.test(lowerResume)) {
    candidateDegrees.push("Master's");
  }
  if (/\b(bachelor|b\.?s\b|b\.?e\b|b\.?tech|b\.?sc|b\.?a\b|degree)\b/i.test(lowerResume)) {
    candidateDegrees.push("Bachelor's");
  }

  let status = 'match';
  let details = '';

  const candidateHighest = candidateDegrees.includes('PhD') ? 'PhD' :
                            candidateDegrees.includes("Master's") ? "Master's" :
                            candidateDegrees.includes("Bachelor's") ? "Bachelor's" : null;

  const requiredHighest = isPhDRequired ? 'PhD' :
                          isMasterRequired ? "Master's" :
                          isBachelorRequired ? "Bachelor's" : null;

  if (requiredHighest) {
    if (candidateHighest) {
      const degreeRank = { "Bachelor's": 1, "Master's": 2, "PhD": 3 };
      if (degreeRank[candidateHighest] >= degreeRank[requiredHighest]) {
        status = 'match';
        details = `Your highest degree (${candidateHighest}) meets the requirement of ${requiredHighest}.`;
      } else {
        status = 'warning';
        details = `The job requires a ${requiredHighest} degree, but your resume lists a ${candidateHighest}.`;
      }
    } else {
      status = 'missing';
      details = `The job requires a ${requiredHighest} degree, but no matching degree was detected.`;
    }
  } else {
    status = 'match';
    details = `Your education details: ${candidateDegrees.join(', ') || 'No degree listed'}. This aligns with the job profile.`;
  }

  return {
    required: requiredText,
    candidate: candidateDegrees.join(', ') || 'Not detected',
    status,
    details,
  };
};

const extractResumeEducation = (text) => {
  const degrees = [];
  const lower = text.toLowerCase();
  if (/\b(ph\.?d|doctorate)\b/i.test(lower)) degrees.push('PhD');
  if (/\b(master|m\.?s|m\.?tech|m\.?b\.?a)\b/i.test(lower)) degrees.push("Master's");
  if (/\b(bachelor|b\.?s|b\.?e|b\.?tech|degree)\b/i.test(lower)) degrees.push("Bachelor's");
  return degrees;
};
