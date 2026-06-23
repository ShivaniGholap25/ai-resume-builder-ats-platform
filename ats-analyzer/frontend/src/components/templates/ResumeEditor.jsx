// ============================================================
// ResumeEditor.jsx — Left-panel form for editing resume data
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Tiny reusable field components ───────────────────────────

const Field = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div className="mb-3">
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg
                 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200
                 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
                 focus:border-transparent transition-colors"
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div className="mb-3">
    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg
                 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200
                 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
                 focus:border-transparent transition-colors resize-y"
    />
  </div>
);

// ── Collapsible section ───────────────────────────────────────
const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-3">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span>{icon}</span>{title}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-slate-400 text-xs">▼</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-white dark:bg-slate-900">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Tag input (skills) ────────────────────────────────────────
const TagInput = ({ label, tags, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (i) => onChange(tags.filter((_, idx) => idx !== i));

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="ml-0.5 text-indigo-400 hover:text-rose-500 transition-colors text-xs leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
        <button type="button" onClick={addTag} className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors">Add</button>
      </div>
    </div>
  );
};

// ── Experience entry ──────────────────────────────────────────
const ExpEntry = ({ exp, idx, total, onChange, onRemove, onMove }) => {
  const update = (key, val) => onChange({ ...exp, [key]: val });
  const updateBullet = (i, val) => {
    const bullets = [...(exp.bullets || [])];
    bullets[i] = val;
    update('bullets', bullets);
  };
  const addBullet   = () => update('bullets', [...(exp.bullets || []), '']);
  const removeBullet = (i) => update('bullets', exp.bullets.filter((_, j) => j !== i));

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-3 bg-slate-50 dark:bg-slate-800/60">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Position {idx + 1}</span>
        <div className="flex gap-1">
          {idx > 0         && <button type="button" onClick={() => onMove(idx, idx - 1)} className="p-1 text-slate-400 hover:text-indigo-500 text-xs" title="Move up">↑</button>}
          {idx < total - 1 && <button type="button" onClick={() => onMove(idx, idx + 1)} className="p-1 text-slate-400 hover:text-indigo-500 text-xs" title="Move down">↓</button>}
          <button type="button" onClick={onRemove} className="p-1 text-slate-400 hover:text-rose-500 text-xs" title="Remove">✕</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Job Title"   value={exp.title}    onChange={v => update('title', v)}    placeholder="Software Engineer" required />
        <Field label="Company"     value={exp.company}  onChange={v => update('company', v)}  placeholder="Company Name"      required />
        <Field label="Location"    value={exp.location} onChange={v => update('location', v)} placeholder="City, State / Remote" />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Start" value={exp.start} onChange={v => update('start', v)} placeholder="Jan 2021" />
          <Field label="End"   value={exp.end}   onChange={v => update('end', v)}   placeholder="Present" />
        </div>
      </div>
      <div className="mt-1">
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Bullet Points</label>
        {(exp.bullets || []).map((b, i) => (
          <div key={i} className="flex gap-1.5 mb-1.5">
            <span className="text-slate-400 mt-2 text-xs shrink-0">•</span>
            <input
              value={b}
              onChange={e => updateBullet(i, e.target.value)}
              placeholder="Start with an action verb..."
              className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button type="button" onClick={() => removeBullet(i)} className="text-slate-400 hover:text-rose-500 text-xs shrink-0 mt-1">✕</button>
          </div>
        ))}
        <button type="button" onClick={addBullet} className="mt-1 text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 font-medium">
          + Add bullet point
        </button>
      </div>
    </div>
  );
};

