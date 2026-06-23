import { motion } from 'framer-motion';

/* Derive strengths and weaknesses from the analysis result */
export function deriveStrengthsWeaknesses(result) {
  const strengths = [];
  const weaknesses = [];

  const { breakdown = {}, sectionsFound = {}, contactInfo = {},
          formattingIssues = [], skillsIssues = [], keywordMatch } = result;

  // Strengths
  if (breakdown.contact?.score >= 16)   strengths.push({ icon: '📞', text: 'Complete contact information' });
  if (breakdown.sections?.score >= 20)  strengths.push({ icon: '📋', text: 'All key sections present' });
  if (breakdown.formatting?.score >= 16) strengths.push({ icon: '🎨', text: 'Clean, ATS-friendly formatting' });
  if (breakdown.skills?.score >= 12)    strengths.push({ icon: '⚡', text: 'Strong skills section' });
  if (keywordMatch?.matchPercent >= 60) strengths.push({ icon: '🔑', text: `Good keyword match (${keywordMatch.matchPercent}%)` });
  if (sectionsFound?.experience)        strengths.push({ icon: '💼', text: 'Work experience section found' });
  if (sectionsFound?.education)         strengths.push({ icon: '🎓', text: 'Education section present' });
  if (contactInfo?.linkedin)            strengths.push({ icon: '🔗', text: 'LinkedIn profile included' });
  if (result.actionVerbsFound?.length >= 5) strengths.push({ icon: '✍️', text: 'Uses strong action verbs' });

  // Weaknesses
  if (!sectionsFound?.summary)          weaknesses.push({ icon: '📝', text: 'Missing professional summary' });
  if (!sectionsFound?.skills)           weaknesses.push({ icon: '⚡', text: 'No dedicated skills section' });
  if (!contactInfo?.email)              weaknesses.push({ icon: '📧', text: 'Email address missing' });
  if (!contactInfo?.phone)              weaknesses.push({ icon: '📱', text: 'Phone number missing' });
  if (!contactInfo?.linkedin)           weaknesses.push({ icon: '🔗', text: 'LinkedIn profile not found' });
  if (formattingIssues.length > 0)      weaknesses.push({ icon: '🎨', text: `${formattingIssues.length} formatting issue(s) detected` });
  if (skillsIssues.length > 0)          weaknesses.push({ icon: '⚡', text: skillsIssues[0] });
  if (keywordMatch && keywordMatch.matchPercent < 40)
    weaknesses.push({ icon: '🔑', text: `Low keyword match (${keywordMatch.matchPercent}%)` });
  if (result.wordCount < 200)           weaknesses.push({ icon: '📄', text: 'Resume content too sparse' });

  return { strengths: strengths.slice(0, 5), weaknesses: weaknesses.slice(0, 5) };
}

export default function StrengthsWeaknesses({ result }) {
  const { strengths, weaknesses } = deriveStrengthsWeaknesses(result);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Strengths */}
      <div>
        <h4 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Strengths
        </h4>
        <div className="space-y-2">
          {strengths.length === 0 ? (
            <p className="text-xs text-slate-400">No strengths detected yet</p>
          ) : strengths.map((s, i) => (
            <motion.div key={i}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 + 0.1 }}
            >
              <span className="text-base shrink-0">{s.icon}</span>
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium leading-snug">{s.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      <div>
        <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          Weak Areas
        </h4>
        <div className="space-y-2">
          {weaknesses.length === 0 ? (
            <p className="text-xs text-slate-400">No weak areas found 🎉</p>
          ) : weaknesses.map((w, i) => (
            <motion.div key={i}
              className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 + 0.1 }}
            >
              <span className="text-base shrink-0">{w.icon}</span>
              <span className="text-xs text-rose-800 dark:text-rose-300 font-medium leading-snug">{w.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
