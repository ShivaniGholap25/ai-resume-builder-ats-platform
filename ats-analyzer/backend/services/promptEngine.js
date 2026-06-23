// ============================================================
// services/promptEngine.js — All prompt templates for AI features
// ============================================================

/**
 * Each builder returns a { system, user } object.
 * Keeping prompts in one place makes them easy to tune.
 */

const SYSTEM_BASE = `You are an expert resume writer and ATS optimization specialist with 15+ years of experience.
You write concise, professional, and impactful resume content.
Always respond with valid JSON only — no markdown fences, no extra text.`;

// ── 1. Rewrite bullet points ──────────────────────────────────
const bulletRewritePrompt = ({ bullets, jobTitle = '', jobDescription = '' }) => ({
  system: SYSTEM_BASE,
  user: `Rewrite the following resume bullet points to be stronger, more ATS-friendly, and results-focused.
Use the STAR method (Situation, Task, Action, Result) where possible.
Start each bullet with a strong action verb.
Keep each bullet under 20 words.
${jobTitle ? `Target role: ${jobTitle}` : ''}
${jobDescription ? `Job description context:\n${jobDescription.slice(0, 400)}` : ''}

Bullets to rewrite:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Respond with JSON:
{
  "rewrites": [
    { "original": "...", "improved": "...", "reason": "brief explanation" }
  ]
}`,
});

// ── 2. Improve summary ────────────────────────────────────────
const summaryImprovePrompt = ({ summary, jobTitle = '', skills = [], jobDescription = '' }) => ({
  system: SYSTEM_BASE,
  user: `Rewrite this resume professional summary to be more compelling, ATS-optimized, and tailored.
Keep it to 3 sentences max. Use keywords naturally. Be specific, not generic.
${jobTitle ? `Target role: ${jobTitle}` : ''}
${skills.length ? `Key skills to include: ${skills.slice(0, 8).join(', ')}` : ''}
${jobDescription ? `Job description context:\n${jobDescription.slice(0, 400)}` : ''}

Original summary:
"${summary}"

Respond with JSON:
{
  "improved": "...",
  "changes": ["change 1", "change 2", "change 3"],
  "keywords_added": ["keyword1", "keyword2"]
}`,
});

// ── 3. Generate action verbs ──────────────────────────────────
const actionVerbsPrompt = ({ currentVerbs = [], jobTitle = '', category = 'general' }) => ({
  system: SYSTEM_BASE,
  user: `Generate 20 strong, ATS-friendly action verbs for a resume.
${jobTitle ? `Role: ${jobTitle}` : ''}
Category: ${category}
${currentVerbs.length ? `Avoid these already used: ${currentVerbs.join(', ')}` : ''}

Group them by impact type. Respond with JSON:
{
  "verbs": {
    "leadership": ["Led", "Directed", "..."],
    "technical":  ["Engineered", "Architected", "..."],
    "analytical": ["Analyzed", "Optimized", "..."],
    "creative":   ["Designed", "Developed", "..."],
    "collaborative": ["Collaborated", "Partnered", "..."]
  },
  "top_picks": ["verb1", "verb2", "verb3", "verb4", "verb5"]
}`,
});

// ── 4. Suggest missing skills ─────────────────────────────────
const missingSkillsPrompt = ({ currentSkills = [], jobTitle = '', jobDescription = '', industry = '' }) => ({
  system: SYSTEM_BASE,
  user: `Analyze this resume's skill set and suggest missing skills that would improve ATS score and job fit.
${jobTitle ? `Target role: ${jobTitle}` : ''}
${industry ? `Industry: ${industry}` : ''}
${jobDescription ? `Job description:\n${jobDescription.slice(0, 600)}` : ''}

Current skills on resume: ${currentSkills.slice(0, 20).join(', ') || 'None listed'}

Respond with JSON:
{
  "missing_technical": [
    { "skill": "...", "importance": "high|medium|low", "reason": "..." }
  ],
  "missing_soft": [
    { "skill": "...", "importance": "high|medium|low", "reason": "..." }
  ],
  "missing_certifications": ["cert1", "cert2"],
  "priority_skills": ["skill1", "skill2", "skill3"]
}`,
});

// ── 5. ATS optimization tips ──────────────────────────────────
const atsOptimizePrompt = ({ resumeText, score, issues = [], jobDescription = '', missingSections = [] }) => ({
  system: SYSTEM_BASE,
  user: `Analyze this resume for ATS optimization and provide specific, actionable improvements.
Current ATS score: ${score}/100
${missingSections.length ? `Missing sections: ${missingSections.join(', ')}` : ''}
${issues.length ? `Known issues: ${issues.slice(0, 5).join('; ')}` : ''}
${jobDescription ? `Target job description:\n${jobDescription.slice(0, 500)}` : ''}

Resume excerpt (first 800 chars):
${resumeText.slice(0, 800)}

Respond with JSON:
{
  "quick_wins": [
    { "action": "...", "impact": "high|medium|low", "effort": "easy|medium|hard" }
  ],
  "formatting_fixes": ["fix1", "fix2"],
  "keyword_recommendations": ["keyword1", "keyword2", "keyword3"],
  "section_improvements": [
    { "section": "...", "current_issue": "...", "recommendation": "..." }
  ],
  "estimated_score_gain": 0
}`,
});

// ── 6. Full AI improvement report ────────────────────────────
const fullImprovementPrompt = ({ resumeText, score, jobTitle = '', jobDescription = '', issues = [] }) => ({
  system: SYSTEM_BASE,
  user: `You are reviewing a resume with ATS score ${score}/100.
${jobTitle ? `Target role: ${jobTitle}` : ''}
${jobDescription ? `Job description:\n${jobDescription.slice(0, 500)}` : ''}
${issues.length ? `Detected issues: ${issues.slice(0, 6).join('; ')}` : ''}

Resume (first 1000 chars):
${resumeText.slice(0, 1000)}

Provide a comprehensive improvement plan. Respond with JSON:
{
  "overall_assessment": "2-3 sentence honest assessment",
  "top_3_priorities": ["priority1", "priority2", "priority3"],
  "rewrite_suggestions": [
    { "type": "summary|bullet|skills|section", "original": "...", "improved": "...", "reason": "..." }
  ],
  "ats_score_breakdown": {
    "current_score": ${score},
    "potential_score": 0,
    "score_gap_reason": "..."
  },
  "tailoring_tips": ["tip1", "tip2", "tip3"]
}`,
});

module.exports = {
  bulletRewritePrompt,
  summaryImprovePrompt,
  actionVerbsPrompt,
  missingSkillsPrompt,
  atsOptimizePrompt,
  fullImprovementPrompt,
};