// ── Education entry ───────────────────────────────────────────
const EduEntry = ({ edu, onChange, onRemove }) => {
  const update = (key, val) => onChange({ ...edu, [key]: val });
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-3 bg-slate-50 dark:bg-slate-800/60">
      <div className="flex justify-end mb-1">
        <button type="button" onClick={onRemove} className="text-slate-400 hover:text-rose-500 text-xs">✕ Remove</button>
      </div>
      <Field label="Degree"      value={edu.degree}      onChange={v => update('degree', v)}      placeholder="B.S. Computer Science" required />
      <Field label="Institution" value={edu.institution} onChange={v => update('institution', v)} placeholder="University Name"        required />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Location"  value={edu.location}    onChange={v => update('location', v)}    placeholder="City, State" />
        <Field label="GPA"       value={edu.gpa}         onChange={v => update('gpa', v)}         placeholder="3.8" />
        <Field label="Start Year" value={edu.start}      onChange={v => update('start', v)}       placeholder="2015" />
        <Field label="End Year"   value={edu.end}        onChange={v => update('end', v)}         placeholder="2019" />
      </div>
      <Field label="Honors / Awards" value={edu.honors || ''} onChange={v => update('honors', v)} placeholder="Dean's List, Magna Cum Laude" />
    </div>
  );
};

// ── Project entry ─────────────────────────────────────────────
const ProjEntry = ({ proj, onChange, onRemove }) => {
  const update = (key, val) => onChange({ ...proj, [key]: val });
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 mb-3 bg-slate-50 dark:bg-slate-800/60">
      <div className="flex justify-end mb-1">
        <button type="button" onClick={onRemove} className="text-slate-400 hover:text-rose-500 text-xs">✕ Remove</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Project Name" value={proj.name} onChange={v => update('name', v)} placeholder="Project Name" required />
        <Field label="URL (optional)" value={proj.url || ''} onChange={v => update('url', v)} placeholder="github.com/..." />
      </div>
      <TextArea label="Description" value={proj.description} onChange={v => update('description', v)} placeholder="Describe the project and your impact..." rows={2} />
      <TagInput label="Technologies" tags={proj.tech || []} onChange={v => update('tech', v)} placeholder="React, Node.js…" />
    </div>
  );
};

// ── Cert entry ────────────────────────────────────────────────
const CertEntry = ({ cert, onChange, onRemove }) => {
  const update = (key, val) => onChange({ ...cert, [key]: val });
  return (
    <div className="flex gap-2 items-start mb-2">
      <div className="flex-1 grid grid-cols-3 gap-2">
        <Field label="Name"   value={cert.name}   onChange={v => update('name', v)}   placeholder="AWS Certified…" />
        <Field label="Issuer" value={cert.issuer} onChange={v => update('issuer', v)} placeholder="Amazon"        />
        <Field label="Year"   value={cert.year}   onChange={v => update('year', v)}   placeholder="2023"          />
      </div>
      <button type="button" onClick={onRemove} className="mt-6 text-slate-400 hover:text-rose-500 text-sm shrink-0">✕</button>
    </div>
  );
};

// ── ID generator ──────────────────────────────────────────────
const uid = () => `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

// ============================================================
// MAIN EDITOR COMPONENT
// ============================================================

export default function ResumeEditor({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val });
  const setSkill = (cat, val) => onChange({ ...data, skills: { ...data.skills, [cat]: val } });

  // Experience helpers
  const addExp    = () => set('experience', [...(data.experience || []), { id: uid(), title: '', company: '', location: '', start: '', end: '', bullets: [''] }]);
  const updateExp = (i, val) => set('experience', data.experience.map((e, j) => j === i ? val : e));
  const removeExp = (i) => set('experience', data.experience.filter((_, j) => j !== i));
  const moveExp   = (from, to) => {
    const arr = [...data.experience];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    set('experience', arr);
  };

  // Education helpers
  const addEdu    = () => set('education', [...(data.education || []), { id: uid(), degree: '', institution: '', location: '', start: '', end: '', gpa: '', honors: '' }]);
  const updateEdu = (i, val) => set('education', data.education.map((e, j) => j === i ? val : e));
  const removeEdu = (i) => set('education', data.education.filter((_, j) => j !== i));

  // Project helpers
  const addProj    = () => set('projects', [...(data.projects || []), { id: uid(), name: '', url: '', description: '', tech: [] }]);
  const updateProj = (i, val) => set('projects', data.projects.map((p, j) => j === i ? val : p));
  const removeProj = (i) => set('projects', data.projects.filter((_, j) => j !== i));

  // Cert helpers
  const addCert    = () => set('certifications', [...(data.certifications || []), { id: uid(), name: '', issuer: '', year: '' }]);
  const updateCert = (i, val) => set('certifications', data.certifications.map((c, j) => j === i ? val : c));
  const removeCert = (i) => set('certifications', data.certifications.filter((_, j) => j !== i));

  return (
    <div className="space-y-0 text-sm">
      {/* Personal Info */}
      <Section title="Personal Info" icon="👤" defaultOpen>
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Full Name"   value={data.name}     onChange={v => set('name', v)}     placeholder="Your Name"   required />
          <Field label="Job Title"   value={data.title}    onChange={v => set('title', v)}    placeholder="Software Engineer" />
          <Field label="Email"       value={data.email}    onChange={v => set('email', v)}    placeholder="you@email.com" type="email" required />
          <Field label="Phone"       value={data.phone}    onChange={v => set('phone', v)}    placeholder="+1 (555) 000-0000" />
          <Field label="Location"    value={data.location} onChange={v => set('location', v)} placeholder="City, State" />
          <Field label="LinkedIn"    value={data.linkedin} onChange={v => set('linkedin', v)} placeholder="linkedin.com/in/you" />
          <Field label="GitHub"      value={data.github}   onChange={v => set('github', v)}   placeholder="github.com/you" />
          <Field label="Website"     value={data.website}  onChange={v => set('website', v)}  placeholder="yoursite.com" />
        </div>
      </Section>

      {/* Summary */}
      <Section title="Professional Summary" icon="📝">
        <TextArea
          label=""
          value={data.summary}
          onChange={v => set('summary', v)}
          placeholder="3–4 sentence overview of your career, key achievements, and target role…"
          rows={4}
        />
        <p className="text-xs text-slate-400 -mt-1">💡 Keep to 3 sentences. Start with your title and years of experience.</p>
      </Section>

      {/* Experience */}
      <Section title={`Work Experience (${data.experience?.length || 0})`} icon="💼">
        {(data.experience || []).map((exp, i) => (
          <ExpEntry key={exp.id} exp={exp} idx={i} total={data.experience.length}
            onChange={v => updateExp(i, v)} onRemove={() => removeExp(i)} onMove={moveExp} />
        ))}
        <button type="button" onClick={addExp}
          className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
          + Add Position
        </button>
      </Section>

      {/* Education */}
      <Section title={`Education (${data.education?.length || 0})`} icon="🎓">
        {(data.education || []).map((edu, i) => (
          <EduEntry key={edu.id} edu={edu} onChange={v => updateEdu(i, v)} onRemove={() => removeEdu(i)} />
        ))}
        <button type="button" onClick={addEdu}
          className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
          + Add Education
        </button>
      </Section>

      {/* Skills */}
      <Section title="Skills" icon="⚡">
        <TagInput label="Technical Skills"   tags={data.skills?.technical || []} onChange={v => setSkill('technical', v)} placeholder="Python, React, SQL…"     />
        <TagInput label="Tools & Platforms"  tags={data.skills?.tools     || []} onChange={v => setSkill('tools', v)}     placeholder="Docker, AWS, Git…"       />
        <TagInput label="Soft Skills"        tags={data.skills?.soft      || []} onChange={v => setSkill('soft', v)}      placeholder="Leadership, Agile…"      />
        <p className="text-xs text-slate-400 mt-1">💡 Press Enter or click Add after each skill.</p>
      </Section>

      {/* Projects */}
      <Section title={`Projects (${data.projects?.length || 0})`} icon="🚀" defaultOpen={false}>
        {(data.projects || []).map((proj, i) => (
          <ProjEntry key={proj.id} proj={proj} onChange={v => updateProj(i, v)} onRemove={() => removeProj(i)} />
        ))}
        <button type="button" onClick={addProj}
          className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
          + Add Project
        </button>
      </Section>

      {/* Certifications */}
      <Section title={`Certifications (${data.certifications?.length || 0})`} icon="🏅" defaultOpen={false}>
        {(data.certifications || []).map((cert, i) => (
          <CertEntry key={cert.id} cert={cert} onChange={v => updateCert(i, v)} onRemove={() => removeCert(i)} />
        ))}
        <button type="button" onClick={addCert}
          className="w-full py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
          + Add Certification
        </button>
      </Section>
    </div>
  );
}
